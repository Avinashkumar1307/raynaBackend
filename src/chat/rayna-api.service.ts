import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "../config";
import type { ToolName } from "./tools";
import { visaService } from "./visa.service";
import { getTourCards } from "./tools/get-tour-cards.tool";
import { Conversion } from "../models/conversion.model";
import { isDBConnected } from "../config/database";

// ─────────────────────────────────────────────────────────
// RaynaApiService
// Executes tool calls → real Rayna Tours API calls
// Each case maps directly to one API endpoint from the docs
// ─────────────────────────────────────────────────────────
export class RaynaApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.rayna.baseUrl,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    // Request logging
    this.client.interceptors.request.use((req) => {
      console.log(`[Rayna API] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`, req.params);
      return req;
    });

    // Response logging
    this.client.interceptors.response.use(
      (res) => {
        console.log(`[Rayna API] Response ${res.status} from ${res.config.url}`);
        return res;
      },
      (err: AxiosError) => {
        console.error(`[Rayna API] Error ${err.response?.status}: ${err.message}`);
        return Promise.reject(err);
      }
    );
  }

  // ─────────────────────────────────────────────────────────
  // execute() — called by ChatService for each tool use block
  // Returns: JSON string (Claude reads this as tool result)
  // ─────────────────────────────────────────────────────────
  async execute(toolName: ToolName, input: Record<string, unknown>, sessionId?: string): Promise<string> {
    try {
      const data = await this.callApi(toolName, input, sessionId);
      const trimmed = this.trimResponse(data);
      return JSON.stringify({ success: true, data: trimmed });
    } catch (err) {
      const error = err as AxiosError;
      console.error(`[RaynaApiService] Tool "${toolName}" failed:`, error.message);
      return JSON.stringify({
        success: false,
        error: error.message,
        status: error.response?.status,
        hint: "API call failed. Tell user data is temporarily unavailable.",
      });
    }
  }

  // Trim large API responses to stay within LLM token/size limits
  private trimResponse(data: unknown): unknown {
    if (!data || typeof data !== "object") return data;

    const obj = data as Record<string, unknown>;

    // If response has an array of products/items, limit to top 10
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 10) {
        const arr = obj[key] as unknown[];
        obj[key] = arr.slice(0, 10);
        (obj as any)[`${key}_note`] = `Showing 10 of ${arr.length} results. Ask user to narrow down if needed.`;
      }
    }

    // If it's an array at the top level
    if (Array.isArray(data) && data.length > 10) {
      return {
        items: data.slice(0, 10),
        total: data.length,
        note: "Showing 10 of " + data.length + " results.",
      };
    }

    // Final safety: cap the JSON string size to ~8KB
    const json = JSON.stringify(obj);
    if (json.length > 8000) {
      // Try to find arrays and shrink them further
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 5) {
          obj[key] = (obj[key] as unknown[]).slice(0, 5);
        }
      }
    }

    return obj;
  }

  private async callApi(toolName: ToolName, input: Record<string, unknown>, sessionId?: string): Promise<unknown> {
    switch (toolName) {
      // ── GET /api/available-cities?productType=tour ──
      case "get_available_cities": {
        const { data } = await this.client.get("/available-cities", {
          params: { productType: input.productType },
        });
        return data;
      }

      // ── GET /api/all-products?productType=tour&cityId=13668... ──
      case "get_all_products": {
        const { data } = await this.client.get("/all-products", {
          params: {
            productType: input.productType,
            cityId: input.cityId,
            cityName: input.cityName,
            countryName: input.countryName,
          },
        });
        return data;
      }

      // ── GET /api/city/products?cityId=13668 ──
      case "get_city_products": {
        const { data } = await this.client.get("/city/products", {
          params: { cityId: input.cityId },
        });
        return data;
      }

      // ── GET /api/city/holiday?cityId=13668 ──
      case "get_city_holiday_packages": {
        const { data } = await this.client.get("/city/holiday", {
          params: { cityId: input.cityId },
        });
        return data;
      }

      // ── GET /api/city/cruise?cityId=13668 ──
      case "get_city_cruises": {
        const { data } = await this.client.get("/city/cruise", {
          params: { cityId: input.cityId },
        });
        return data;
      }

      // ── GET /api/city/yacht?cityId=13668 ──
      case "get_city_yachts": {
        const { data } = await this.client.get("/city/yacht", {
          params: { cityId: input.cityId },
        });
        return data;
      }

            // ── GET /api/product-details?url=<encoded-url> ──
      case "get_product_details": {
        const { data } = await this.client.get("/product-details", {
          params: { url: input.url },
        });
        return data;
      }

      // ── VISA SERVICES ──
      case "get_visas": {
        const result = await visaService.getVisas({
          country: input.country as string,
          limit: input.limit as number,
        });
        return {
          success: true,
          message: `Found ${result.length} visa(s)`,
          data: result,
        };
      }

            case "get_popular_visas": {
        const result = await visaService.getPopularVisas();
        const limited = result.slice(0, (input.limit as number) || 8);
        return {
          success: true,
          message: `Found ${limited.length} popular visa destinations`,
          data: limited,
        };
      }

            // ── GET TOUR CARDS FOR CAROUSEL DISPLAY ──
      case "get_tour_cards": {
        // This tool returns its own JSON string, so we need to parse and return it
        const result = await getTourCards(input);
        return JSON.parse(result);
      }

      // ── CURRENCY CONVERSION ──
      case "convert_currency": {
        const { amount, fromCurrency, toCurrency } = input;

        // Use free exchange rate API (exchangerate-api.com)
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );

        const rates = response.data.rates;
        const exchangeRate = rates[toCurrency as string];

        if (!exchangeRate) {
          throw new Error(`Currency ${toCurrency} not supported`);
        }

        const convertedAmount = (amount as number) * exchangeRate;
        const rateRounded = parseFloat(exchangeRate.toFixed(4));
        const convertedRounded = parseFloat(convertedAmount.toFixed(2));

        // Persist to MongoDB if DB is connected
        if (isDBConnected() && sessionId) {
          Conversion.create({
            session_id: sessionId,
            amount: amount as number,
            fromCurrency: (fromCurrency as string).toUpperCase(),
            toCurrency: (toCurrency as string).toUpperCase(),
            convertedAmount: convertedRounded,
            exchangeRate: rateRounded,
          }).catch((err) => console.error("[DB] Failed to save conversion:", err));
        }

        return {
          success: true,
          data: {
            originalAmount: amount,
            fromCurrency,
            toCurrency,
            exchangeRate: rateRounded,
            convertedAmount: convertedRounded,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // ── Milestone 2 (not active yet) ──
      // case "get_user_profile": ...
      // case "update_user_profile": ...

      // ── Milestone 3 (not active yet) ──
      // case "get_user_bookings": ...
      // case "get_payment_history": ...

      default: {
        throw new Error(`Unknown tool: ${toolName}`);
      }
    }
  }
}