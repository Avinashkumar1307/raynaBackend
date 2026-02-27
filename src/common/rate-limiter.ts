import rateLimit from "express-rate-limit";
import { config } from "../config";

// ── Chat endpoint rate limiter ─────────────────────────────
// Prevents abuse of the Claude API (each call costs money)
export const chatRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,       // 1 minute
  max: config.rateLimit.maxRequests,         // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many messages. Please wait a moment before sending more.",
  },
  keyGenerator: (req) => {
    // Rate limit per IP
    return req.ip ?? "unknown";
  },
});