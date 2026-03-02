import { getAvailableCitiesTool } from "./get-available-cities.tool";
import { getAllProductsTool } from "./get-all-products.tool";
import { getCityProductsTool } from "./get-city-products.tool";
import { getCityHolidayTool } from "./get-city-holiday.tool";
import { getCityCruiseTool } from "./get-city-cruise.tool";
import { getCityYachtTool } from "./get-city-yacht.tool";
import { getProductDetailsTool } from "./get-product-details.tool";
import { getVisasTool } from "./get-visas.tool";
import { getPopularVisasTool } from "./get-popular-visas.tool";
import { getTourCardsSchema, getTourCards } from "./get-tour-cards.tool";
import { convertCurrencyTool } from "./convert-currency.tool";

// ─────────────────────────────────────────────────────────
// ALL_TOOLS — Claude sees this list and decides what to call
//
// MILESTONE 1: Tour discovery tools (active)
// MILESTONE 2: Profile tools  → add here when ready
// MILESTONE 3: Booking tools  → add here when ready
// ─────────────────────────────────────────────────────────
export const ALL_TOOLS = [
  // Milestone 1 — Tour Discovery & Travel Services
  getAvailableCitiesTool,
  getAllProductsTool,
  getCityProductsTool,
  getCityHolidayTool,
  getCityCruiseTool,
  getCityYachtTool,
  getProductDetailsTool,
  
    // Visa Services
  getVisasTool,
  getPopularVisasTool,
  
    // Tour Cards & Carousel Display
  {
    name: getTourCardsSchema.name,
    description: getTourCardsSchema.description,
    input_schema: getTourCardsSchema.input_schema,
  },
  
  // Currency Conversion
  convertCurrencyTool,

  // Milestone 2 — Profile Management (coming soon)
  // getUserProfileTool,
  // updateUserProfileTool,

  // Milestone 3 — Bookings & Payments (coming soon)
  // getUserBookingsTool,
  // getPaymentHistoryTool,
  // cancelBookingTool,
];

export type ToolName =
  | "get_available_cities"
  | "get_all_products"
  | "get_city_products"
  | "get_city_holiday_packages"
  | "get_city_cruises"
  | "get_city_yachts"
  | "get_product_details"
  | "get_visas"
  | "get_popular_visas"
  | "get_tour_cards"
  | "convert_currency";
  // | "get_user_profile"        // M2
  // | "update_user_profile"     // M2
  // | "get_user_bookings"       // M3
  // | "get_payment_history"     // M3