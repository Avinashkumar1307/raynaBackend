import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getVisasTool: Tool = {
  name: "get_visas",
  description: `Get visa information for different countries. Use this when users ask about:
- Visa requirements for specific countries  
- Travel document needs
- "Do I need a visa for...?"
- "What visas do you offer?"
- "Show me visa options"

This tool provides visa services offered by Rayna Tours for various destinations.

Returns: List of visa products with name, country, URL and basic information.`,
  input_schema: {
    type: "object" as const,
    properties: {
      country: {
        type: "string",
        description: "Filter by specific country (e.g., 'dubai', 'usa', 'schengen', 'uk'). Optional - if not provided, returns popular visas.",
      },
      limit: {
        type: "number",
        description: "Maximum number of visas to return (default 10, max 20)",
      },
    },
    required: [],
  },
};