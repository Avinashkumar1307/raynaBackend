import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/city/cruise?cityId=13668
export const getCityCruiseTool: Tool = {
  name: "get_city_cruises",
  description: `Fetch cruise options available in a specific city.
Use this when:
- User asks about "cruises", "cruise tours", "dinner cruise", "boat tours"
- User says "cruise in Dubai", "cruise deals"

IMPORTANT: Requires cityId. Use get_available_cities first if you don't have the cityId.

Returns: Cruise options with pricing and details.`,
  input_schema: {
    type: "object" as const,
    properties: {
      cityId: {
        type: "number",
        description: "Numeric city ID (e.g. 13668 for Dubai)",
      },
    },
    required: ["cityId"],
  },
};