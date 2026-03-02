import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Currency conversion tool for live exchange rates
export const convertCurrencyTool: Tool = {
  name: "convert_currency",
  description: `Convert currency amounts using live exchange rates.
Use this when:
- User asks to convert prices to their local currency (INR, USD, EUR, etc.)
- User asks "what's this in rupees/dollars/euros"
- User wants to see tour prices in their preferred currency

Returns: Converted amount with current exchange rate.`,
  input_schema: {
    type: "object" as const,
    properties: {
      amount: {
        type: "number",
        description: "The amount to convert (e.g., 165 for AED 165)",
      },
      fromCurrency: {
        type: "string",
        description: "Source currency code (e.g., 'AED', 'USD', 'EUR')",
      },
      toCurrency: {
        type: "string", 
        description: "Target currency code (e.g., 'INR', 'USD', 'EUR')",
      },
    },
    required: ["amount", "fromCurrency", "toCurrency"],
  },
};