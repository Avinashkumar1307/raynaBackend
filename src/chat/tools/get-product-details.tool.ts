import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Maps to: GET /api/product-details?url=<encoded-url>
export const getProductDetailsTool: Tool = {
  name: "get_product_details",
  description: `Fetch detailed information about a specific tour or product using its URL.
Use this when:
- User asks "tell me more about X tour"
- User wants full description, inclusions, itinerary of a specific product
- You have a product URL from previous search results and user wants details

Provide the exact product URL from previous search results.

Returns: Full title, description, highlights, and metadata for the product.`,
  input_schema: {
    type: "object" as const,
    properties: {
      url: {
        type: "string",
        description: "Full product page URL from Rayna Tours (e.g. https://www.raynatours.com/burj-khalifa-ticket)",
      },
    },
    required: ["url"],
  },
};