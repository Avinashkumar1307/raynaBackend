import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/all-products?productType=tour&cityId=13668&cityName=Dubai&countryName=UAE
export const getAllProductsTool: Tool = {
  name: "get_all_products",
  description: `Fetch all tours, activities, holidays, cruises, or yachts available in a specific city.
Use this when:
- User asks "show me tours in Dubai", "what activities are in Bangkok"
- User asks "what holiday packages are available in Singapore"
- User wants to browse options in a destination

IMPORTANT: You need cityId, cityName and countryName. 
If you don't have the cityId, call get_available_cities first to find it.

Returns: List of products with name, type, normalPrice, salePrice, currency, URL and image.`,
  input_schema: {
    type: "object" as const,
    properties: {
      productType: {
        type: "string",
        enum: ["tour", "activities", "holiday", "cruise", "yacht"],
        description: "Type of product to fetch",
      },
      cityId: {
        type: "number",
        description: "Numeric city ID (e.g. 13668 for Dubai). Get from get_available_cities if unknown.",
      },
      cityName: {
        type: "string",
        description: "City name (e.g. Dubai, Singapore, Bangkok)",
      },
      countryName: {
        type: "string",
        description: "Country name (e.g. United Arab Emirates, Thailand, Singapore)",
      },
    },
    required: ["productType", "cityId", "cityName", "countryName"],
  },
};