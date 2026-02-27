import axios from "axios";
import { visaResponseSchema, type VisaResponse, type VisaProduct, type GetVisasParams } from "./dto/visa.dto";

class VisaService {
  private readonly baseUrl = "https://earnest-panda-e8edbd.netlify.app/api";

  /**
   * Get all available visas or filter by country
   */
  async getVisas(params?: GetVisasParams): Promise<VisaProduct[]> {
    try {
      console.log("[VisaService] Fetching visas with params:", params);

      const response = await axios.get(`${this.baseUrl}/visas`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Rayna-Tours-Chatbot/1.0.0',
        },
      });

      console.log("[VisaService] Raw response status:", response.status);

      // Validate response structure
      const validatedData = visaResponseSchema.parse(response.data);
      
      if (!validatedData.success) {
        throw new Error("API returned success: false");
      }

      let visas = validatedData.products || [];

      // Filter by country if specified
      if (params?.country) {
        const countryFilter = params.country.toLowerCase().trim();
        visas = visas.filter(visa => 
          visa.countrySlug.toLowerCase().includes(countryFilter) ||
          visa.country.toLowerCase().includes(countryFilter)
        );
      }

      // Apply limit
      if (params?.limit && params.limit > 0) {
        visas = visas.slice(0, params.limit);
      }

      console.log(`[VisaService] Returning ${visas.length} visas`);
      
      return visas;

    } catch (error) {
      console.error("[VisaService] Error fetching visas:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error("Request timeout - visa service is taking too long to respond");
        }
        if (error.response) {
          throw new Error(`Visa API error: ${error.response.status} ${error.response.statusText}`);
        }
        if (error.request) {
          throw new Error("Cannot connect to visa service - please check your internet connection");
        }
      }
      
      throw new Error(`Failed to fetch visas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get visas for popular destinations
   */
  async getPopularVisas(): Promise<VisaProduct[]> {
    try {
      const allVisas = await this.getVisas({ limit: 50 });
      
      // Define popular destinations for Middle East travelers
      const popularCountries = [
        'dubai', 'usa', 'uk', 'canada', 'australia', 'schengen', 
        'singapore', 'thailand', 'malaysia', 'turkey', 'japan', 'south-korea'
      ];

      const popularVisas = allVisas.filter(visa => 
        popularCountries.some(country => 
          visa.countrySlug.toLowerCase().includes(country) ||
          visa.country.toLowerCase().includes(country)
        )
      );

      return popularVisas.slice(0, 10);

    } catch (error) {
      console.error("[VisaService] Error fetching popular visas:", error);
      throw error;
    }
  }

  /**
   * Search visas by country name (fuzzy matching)
   */
  async searchVisasByCountry(searchQuery: string): Promise<VisaProduct[]> {
    try {
      const allVisas = await this.getVisas({ limit: 100 });
      const query = searchQuery.toLowerCase().trim();

      const matchedVisas = allVisas.filter(visa => {
        return (
          visa.country.toLowerCase().includes(query) ||
          visa.countrySlug.toLowerCase().includes(query) ||
          visa.name.toLowerCase().includes(query)
        );
      });

      return matchedVisas.slice(0, 10);

    } catch (error) {
      console.error("[VisaService] Error searching visas:", error);
      throw error;
    }
  }
}

export const visaService = new VisaService();