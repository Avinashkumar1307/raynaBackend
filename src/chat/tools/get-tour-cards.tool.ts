import { z } from "zod";
import { RaynaApiService } from "../rayna-api.service";
import { TourCardService } from "../services/tour-card.service";
import { 
  TOUR_DATABASE, 
  getToursByLocation, 
  getToursByCountry, 
  getToursByCategory, 
  getPopularTours, 
  searchTours 
} from "../data/tour-database";

export const getTourCardsSchema = {
  name: "get_tour_cards",
  description: "Get tours in card format for display in carousel. Use this when users ask for tour recommendations, popular tours, or want to browse activities.",
  input_schema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "Filter by city (Dubai, Abu Dhabi, Ras Al Khaimah, Jeddah, Riyadh, Makkah, Dammam, Muscat, Khasab, Bangkok, Phuket, Krabi, Koh Samui, Pattaya, Bali, Kuala Lumpur, Langkawi, Penang, Singapore)",
      },
      category: {
        type: "string", 
        description: "Filter by category (desert safari, city tour, theme park, water park, adventure, cruise, cultural, religious, island, entertainment, nature, shopping, food)",
      },
      carouselType: {
        type: "string",
        enum: ["featured", "discount", "location", "category", "all"],
        description: "Type of carousel to create - featured (popular tours), discount (special offers), location (city-specific), category (activity type), or all (general recommendations)",
        default: "featured"
      },
      limit: {
        type: "number",
        description: "Maximum number of tour cards to return (default 6, max 12)",
        default: 6,
      },
    },
    required: [],
    additionalProperties: false,
  },
};

const inputSchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(), 
  carouselType: z.enum(["featured", "discount", "location", "category", "all"]).default("featured"),
  limit: z.number().min(1).max(12).default(6),
});

