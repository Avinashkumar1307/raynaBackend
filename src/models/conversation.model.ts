import mongoose, { Document, Schema } from "mongoose";

// ─────────────────────────────────────────────────────────
// Conversation — one document per chat session
// Like ChatGPT's sidebar: each entry = one conversation
// ─────────────────────────────────────────────────────────

export interface IConversation extends Document {
  session_id: string;
  title: string;         // auto-generated from the first user message
  message_count: number;
  created_at: Date;
  updated_at: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    session_id:    { type: String, required: true, unique: true, index: true },
    title:         { type: String, default: "New Conversation" },
    message_count: { type: Number, default: 0 },
    created_at:    { type: Date, default: Date.now },
    updated_at:    { type: Date, default: Date.now },
  },
  { collection: "conversations" }
);

export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
