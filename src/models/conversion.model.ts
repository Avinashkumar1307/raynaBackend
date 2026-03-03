import mongoose, { Document, Schema } from "mongoose";

// ─────────────────────────────────────────────────────────
// Conversion — every currency conversion performed
// Linked to a session so user can see their conversion history
// ─────────────────────────────────────────────────────────

export interface IConversion extends Document {
  session_id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: Date;
}

const ConversionSchema = new Schema<IConversion>(
  {
    session_id:      { type: String, required: true, index: true },
    amount:          { type: Number, required: true },
    fromCurrency:    { type: String, required: true, uppercase: true },
    toCurrency:      { type: String, required: true, uppercase: true },
    convertedAmount: { type: Number, required: true },
    exchangeRate:    { type: Number, required: true },
    timestamp:       { type: Date, default: Date.now },
  },
  { collection: "conversions" }
);

export const Conversion = mongoose.model<IConversion>("Conversion", ConversionSchema);
