import { TourCard, TourCarousel } from '../dto/tour-card.dto';

export class TourCardService {
  /**
   * Format tour data into card format
   */
  static formatTourCards(tours: any[], title: string = "Recommended Tours", subtitle?: string): TourCarousel {
    const cards: TourCard[] = tours.map((tour, index) => {
      // Handle different price field names from API
      const salePrice = tour.discountedAmount || tour.salePrice || tour.price || tour.current_price || tour.amount || 0;
      const normalPrice = tour.amount || tour.normalPrice || tour.original_price || tour.normal_price || null;
      
      // Calculate discount if both prices exist
      let discount = 0;
      let discountPercentage = 0;
      
      if (normalPrice && salePrice && normalPrice > salePrice) {
        discount = normalPrice - salePrice;
        discountPercentage = Math.round((discount / normalPrice) * 100);
      }

      // Extract price numbers (remove AED and convert to number)
      const currentPrice = this.extractPrice(salePrice);
      const originalPrice = normalPrice ? this.extractPrice(normalPrice) : null;

      // Determine if tour is recommended (you can customize this logic)  
      const isRecommended = (parseFloat(tour.averageRating) || parseFloat(tour.rating)) >= 4.8 || tour.is_featured || false;
      const isNew = tour.is_new || this.isRecentlyAdded(tour.created_at);

      return {
        id: tour.id || tour.slug || `tour_${index}`,
        title: tour.name || tour.title || tour.productName || 'Tour',
        slug: tour.slug || tour.id,
        image: (tour.image?.src) || tour.image || tour.banner_image || tour.thumbnail || tour.bannerImage || '',
        location: tour.city || tour.cityName || tour.location || this.extractLocationFromName(tour.name || tour.title || ''),
        category: tour.category || (Array.isArray(tour.categories) && tour.categories[0]?.label) || this.categorizeActivity(tour.name || tour.title || ''),
        originalPrice: originalPrice,
        currentPrice: currentPrice,
        currency: 'AED',
        discount: discount > 0 ? discount : undefined,
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        isRecommended,
        isNew,
        rPoints: this.calculateRPoints(currentPrice),
        rating: parseFloat(tour.averageRating) || parseFloat(tour.rating) || undefined,
        reviewCount: parseInt(tour.reviewCount || tour.review_count) || undefined,
        duration: (Array.isArray(tour.duration) ? tour.duration[0]?.label : tour.duration) || this.extractDuration(tour.name || tour.description || ''),
        highlights: this.extractHighlights(tour.description || tour.highlights || (Array.isArray(tour.categories) ? tour.categories.map((c: any) => c.label).join(', ') : '')),

        url: this.buildTourUrl(tour.productUrl?.href || tour.slug || tour.id || tour.url)
      };
    });

    return {
      type: 'tour_carousel',
      title,
      subtitle,
      cards,
      totalResults: tours.length
    };
  }

  /**
   * Extract price from string (e.g., "AED 25.99" -> 25.99)
   */
  static extractPrice(priceString: string): number {
    if (!priceString) return 0;
    
    // Remove currency symbols and extract number
    const price = priceString.toString()
      .replace(/[^\d.,]/g, '') // Remove non-numeric characters except . and ,
      .replace(',', ''); // Remove commas
    
    return parseFloat(price) || 0;
  }

  /**
   * Check if tour was recently added (within last 30 days)
   */
  private static isRecentlyAdded(createdAt?: string): boolean {
    if (!createdAt) return false;
    
    const created = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return created > thirtyDaysAgo;
  }

  /**
   * Extract location from tour name if not provided separately
   */
  static extractLocationFromName(name: string): string {
    const locations = [
      // UAE
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah',
      // Saudi Arabia
      'Jeddah', 'Riyadh', 'Makkah', 'Dammam',
      // Oman
      'Muscat', 'Khasab',
      // Thailand
      'Bangkok', 'Phuket', 'Krabi', 'Koh Samui', 'Pattaya',
      // Indonesia
      'Bali',
      // Malaysia
      'Kuala Lumpur', 'Langkawi', 'Penang',
      // Singapore
      'Singapore'
    ];
    
    for (const location of locations) {
      if (name.toLowerCase().includes(location.toLowerCase())) {
        return location;
      }
    }
    
    return 'Middle East'; // Default fallback
  }

