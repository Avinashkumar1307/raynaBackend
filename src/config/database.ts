import mongoose from "mongoose";
import { config } from "./index";

// ─────────────────────────────────────────────────────────
// Database Connection — Singleton pattern
//
// Reuses the same connection across requests.
// Critical for Vercel serverless (new function = new process,
// but mongoose caches the connection inside the module).
// ─────────────────────────────────────────────────────────

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return; // already connected

  const uri = config.mongodb.uri;

  if (!uri || uri.includes("<username>")) {
    console.warn("[DB] MONGODB_URI not configured — history will not be persisted.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("[DB] Connected to MongoDB");
  } catch (err) {
    console.error("[DB] Connection failed:", err);
    // Non-fatal — app keeps running without DB persistence
  }
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
