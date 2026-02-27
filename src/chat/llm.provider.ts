import { config } from "../config";
import axios from "axios";
import OpenAI from 'openai';
import Groq from 'groq-sdk';

export interface LLMMessage {
  role: "user" | "assistant";
  content: unknown;
}

export interface LLMResponse {
  text: string;
  rawContent: unknown[];
  stopReason: string;
}

// ─────────────────────────────────────────────────────────
// LLMProvider — Abstract interface
// Swap providers by changing LLM_PROVIDER in .env
// ─────────────────────────────────────────────────────────
export abstract class LLMProvider {
  abstract chat(
    messages: LLMMessage[],
    systemPrompt: string,
    tools: unknown[]
  ): Promise<LLMResponse>;

  abstract isToolUse(response: LLMResponse): boolean;
  abstract extractToolCalls(response: LLMResponse): Array<{ id: string; name: string; input: Record<string, unknown> }>;
  abstract buildToolResultMessage(toolResults: Array<{ id: string; content: string }>): LLMMessage;
}

// ─────────────────────────────────────────────────────────
// Claude Provider (Anthropic)
// ─────────────────────────────────────────────────────────
export class ClaudeProvider extends LLMProvider {
  private client: import("@anthropic-ai/sdk").default;

  constructor() {
    super();
    const Anthropic = require("@anthropic-ai/sdk").default;
    this.client = new Anthropic({ apiKey: config.llm.anthropicApiKey });
  }

  async chat(messages: LLMMessage[], systemPrompt: string, tools: unknown[]): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      tools: tools as never,
      messages: messages as never,
    });

    // ───────────── Type Guards ─────────────
    interface TextBlock { type: "text"; text: string }
    interface ToolUseBlock { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }

    // Extract only text blocks safely
    const text = (response.content as unknown[])
      .filter((b): b is TextBlock => (b as any).type === "text")
      .map((b) => b.text)
      .join("");

    return {
      text,
      rawContent: response.content,
      stopReason: response.stop_reason ?? "end_turn",
    };
  }

  isToolUse(response: LLMResponse): boolean {
    return response.stopReason === "tool_use";
  }

  extractToolCalls(response: LLMResponse) {
    interface ToolUseBlock { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
    return (response.rawContent as unknown[])
      .filter((b): b is ToolUseBlock => (b as any).type === "tool_use")
      .map((b) => ({ id: b.id, name: b.name, input: b.input }));
  }

  buildToolResultMessage(toolResults: Array<{ id: string; content: string }>): LLMMessage {
    return {
      role: "user",
      content: toolResults.map((r) => ({
        type: "tool_result",
        tool_use_id: r.id,
        content: r.content,
      })),
    };
  }
}

// ─────────────────────────────────────────────────────────
// OpenAI Provider
// ─────────────────────────────────────────────────────────
export class OpenAIProvider extends LLMProvider {
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({ apiKey: config.llm.openaiApiKey });
  }

  private convertTools(tools: unknown[]): any[] {
    return (tools as any[]).map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));
  }

  private convertMessages(messages: LLMMessage[], systemPrompt: string): any[] {
    const converted: any[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.role === "user" && Array.isArray(msg.content)) {
        const toolResults = msg.content as any[];
        for (const r of toolResults) {
          if (r.type === "tool_result") {
            converted.push({
              role: "tool",
              tool_call_id: r.tool_use_id,
              content: r.content,
            });
          }
        }
      } else if (msg.role === "assistant" && Array.isArray(msg.content)) {
        const blocks = msg.content as any[];
        const textParts = blocks.filter((b) => b.type === "text").map((b) => b.text);
        const toolCalls = blocks.filter((b) => b.type === "tool_use").map((b) => ({
          id: b.id,
          type: "function",
          function: { name: b.name, arguments: JSON.stringify(b.input) },
        }));

        const assistantMsg: any = { role: "assistant", content: textParts.join("") || null };
        if (toolCalls.length > 0) {
          assistantMsg.tool_calls = toolCalls;
        }
        converted.push(assistantMsg);
      } else {
        converted.push({ role: msg.role, content: msg.content });
      }
    }

    return converted;
  }

  async chat(messages: LLMMessage[], systemPrompt: string, tools: unknown[]): Promise<LLMResponse> {
    const openaiMessages = this.convertMessages(messages, systemPrompt);
    const openaiTools = this.convertTools(tools);

    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: openaiMessages,
      tools: openaiTools as any,
      tool_choice: "auto",
      max_tokens: 2048,
    });

    const choice = response.choices[0];
    const message = choice.message;

    const rawContent: unknown[] = [];
    if (message.content) {
      rawContent.push({ type: "text", text: message.content });
    }
    if (message.tool_calls) {
      for (const tc of message.tool_calls) {
        rawContent.push({
          type: "tool_use",
          id: tc.id,
                    name: (tc as any).function.name,
          input: JSON.parse((tc as any).function.arguments),
        });
      }
    }

    const stopReason = message.tool_calls ? "tool_use" : "end_turn";

    return {
      text: message.content ?? "",
      rawContent,
      stopReason,
    };
  }

  isToolUse(response: LLMResponse): boolean {
    return response.stopReason === "tool_use";
  }

  extractToolCalls(response: LLMResponse) {
    return (response.rawContent as any[])
      .filter((b) => b.type === "tool_use")
      .map((b) => ({ id: b.id, name: b.name, input: b.input }));
  }

  buildToolResultMessage(toolResults: Array<{ id: string; content: string }>): LLMMessage {
    return {
      role: "user",
      content: toolResults.map((r) => ({
        type: "tool_result",
        tool_use_id: r.id,
        content: r.content,
      })),
    };
  }
}