  /**
   * Categorize activity based on name/description
   */
  static categorizeActivity(name: string): string {
    const categories = {
      'Desert Safari': ['desert', 'safari', 'dune', 'camel'],
      'City Tour': ['city tour', 'sightseeing'],
      'Theme Park': ['theme park', 'ferrari world', 'legoland', 'motiongate', 'IMG', 'universal', 'fantasea'],
      'Water Park': ['aquaventure', 'waterworld', 'water park', 'splash'],
      'Adventure': ['zipline', 'skydiving', 'bungee', 'quad bike', 'buggy', 'mountain', 'trek', 'safari'],
      'Cruise': ['cruise', 'dhow', 'dinner cruise', 'boat', 'sailing'],
      'Attraction': ['burj khalifa', 'museum', 'aquarium', 'frame', 'tower', 'flyer', 'cable car'],
      'Cultural': ['mosque', 'heritage', 'cultural', 'traditional', 'temple', 'palace', 'fort'],
      'Religious': ['umrah', 'religious', 'spiritual', 'holy', 'mosque', 'temple'],
      'Island': ['island', 'beach', 'marine park', 'coral', 'snorkeling'],
      'Entertainment': ['show', 'cabaret', 'nightlife', 'entertainment'],
      'Nature': ['gardens', 'nature', 'wildlife', 'elephant', 'safari'],
      'Shopping': ['shopping', 'mall', 'souq', 'market'],
      'Food': ['food', 'culinary', 'street food', 'dining']
    };

    const lowerName = name.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    
    return 'Experience';
  }

  /**
   * Calculate R-Points based on price (1% of price rounded to nearest 100)
   */
  private static calculateRPoints(price: number): number {
    if (!price || price <= 0) return 0;
    
    const points = price * 0.01; // 1% of price
    return Math.round(points / 100) * 100; // Round to nearest 100
  }