export async function getTourCards(input: unknown) {
  try {
    const { city, category, carouselType, limit } = inputSchema.parse(input);
    const raynaApi = new RaynaApiService();

    console.log(`[getTourCards] Fetching ${carouselType} tours for ${city || 'all cities'}, category: ${category || 'all'}, limit: ${limit}`);

    // Get tours based on filters
    let tours: any[] = [];
    let useStaticData = false;
    let hasOnlyTransfers = false;

    if (city && city.toLowerCase() !== 'all') {
      // First get available cities to find the cityId
      const citiesResult = await raynaApi.execute('get_available_cities', { productType: 'tour' });
      const citiesData = JSON.parse(citiesResult);
      
      if (citiesData.success && citiesData.data) {
        // API shape: { data: { data: { options: [ { countryName, cities: [ {id, name} ] } ] } } }
        const options = citiesData.data?.data?.data?.options || [];
        const allCities = options.flatMap((o: any) => o.cities || []);
        // Find the city ID by name
        const cityData = allCities.find((c: any) => 
          c.name?.toLowerCase() === city.toLowerCase()
        );
        
        if (cityData) {
          // Get city-specific tours using city/products (richer data)
          const cityResult = await raynaApi.execute('get_city_products', { 
            cityId: cityData.id
          });
          const cityResultData = JSON.parse(cityResult);
          const payload = cityResultData?.data || {};
          const products = payload?.data?.data?.products || [];
          tours = Array.isArray(products) ? products : [];
          // Attach city for display
          tours = tours.map((p: any) => ({ ...p, city }));
        }
      }
    } else {
      // Default to a popular city (Dubai) to ensure results
      const citiesResult = await raynaApi.execute('get_available_cities', { productType: 'tour' });
      const citiesData = JSON.parse(citiesResult);
      const options = citiesData?.data?.data?.data?.options || [];
      const allCities = options.flatMap((o: any) => o.cities || []);
      const dubai = allCities.find((c: any) => c.name?.toLowerCase() === 'dubai');
      const defaultCityId = dubai?.id || allCities[0]?.id;

      if (defaultCityId) {
        const cityResult = await raynaApi.execute('get_city_products', { cityId: defaultCityId });
        const cityResultData = JSON.parse(cityResult);
        const payload = cityResultData?.data || {};
        const products = payload?.data?.data?.products || [];
        tours = Array.isArray(products) ? products : [];
      } else {
        tours = [];
      }
    }

    // Check if API returned only transfers/low-value services
    hasOnlyTransfers = Array.isArray(tours) && tours.length > 0 && 
      tours.every(tour => {
        const name = (tour.name || tour.title || '').toLowerCase();
        const category = (tour.category || '').toLowerCase();
        return name.includes('transfer') || name.includes('pickup') || name.includes('drop') ||
               category.includes('transfer') || category.includes('pickup') || category.includes('drop');
      });

    // Log transfer detection
    if (hasOnlyTransfers) {
      console.log(`[getTourCards] Detected only transfers for ${city}, switching to static data`);
    }

    // Fallback to static database if API fails, returns no results, or only has transfers
    if (!Array.isArray(tours) || tours.length === 0 || hasOnlyTransfers) {
      console.log('[getTourCards] Using static tour database as fallback');
      useStaticData = true;
      
      if (city && city.toLowerCase() !== 'all') {
        tours = getToursByLocation(city);
      } else if (category && category.toLowerCase() !== 'all') {
        tours = getToursByCategory(category);
      } else {
        tours = getPopularTours(limit);
      }
      
      // Convert static data to API format
      tours = tours.map(tour => ({
        id: tour.id,
        name: tour.title,
        title: tour.title,
        category: tour.category,
        city: tour.location,
        location: tour.location,
        price: tour.price,
        salePrice: tour.price,
        amount: tour.price,
        currency: tour.currency,
        duration: tour.duration,
        description: tour.description,
        highlights: tour.highlights,
        url: tour.url,
        slug: tour.id,
        rating: tour.rating,
        averageRating: tour.rating,
        is_featured: tour.isPopular,
        is_new: tour.isNew
      }));
    }

    // Apply category filter if specified and using API data
    if (!useStaticData && category && category.toLowerCase() !== 'all') {
      const cat = category.toLowerCase();
      tours = tours.filter((tour: any) => {
        const tourCategory = TourCardService['categorizeActivity'](tour.name || tour.title || '');
        const byName = (tour.name || tour.title || '').toLowerCase().includes(cat);
        const byFlatCategory = (tour.category || '').toLowerCase().includes(cat);
        const byArrayCategory = Array.isArray(tour.categories) && tour.categories.some((c: any) => (c.label || '').toLowerCase().includes(cat));
        return byName || byFlatCategory || byArrayCategory || tourCategory.toLowerCase().includes(cat);
      });
    }

    // Limit results
    tours = tours.slice(0, limit);

    if (tours.length === 0) {
      return JSON.stringify({
        success: false,
        message: `No tours found${city ? ` in ${city}` : ''}${category ? ` for ${category}` : ''}. Try browsing our popular destinations like Dubai, Bangkok, or Singapore!`,
        data: null
      });
    }

    // Create appropriate carousel based on type
    let carousel;
    
    if (city && tours.length > 0) {
      // Already city-filtered — format directly with nicer titles
      const niceTitle = carouselType === 'featured' ? `⭐ Featured in ${city}` : `🏙️ Best in ${city}`;
      const niceSubtitle = carouselType === 'discount' ? 'Limited time deals' : `Top-rated activities and tours in ${city}`;
      carousel = TourCardService.formatTourCards(tours, niceTitle, niceSubtitle);
    } else {
      switch (carouselType) {
        case 'featured':
          carousel = TourCardService.createFeaturedCarousel(tours);
          break;
        case 'discount':
          carousel = TourCardService.createDiscountCarousel(tours);
          break;
        case 'location':
          carousel = TourCardService.createLocationCarousel(tours, city || 'UAE');
          break;
        case 'category':
          carousel = TourCardService.createCategoryCarousel(tours, category || 'Adventure');
          break;
        default:
          carousel = TourCardService.formatTourCards(tours, "🌟 Recommended Tours", "Popular tours and activities");
      }
    }

    // Create card format response text
    let responseText = `Here are amazing ${category || 'tour'} options${city ? ` in ${city}` : ''}:\n\n`;
    
    if (carousel.cards.length > 0) {
      // Add cards in the requested format
      carousel.cards.forEach((card, index) => {
        const emoji = useStaticData ? 
          TOUR_DATABASE.find(t => t.id === card.id)?.emoji || '🎯' : 
          TourCardService['getEmojiForCategory'](card.category);
        
        responseText += `${index + 1}. ${emoji} ${card.title} | ${card.category} 💰 ${card.currency} ${card.currentPrice} | ⏱ ${card.duration} 🔗 ${card.url}\n`;
      });
      
      responseText += `\n📊 **Quick Summary:**\n`;
      const priceRange = carousel.cards.length > 1 ? 
        `${carousel.cards[0].currency} ${Math.min(...carousel.cards.map(c => c.currentPrice))} - ${carousel.cards[0].currency} ${Math.max(...carousel.cards.map(c => c.currentPrice))}` :
        `${carousel.cards[0].currency} ${carousel.cards[0].currentPrice}`;

      responseText += `💰 Price range: ${priceRange}\n`;
      responseText += `📍 Locations: ${[...new Set(carousel.cards.map(c => c.location))].join(', ')}\n`;
      responseText += `🎫 Total options: ${carousel.cards.length}\n`;
      
      if (useStaticData) {
        responseText += `\n🌟 These are curated experiences from our premium collection!\n`;
      }
      
      const discountCount = carousel.cards.filter(c => c.discount).length;
      if (discountCount > 0) {
        responseText += `🎯 Special offers: ${discountCount} tours with discounts\n`;
      }
    }

    return JSON.stringify({
      success: true,
      message: responseText,
      data: {
        carousel,
        totalResults: tours.length,
        filters: {
          city: city || 'all',
          category: category || 'all',
          carouselType
        },
        dataSource: useStaticData ? 'static' : 'api',
        note: useStaticData ? 'Showing curated experiences' : 'Live data from API',
        fallbackReason: useStaticData ? (hasOnlyTransfers ? 'transfers_only' : 'no_api_data') : null
      }
    });

  } catch (error) {
    console.error('[getTourCards] Error:', error);
    
    // Emergency fallback - show popular tours
    try {
      const fallbackTours = getPopularTours(6);
      const fallbackCarousel = TourCardService.formatTourCards(
        fallbackTours.map(tour => ({
          id: tour.id,
          name: tour.title,
          title: tour.title,
          category: tour.category,
          city: tour.location,
          location: tour.location,
          price: tour.price,
          salePrice: tour.price,
          amount: tour.price,
          currency: tour.currency,
          duration: tour.duration,
          url: tour.url,
          rating: tour.rating,
          is_featured: tour.isPopular
        })),
        "🌟 Popular Tours",
        "Here are some of our most popular experiences"
      );
      
      let fallbackText = "I had trouble finding specific tours, but here are some popular options:\n\n";
      
      fallbackCarousel.cards.forEach((card, index) => {
        const tour = fallbackTours[index];
        fallbackText += `${index + 1}. ${tour.emoji} ${card.title} | ${card.category} 💰 ${card.currency} ${card.currentPrice} | ⏱ ${card.duration} 🔗 ${card.url}\n`;
      });
      
      return JSON.stringify({
        success: true,
        message: fallbackText,
        data: {
          carousel: fallbackCarousel,
          totalResults: fallbackTours.length,
          filters: { city: 'all', category: 'all', carouselType: 'featured' },
          fallback: true
        }
      });
    } catch (fallbackError) {
      return JSON.stringify({
        success: false,
        message: "I'm having trouble loading tours right now. Please visit raynatours.com or try asking about specific destinations like Dubai, Bangkok, or Singapore!",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}