// ─────────────────────────────────────────────────────────
// Groq Provider
// ─────────────────────────────────────────────────────────
export class GroqProvider extends LLMProvider {
  private client: Groq;

  constructor() {
    super();
    this.client = new Groq({ apiKey: config.llm.groqApiKey });
  }

  private convertTools(tools: unknown[]): any[] {
    return (tools as any[]).map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));
  }

  private convertMessages(messages: LLMMessage[], systemPrompt: string): any[] {
    const converted: any[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.role === "user" && Array.isArray(msg.content)) {
        const toolResults = msg.content as any[];
        for (const r of toolResults) {
          if (r.type === "tool_result") {
            converted.push({
              role: "tool",
              tool_call_id: r.tool_use_id,
              content: r.content,
            });
          }
        }
      } else if (msg.role === "assistant" && Array.isArray(msg.content)) {
        const blocks = msg.content as any[];
        const textParts = blocks.filter((b) => b.type === "text").map((b) => b.text);
        const toolCalls = blocks.filter((b) => b.type === "tool_use").map((b) => ({
          id: b.id,
          type: "function",
          function: { name: b.name, arguments: JSON.stringify(b.input) },
        }));

        const assistantMsg: any = { role: "assistant", content: textParts.join("") || null };
        if (toolCalls.length > 0) {
          assistantMsg.tool_calls = toolCalls;
        }
        converted.push(assistantMsg);
      } else {
        converted.push({ role: msg.role, content: msg.content });
      }
    }

    return converted;
  }

  async chat(messages: LLMMessage[], systemPrompt: string, tools: unknown[]): Promise<LLMResponse> {
    const groqMessages = this.convertMessages(messages, systemPrompt);
    const groqTools = this.convertTools(tools);

    const response = await this.client.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: groqMessages,
      tools: groqTools,
      tool_choice: "auto",
      max_tokens: 2048,
    });

    const choice = response.choices[0];
    const message = choice.message;

    const rawContent: unknown[] = [];
    if (message.content) {
      rawContent.push({ type: "text", text: message.content });
    }
    if (message.tool_calls) {
      for (const tc of message.tool_calls) {
        rawContent.push({
          type: "tool_use",
          id: tc.id,
                    name: (tc as any).function.name,
          input: JSON.parse((tc as any).function.arguments),
        });
      }
    }

    const stopReason = message.tool_calls ? "tool_use" : "end_turn";

    return {
      text: message.content ?? "",
      rawContent,
      stopReason,
    };
  }

  isToolUse(response: LLMResponse): boolean {
    return response.stopReason === "tool_use";
  }

  extractToolCalls(response: LLMResponse) {
    return (response.rawContent as any[])
      .filter((b) => b.type === "tool_use")
      .map((b) => ({ id: b.id, name: b.name, input: b.input }));
  }

  buildToolResultMessage(toolResults: Array<{ id: string; content: string }>): LLMMessage {
    return {
      role: "user",
      content: toolResults.map((r) => ({
        type: "tool_result",
        tool_use_id: r.id,
        content: r.content,
      })),
    };
  }
}