  /**
   * Extract duration from description/name
   */
  private static extractDuration(text: string): string | undefined {
    if (!text) return undefined;
    
    const durationPatterns = [
      /(\d+)\s*hours?/i,
      /(\d+)\s*hrs?/i,
      /(\d+)\s*days?/i,
      /(full\s*day)/i,
      /(half\s*day)/i
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * Extract highlights from description
   */
  private static extractHighlights(text: string): string[] | undefined {
    if (!text) return undefined;

    // Common highlights to look for across all destinations
    const highlights = [
      // UAE Highlights
      'Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Marina',
      'Desert Safari', 'Camel Riding', 'Dune Bashing', 'BBQ Dinner',
      'Ferrari World', 'Yas Island', 'Sheikh Zayed Mosque',
      'Aquaventure', 'Atlantis', 'Dubai Fountain', 'Global Village',
      'Hot Air Balloon', 'Skydiving', 'Zip Line', 'Dhow Cruise',
      'Emirates Palace', 'Louvre Abu Dhabi', 'Jais Zipline',
      // Saudi Arabia Highlights
      'Historical District', 'Corniche', 'Masmak Fortress', 'Kingdom Centre',
      'Holy Kaaba', 'Mount Arafat', 'Half Moon Bay', 'Heritage Village',
      // Oman Highlights
      'Grand Mosque', 'Twin Forts', 'Mutrah Souq', 'Dhow Cruise',
      'Mountain Safari', 'Dolphins', 'Norway of Arabia',
      // Thailand Highlights
      'Floating Markets', 'Grand Palace', 'Elephant Sanctuary',
      'Phi Phi Island', 'Sunset Cruise', 'Fantasea Show',
      'Four Islands', 'Emerald Pool', 'Hot Springs', 'Ang Thong',
      'Cabaret Show', 'Coral Island',
      // Indonesia Highlights
      'Mount Batur', 'Sunrise Trek', 'Rice Terraces', 'Water Temple',
      'Art Workshop', 'Ubud',
      // Malaysia Highlights
      'Petronas Towers', 'Batu Caves', 'Street Food', 'Cable Car',
      'Island Hopping', 'George Town', 'Heritage Walk', 'Penang Hill',
      // Singapore Highlights
      'Singapore Flyer', 'Gardens by the Bay', 'Universal Studios',
      'Night Safari', 'Orchard Road'
    ];

    const foundHighlights = highlights.filter(highlight => 
      text.toLowerCase().includes(highlight.toLowerCase())
    );

    return foundHighlights.length > 0 ? foundHighlights.slice(0, 4) : undefined;
  }

  /**
   * Build tour URL from slug
   */
  private static buildTourUrl(slug: string): string {
    if (!slug) return 'https://www.raynatours.com';
    
    // If already a full URL, return as-is
    if (slug.startsWith('http')) {
      return slug;
    }
    
    // Build URL from slug
    const cleanSlug = slug.replace(/^\//, ''); // Remove leading slash if present
    return `https://www.raynatours.com/${cleanSlug}`;
  }

  /**
   * Create featured tours carousel
   */
  static createFeaturedCarousel(tours: any[]): TourCarousel {
    const featuredTours = tours
      .filter(tour => tour.rating >= 4.8 || tour.is_featured)
      .slice(0, 6);

    return this.formatTourCards(
      featuredTours, 
      "⭐ Featured Tours", 
      "Most popular tours chosen by travelers"
    );
  }

  /**
   * Create discount offers carousel
   */
  static createDiscountCarousel(tours: any[]): TourCarousel {
    const discountTours = tours
      .filter(tour => tour.original_price && tour.price && tour.original_price > tour.price)
      .slice(0, 6);

    return this.formatTourCards(
      discountTours, 
      "💰 Special Offers", 
      "Limited time deals - Save up to 50%"
    );
  }

  /**
   * Create location-based carousel
   */
  static createLocationCarousel(tours: any[], location: string): TourCarousel {
    const locationTours = tours
      .filter(tour => 
        tour.city?.toLowerCase().includes(location.toLowerCase()) ||
        tour.name?.toLowerCase().includes(location.toLowerCase())
      )
      .slice(0, 6);

    return this.formatTourCards(
      locationTours, 
      `🏙️ Best in ${location}`, 
      `Top-rated activities and tours in ${location}`
    );
  }

  /**
   * Create category-based carousel
   */
  static createCategoryCarousel(tours: any[], category: string): TourCarousel {
    const categoryTours = tours
      .filter(tour => {
        const tourCategory = this.categorizeActivity(tour.name || '');
        return tourCategory.toLowerCase().includes(category.toLowerCase()) ||
               tour.name?.toLowerCase().includes(category.toLowerCase());
      })
      .slice(0, 6);

    return this.formatTourCards(
      categoryTours, 
      `🎯 ${category} Activities`, 
      `Best ${category.toLowerCase()} experiences`
    );
  }

  /**
   * Get emoji for category
   */
  static getEmojiForCategory(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'desert safari': '🏜️',
      'adventure': '🚁',
      'culture': '🏛️',
      'religious': '🕌',
      'theme park': '🎢',
      'water park': '🌊',
      'cruise': '🚢',
      'island': '🏝️',
      'entertainment': '🎭',
      'nature': '🌺',
      'shopping': '🛍️',
      'food': '🍜',
      'attraction': '🗼',
      'wildlife': '🐘',
      'beach': '🏖️',
      'mountain': '⛰️',
      'temple': '⛩️',
      'modern': '🏙️'
    };

    const lowerCategory = category.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerCategory.includes(key)) {
        return emoji;
      }
    }
    
    return '🎯'; // Default emoji
  }
}