import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/available-cities?productType=tour
export const getAvailableCitiesTool: Tool = {
  name: "get_available_cities",
  description: `Fetch all available cities for a specific product type on Rayna Tours.
Use this when:
- User asks "where can I go", "what destinations are available"
- User asks about cities for tours, activities, holidays, cruises, or yachts
- You need a city ID before fetching products (always call this first if you don't know the city ID)

Returns: List of countries with their cities and city IDs.`,
  input_schema: {
    type: "object" as const,
    properties: {
      productType: {
        type: "string",
        enum: ["tour", "activities", "holiday", "cruise", "yacht"],
        description: "Type of product to get cities for. Default to 'tour' if not specified.",
      },
    },
    required: ["productType"],
  },
};