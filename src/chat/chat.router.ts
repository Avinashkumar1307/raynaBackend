import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { ChatService } from "./chat.service";
import { ChatRequestSchema, HistoryRequestSchema } from "./dto/chat.dto";
import type { ChatResponse, HistoryResponse, ErrorResponse, HistoryMessage } from "./dto/chat.dto";

const router = Router();
const chatService = new ChatService();

// ─────────────────────────────────────────────────────────
// POST /api/chat
// Send a message and get AI response
// ─────────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response<ChatResponse | ErrorResponse>) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { message, session_id } = parsed.data;
  const sessionId = session_id ?? uuid();

    try {
    const { reply, tourCarousel, metadata } = await chatService.chat(sessionId, message);
    return res.status(200).json({ message: reply, session_id: sessionId, tourCarousel, metadata });
  } catch (err) {
    console.error("[ChatRouter] Chat error:", err);
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
      details: process.env.NODE_ENV === "development" ? String(err) : undefined,
    });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/chat/history/:sessionId
// Load last N messages for UI
// ─────────────────────────────────────────────────────────
router.get("/history/:sessionId", async (req: Request, res: Response<HistoryResponse | ErrorResponse>) => {
  const { sessionId } = req.params;
  const { limit } = HistoryRequestSchema.parse({
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
  });

  try {
    // map messages to enforce "user" | "assistant" role type
    const messages: HistoryMessage[] = chatService.getHistory(sessionId, limit).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    return res.status(200).json({ session_id: sessionId, messages });
  } catch (err) {
    console.error("[ChatRouter] History error:", err);
    return res.status(500).json({ error: "Could not load chat history." });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/chat/session/:sessionId
// Clear a chat session
// ─────────────────────────────────────────────────────────
router.delete("/session/:sessionId", (req: Request, res: Response) => {
  const { sessionId } = req.params;
  chatService.clearSession(sessionId);
  return res.status(200).json({ success: true, message: "Session cleared" });
});

// ─────────────────────────────────────────────────────────
// GET /api/chat/health
// Health check for monitoring
// ─────────────────────────────────────────────────────────
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "rayna-chatbot",
    milestone: 1,
    timestamp: new Date().toISOString(),
  });
});

export default router;