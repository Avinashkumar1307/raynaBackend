import { Router, Request, Response } from "express";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { Conversion } from "../models/conversion.model";
import { isDBConnected } from "../config/database";

const router = Router();

// ── Guard: return 503 if DB is not ready ─────────────────
function requireDB(res: Response): boolean {
  if (!isDBConnected()) {
    res.status(503).json({ error: "Database not connected. Configure MONGODB_URI to enable history." });
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────
// GET /api/history
// All conversations — like ChatGPT's sidebar list
// Query params: ?limit=20&page=1
// ─────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  if (!requireDB(res)) return;

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const page  = Math.max(parseInt(req.query.page  as string) || 1, 1);
  const skip  = (page - 1) * limit;

  try {
    const [conversations, total] = await Promise.all([
      Conversation.find()
        .sort({ updated_at: -1 })  // newest first
        .skip(skip)
        .limit(limit)
        .select("session_id title message_count created_at updated_at"),
      Conversation.countDocuments(),
    ]);

    return res.json({
      conversations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[HistoryRouter] GET /history error:", err);
    return res.status(500).json({ error: "Failed to fetch conversations." });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/history/:sessionId
// All messages in a conversation (full chat history)
// Query params: ?limit=50&page=1
// ─────────────────────────────────────────────────────────
router.get("/:sessionId", async (req: Request, res: Response) => {
  if (!requireDB(res)) return;

  const { sessionId } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const page  = Math.max(parseInt(req.query.page  as string) || 1, 1);
  const skip  = (page - 1) * limit;

  try {
    const [conversation, messages, total] = await Promise.all([
      Conversation.findOne({ session_id: sessionId }),
      Message.find({ session_id: sessionId })
        .sort({ timestamp: 1 })   // oldest first — natural chat order
        .skip(skip)
        .limit(limit)
        .select("role content tourCarousel timestamp"),
      Message.countDocuments({ session_id: sessionId }),
    ]);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    return res.json({
      session_id: sessionId,
      title: conversation.title,
      created_at: conversation.created_at,
      messages,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[HistoryRouter] GET /history/:sessionId error:", err);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/history/:sessionId
// Delete a conversation and all its messages
// ─────────────────────────────────────────────────────────
router.delete("/:sessionId", async (req: Request, res: Response) => {
  if (!requireDB(res)) return;

  const { sessionId } = req.params;

  try {
    await Promise.all([
      Conversation.deleteOne({ session_id: sessionId }),
      Message.deleteMany({ session_id: sessionId }),
      Conversion.deleteMany({ session_id: sessionId }),
    ]);

    return res.json({ success: true, message: "Conversation deleted." });
  } catch (err) {
    console.error("[HistoryRouter] DELETE /history/:sessionId error:", err);
    return res.status(500).json({ error: "Failed to delete conversation." });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/history/:sessionId/conversions
// All currency conversions for a specific session
// ─────────────────────────────────────────────────────────
router.get("/:sessionId/conversions", async (req: Request, res: Response) => {
  if (!requireDB(res)) return;

  const { sessionId } = req.params;

  try {
    const conversions = await Conversion.find({ session_id: sessionId })
      .sort({ timestamp: -1 })
      .select("amount fromCurrency toCurrency convertedAmount exchangeRate timestamp");

    return res.json({ session_id: sessionId, conversions });
  } catch (err) {
    console.error("[HistoryRouter] GET conversions error:", err);
    return res.status(500).json({ error: "Failed to fetch conversions." });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/history/conversions/all
// All conversions across every session (paginated)
// ─────────────────────────────────────────────────────────
router.get("/conversions/all", async (req: Request, res: Response) => {
  if (!requireDB(res)) return;

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const page  = Math.max(parseInt(req.query.page  as string) || 1, 1);
  const skip  = (page - 1) * limit;

  try {
    const [conversions, total] = await Promise.all([
      Conversion.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Conversion.countDocuments(),
    ]);

    return res.json({
      conversions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[HistoryRouter] GET /conversions/all error:", err);
    return res.status(500).json({ error: "Failed to fetch conversions." });
  }
});

export default router;
