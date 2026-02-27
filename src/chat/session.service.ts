import { config } from "../config";

interface Message {
  role: "user" | "assistant";
  content: unknown; // Claude's content can be string or content block array
}

interface Session {
  messages: Message[];
  lastActivity: number;
  userId?: string;
}

// ─────────────────────────────────────────────────────────
// SessionService
//
// Stores conversation history per sessionId.
// Currently: in-memory Map (fine for single server)
//
// TO UPGRADE TO REDIS (for production / multi-server):
// Replace the Map operations with ioredis get/set calls.
// The interface stays identical — only this file changes.
//
// DUAL PURPOSE:
// 1. Claude Context — last N messages sent to Claude API (cost control)
// 2. UI History    — last N messages shown to user in chat window
// ─────────────────────────────────────────────────────────
export class SessionService {
  private sessions = new Map<string, Session>();
  private readonly maxMessages: number;
  private readonly ttlMs: number;

  constructor() {
    this.maxMessages = config.session.maxMessages; // default: 10
    this.ttlMs = config.session.ttlMinutes * 60 * 1000; // default: 30 min
    this.startCleanupTimer();
  }

  // ── Get messages for Claude context ──────────────────────
  getContext(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    // Return last N messages as Claude context
    return session.messages.slice(-this.maxMessages);
  }

  // ── Add a single message to session ──────────────────────
  addMessage(sessionId: string, message: Message, userId?: string): void {
    const session = this.sessions.get(sessionId) ?? { messages: [], lastActivity: Date.now() };

    session.messages.push(message);
    session.lastActivity = Date.now();

    if (userId) session.userId = userId;

    // Keep last 50 in memory (UI shows last 10, Claude gets last 10)
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    this.sessions.set(sessionId, session);
  }

  // ── Get last N messages for UI display ───────────────────
  getHistory(sessionId: string, limit = 10): Array<{ role: string; content: string; }> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.messages
      .slice(-limit)
      .map((m) => ({
        role: m.role,
        // Extract text content for UI (Claude content can be array of blocks)
        content: typeof m.content === "string"
          ? m.content
          : this.extractText(m.content),
      }));
  }

  // ── Check if session exists ───────────────────────────────
  exists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  // ── Delete session (logout / clear chat) ─────────────────
  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // ── Extract plain text from Claude content blocks ────────
  private extractText(content: unknown): string {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .filter((b: unknown) => (b as { type: string }).type === "text")
        .map((b: unknown) => (b as { text: string }).text)
        .join(" ");
    }
    return "";
  }

  // ── Auto-cleanup expired sessions (every 10 min) ─────────
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [id, session] of this.sessions.entries()) {
        if (now - session.lastActivity > this.ttlMs) {
          this.sessions.delete(id);
          cleaned++;
        }
      }
      if (cleaned > 0) {
        console.log(`[SessionService] Cleaned up ${cleaned} expired sessions`);
      }
    }, 10 * 60 * 1000);
  }
}