// ─────────────────────────────────────────────────────────
// Grok Provider (xAI's API)
// ─────────────────────────────────────────────────────────
export class GrokProvider extends LLMProvider {
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

  constructor() {
    super();
    this.apiKey = config.llm.grokApiKey;
  }

  // Convert Anthropic-style tools to OpenAI-style for Groq
  private convertTools(tools: unknown[]): unknown[] {
    return (tools as any[]).map((t) => {
      const params = { ...t.input_schema };
      if (params.type === "object" && params.additionalProperties === undefined) {
        params.additionalProperties = false;
      }
      return {
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: params,
        },
      };
    });
  }

  // Convert Anthropic-style messages to OpenAI-style
  private convertMessages(messages: LLMMessage[], systemPrompt: string): unknown[] {
    const converted: any[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.role === "user" && Array.isArray(msg.content)) {
        // This is a tool_result message from Anthropic format
        const toolResults = msg.content as any[];
        for (const r of toolResults) {
          if (r.type === "tool_result") {
            converted.push({
              role: "tool",
              tool_call_id: r.tool_use_id,
              content: r.content,
            });
          }
        }
      } else if (msg.role === "assistant" && Array.isArray(msg.content)) {
        // Assistant message with mixed text + tool_use blocks
        const blocks = msg.content as any[];
        const textParts = blocks.filter((b) => b.type === "text").map((b) => b.text);
        const toolCalls = blocks.filter((b) => b.type === "tool_use").map((b) => ({
          id: b.id,
          type: "function",
          function: { name: b.name, arguments: JSON.stringify(b.input) },
        }));

        const assistantMsg: any = { role: "assistant", content: textParts.join("") || null };
        if (toolCalls.length > 0) {
          assistantMsg.tool_calls = toolCalls;
        }
        converted.push(assistantMsg);
      } else {
        converted.push({ role: msg.role, content: msg.content });
      }
    }

    return converted;
  }

  async chat(messages: LLMMessage[], systemPrompt: string, tools: unknown[]): Promise<LLMResponse> {
    const openaiMessages = this.convertMessages(messages, systemPrompt);
    const openaiTools = this.convertTools(tools);

    let response: any;
    try {
      response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: openaiMessages,
          tools: openaiTools as any,
          tool_choice: "auto",
          max_completion_tokens: 2048,
          parallel_tool_calls: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err: any) {
      if (err.response) {
        console.error("[GrokProvider] API error:", JSON.stringify(err.response.data, null, 2));
      }
      throw err;
    }

    const choice = response.data.choices[0];
    const message = choice.message;

    // Build rawContent in Anthropic-like format so the agent loop works unchanged
    const rawContent: unknown[] = [];
    if (message.content) {
      rawContent.push({ type: "text", text: message.content });
    }
    if (message.tool_calls) {
      for (const tc of message.tool_calls) {
        rawContent.push({
          type: "tool_use",
          id: tc.id,
                    name: (tc as any).function.name,
          input: JSON.parse((tc as any).function.arguments),
        });
      }
    }

    const stopReason = message.tool_calls ? "tool_use" : "end_turn";

    return {
      text: message.content ?? "",
      rawContent,
      stopReason,
    };
  }

  isToolUse(response: LLMResponse): boolean {
    return response.stopReason === "tool_use";
  }

  extractToolCalls(response: LLMResponse) {
    return (response.rawContent as any[])
      .filter((b) => b.type === "tool_use")
      .map((b) => ({ id: b.id, name: b.name, input: b.input }));
  }

  buildToolResultMessage(toolResults: Array<{ id: string; content: string }>): LLMMessage {
    return {
      role: "user",
      content: toolResults.map((r) => ({
        type: "tool_result",
        tool_use_id: r.id,
        content: r.content,
      })),
    };
  }
}

// ─────────────────────────────────────────────────────────
// Factory — Returns the right provider based on .env
// ─────────────────────────────────────────────────────────
export function createLLMProvider(): LLMProvider {
  switch (config.llm.provider) {
    case "claude":
      return new ClaudeProvider();
    case "openai":
      return new OpenAIProvider();
    case "groq":
      return new GroqProvider();
    case "grok":
      return new GrokProvider();
    default:
      console.warn(`[LLMProvider] Unknown provider "${config.llm.provider}", defaulting to Claude`);
      return new ClaudeProvider();
  }
}