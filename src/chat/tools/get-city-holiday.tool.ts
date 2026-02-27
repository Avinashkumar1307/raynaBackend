import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/city/holiday?cityId=13668
export const getCityHolidayTool: Tool = {
  name: "get_city_holiday_packages",
  description: `Fetch holiday packages available for a specific city.
Use this when:
- User asks about "holiday packages", "vacation packages", "travel packages"
- User says "plan a holiday to Dubai", "holiday deal for Bangkok"
- User wants multi-day holiday bundle deals

IMPORTANT: Requires cityId. Use get_available_cities first if you don't have the cityId.

Returns: Holiday packages with pricing, duration, and inclusions.`,
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