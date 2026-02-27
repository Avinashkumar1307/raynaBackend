import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getPopularVisasTool: Tool = {
  name: "get_popular_visas",
  description: `Get the most popular visa destinations offered by Rayna Tours. Use this when users ask about:
- "What are the most popular visas?"
- "Show me trending visa destinations"
- "Which countries do most people get visas for?"
- General visa inquiries without specific country

This returns the top visa destinations popular among travelers from the Middle East.

Returns: List of popular visa destinations with name, country, URL and information.`,
  input_schema: {
    type: "object" as const,
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of popular visas to return (default 8, max 15)",
      },
    },
    required: [],
  },
};