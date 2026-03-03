import { RaynaApiService } from "./rayna-api.service";
import { SessionService } from "./session.service";
import { createLLMProvider, LLMProvider } from "./llm.provider";
import { ALL_TOOLS, ToolName } from "./tools";
import { SYSTEM_PROMPT } from "./prompts/system.prompt";
import { RAGService } from "../rag/rag.service";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { isDBConnected } from "../config/database";

// ─────────────────────────────────────────────────────────
// ChatService — The core orchestrator
//
// Flow per message:
// 1. Load session history (last N messages)
// 2. Add user message
// 3. Call LLM → if tool_use: execute tools → loop back
// 4. Save assistant reply to session
// 5. Return final text to controller
// ─────────────────────────────────────────────────────────
export class ChatService {
  private llm: LLMProvider;
  private raynaApi: RaynaApiService;
  private sessionService: SessionService;
  private ragService: RAGService;

  constructor() {
    this.llm = createLLMProvider();
    this.raynaApi = new RaynaApiService();
    this.sessionService = new SessionService();
    this.ragService = new RAGService();
  }

    // ── Main chat method ──────────────────────────────────────
  async chat(
    sessionId: string,
    userMessage: string,
    userId?: string
  ): Promise<{ reply: string; sessionId: string; tourCarousel?: any; metadata?: any }> {

    // 1. Save user message to in-memory session
    this.sessionService.addMessage(
      sessionId,
      { role: "user", content: userMessage },
      userId
    );

    // 1b. Persist user message + upsert conversation to MongoDB
    if (isDBConnected()) {
      // Upsert conversation (create if new, update timestamp if exists)
      Conversation.findOneAndUpdate(
        { session_id: sessionId },
        {
          $setOnInsert: {
            session_id: sessionId,
            // Use first 60 chars of user's first message as the conversation title
            title: userMessage.slice(0, 60),
            created_at: new Date(),
          },
          $inc: { message_count: 1 },
          $set: { updated_at: new Date() },
        },
        { upsert: true, new: true }
      ).catch((err) => console.error("[DB] Failed to upsert conversation:", err));

      Message.create({
        session_id: sessionId,
        role: "user",
        content: userMessage,
      }).catch((err) => console.error("[DB] Failed to save user message:", err));
    }

    // 2. Get context for LLM (last N messages)
    const messages = this.sessionService.getContext(sessionId);

    // 3. Agentic loop — keeps running until LLM returns final text
    const result = await this.runAgentLoop(messages, sessionId);

    return result;
  }

  // ── Agentic loop ──────────────────────────────────────────
  // Handles multi-step tool calling automatically
  // e.g. "Dubai tours under 200 AED" might trigger:
  //   → get_available_cities → get_all_products → response
    private async runAgentLoop(
    messages: Array<{ role: "user" | "assistant"; content: unknown }>,
    sessionId: string
    ): Promise<{ reply: string; sessionId: string; tourCarousel?: any; metadata?: any }> {
    const MAX_ITERATIONS = 5; // safety cap — prevents infinite loops
    let iterations = 0;
    let tourCarousel: any = null;
    let metadata: any = null;

        while (iterations < MAX_ITERATIONS) {
      iterations++;
      console.log(`[ChatService] Agent loop iteration ${iterations}`);

      // Get enhanced system prompt with RAG context if enabled
      const userQuery = this.extractLatestUserMessage(messages);
      const enhancedSystemPrompt = await this.ragService.getEnhancedSystemPrompt(SYSTEM_PROMPT, userQuery);

      const response = await this.llm.chat(messages, enhancedSystemPrompt, ALL_TOOLS);

      // Add LLM response to local message array for next iteration
      messages.push({ role: "assistant", content: response.rawContent });

            // ── LLM is done — return the final text ────────────────
      if (!this.llm.isToolUse(response)) {
        // Save final assistant reply to in-memory session
        this.sessionService.addMessage(sessionId, {
          role: "assistant",
          content: response.text,
        });

        // Persist assistant reply to MongoDB
        if (isDBConnected()) {
          Message.create({
            session_id: sessionId,
            role: "assistant",
            content: response.text,
            tourCarousel: tourCarousel ?? null,
          }).catch((err) => console.error("[DB] Failed to save assistant message:", err));

          // Increment message count for the assistant reply
          Conversation.findOneAndUpdate(
            { session_id: sessionId },
            { $inc: { message_count: 1 }, $set: { updated_at: new Date() } }
          ).catch((err) => console.error("[DB] Failed to update conversation count:", err));
        }

        return {
          reply: response.text,
          sessionId,
          tourCarousel,
          metadata
        };
      }

      // ── LLM wants to call tools ────────────────────────────
      const toolCalls = this.llm.extractToolCalls(response);
      console.log(`[ChatService] Tool calls requested:`, toolCalls.map((t) => t.name));

            // Execute all tool calls in parallel (faster than sequential)
      const toolResults = await Promise.all(
        toolCalls.map(async (call) => {
          const result = await this.raynaApi.execute(
            call.name as ToolName,
            call.input,
            sessionId
          );
          
          // Check if this was a tour cards tool call
          if (call.name === 'get_tour_cards' && result) {
            try {
              const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
              if (parsedResult.success && parsedResult.data && parsedResult.data.carousel) {
                tourCarousel = parsedResult.data.carousel;
                metadata = {
                  hasCards: true,
                  cardCount: parsedResult.data.carousel.cards?.length || 0,
                  totalResults: parsedResult.data.totalResults || 0
                };
                console.log(`[ChatService] Tour cards retrieved: ${metadata.cardCount} cards`);
              }
            } catch (error) {
              console.error('[ChatService] Error parsing tour cards result:', error);
            }
          }
          
          console.log(`[ChatService] Tool "${call.name}" completed`);
          return { id: call.id, content: typeof result === 'string' ? result : JSON.stringify(result) };
        })
      );

      // Feed tool results back to LLM — loop continues
      const toolResultMessage = this.llm.buildToolResultMessage(toolResults);
      messages.push(toolResultMessage);
    }

        // Safety fallback — should rarely happen
    console.warn("[ChatService] Max iterations reached");
    return {
      reply: "I'm having trouble processing that right now. Please try again or visit raynatours.com for assistance.",
      sessionId,
      tourCarousel,
      metadata
    };
  }

  // ── Extract latest user message for RAG context ──────────────────────────────
  private extractLatestUserMessage(messages: Array<{ role: "user" | "assistant"; content: unknown }>): string {
    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "user" && typeof message.content === "string") {
        return message.content;
      }
    }
    return ""; // Fallback if no user message found
  }

  // ── Get chat history for UI ───────────────────────────────
  getHistory(sessionId: string, limit = 10) {
    return this.sessionService.getHistory(sessionId, limit);
  }

  // ── Clear session (user clicks "New Chat") ────────────────
  clearSession(sessionId: string) {
    this.sessionService.delete(sessionId);
  }
}