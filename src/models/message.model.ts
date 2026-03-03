import mongoose, { Document, Schema } from "mongoose";

// ─────────────────────────────────────────────────────────
// Message — every user input and AI reply
// Linked to a Conversation via session_id
// ─────────────────────────────────────────────────────────

export interface IMessage extends Document {
  session_id: string;
  role: "user" | "assistant";
  content: string;
  tourCarousel?: Record<string, unknown>;  // only on assistant messages that include tours
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    session_id:   { type: String, required: true, index: true },
    role:         { type: String, enum: ["user", "assistant"], required: true },
    content:      { type: String, required: true },
    tourCarousel: { type: Schema.Types.Mixed, default: null },
    timestamp:    { type: Date, default: Date.now },
  },
  { collection: "messages" }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
