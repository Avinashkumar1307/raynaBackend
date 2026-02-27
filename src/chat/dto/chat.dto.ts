import { z } from "zod";
import { TourCarousel } from "./tour-card.dto";

// ── Request Validation Schema ──────────────────────────────
export const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long (max 1000 chars)")
    .trim(),
  session_id: z
    .string()
    .uuid("Invalid session ID format")
    .optional(),
});

export const HistoryRequestSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10),
});

// ── TypeScript Types ───────────────────────────────────────
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
  message: string;
  session_id: string;
  tourCarousel?: TourCarousel;
  metadata?: {
    hasCards: boolean;
    cardCount?: number;
    totalResults?: number;
  };
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HistoryResponse {
  session_id: string;
  messages: HistoryMessage[];
}

export interface ErrorResponse {
  error: string;
  details?: string;
}