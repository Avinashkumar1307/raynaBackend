import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/city/yacht?cityId=13668
export const getCityYachtTool: Tool = {
  name: "get_city_yachts",
  description: `Fetch yacht rental/charter options available in a specific city.
Use this when:
- User asks about "yacht", "yacht rental", "private yacht", "yacht party"
- User wants luxury water experiences

IMPORTANT: Requires cityId. Use get_available_cities first if you don't have the cityId.

Returns: Yacht options with pricing and details.`,
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