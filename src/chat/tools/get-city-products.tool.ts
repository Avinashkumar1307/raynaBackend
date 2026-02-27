import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/city/products?cityId=13668
export const getCityProductsTool: Tool = {
  name: "get_city_products",
  description: `Fetch general products available in a city by its ID.
Use this when:
- User asks broadly about what Rayna Tours offers in a city
- You want a quick overview of all product types in a city

IMPORTANT: Requires cityId. Use get_available_cities first if you don't have the cityId.

Returns: Products available in the specified city.`,
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