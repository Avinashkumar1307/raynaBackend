/**
 * Comprehensive tour database for Middle East & Southeast Asia
 * This provides quick access to tour data when API calls fail or for fallback
 */

export interface TourData {
  id: string;
  title: string;
  category: string;
  location: string;
  country: string;
  price: number;
  currency: string;
  duration: string;
  description?: string;
  highlights?: string[];
  url: string;
  emoji: string;
  rating?: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export const TOUR_DATABASE: TourData[] = [
  // 🇦🇪 UAE - Dubai
  {
    id: 'dubai-desert-safari',
    title: 'Dubai Desert Safari',
    category: 'Adventure & Culture',
    location: 'Dubai',
    country: 'UAE',
    price: 165.00,
    currency: 'AED',
    duration: '6 hrs',
    emoji: '🏜️',
    url: 'https://www.raynatours.com/dubai/adventure/desert-safari-e-509001',
    highlights: ['Dune Bashing', 'Camel Riding', 'BBQ Dinner', 'Belly Dance'],
    rating: 4.8,
    isPopular: true
  },
  {
    id: 'burj-khalifa-top',
    title: 'Burj Khalifa At The Top',
    category: 'Attractions & Sightseeing',
    location: 'Dubai',
    country: 'UAE',
    price: 189.00,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🏗️',
    url: 'https://www.raynatours.com/dubai/attractions/burj-khalifa-e-509002',
    highlights: ['148th Floor', 'Panoramic Views', 'High-speed Elevator'],
    rating: 4.9,
    isPopular: true
  },
  {
    id: 'dubai-marina-cruise',
    title: 'Dubai Marina Dhow Cruise',
    category: 'Cruise & Boat Tours',
    location: 'Dubai',
    country: 'UAE',
    price: 89.25,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🚢',
    url: 'https://www.raynatours.com/dubai/cruise/marina-dhow-cruise-e-509003',
    highlights: ['Marina Views', 'International Buffet', 'Live Entertainment'],
    rating: 4.7
  },
  {
    id: 'global-village-dubai',
    title: 'Global Village Dubai',
    category: 'Theme Parks & Entertainment',
    location: 'Dubai',
    country: 'UAE',
    price: 25.00,
    currency: 'AED',
    duration: '4 hrs',
    emoji: '🎢',
    url: 'https://www.raynatours.com/dubai/entertainment/global-village-e-509004',
    highlights: ['Cultural Pavilions', 'Shopping', 'Shows', 'Food Courts'],
    rating: 4.5
  },
  {
    id: 'atlantis-aquaventure',
    title: 'Atlantis Aquaventure',
    category: 'Water Parks & Adventure',
    location: 'Dubai',
    country: 'UAE',
    price: 315.00,
    currency: 'AED',
    duration: 'Full Day',
    emoji: '🌊',
    url: 'https://www.raynatours.com/dubai/waterpark/atlantis-aquaventure-e-509005',
    highlights: ['Water Slides', 'Aquarium', 'Beach Access', 'Dolphin Bay'],
    rating: 4.6,
    isPopular: true
  },

  // 🇦🇪 UAE - Abu Dhabi
  {
    id: 'sheikh-zayed-mosque',
    title: 'Sheikh Zayed Grand Mosque',
    category: 'Cultural & Religious',
    location: 'Abu Dhabi',
    country: 'UAE',
    price: 125.00,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🕌',
    url: 'https://www.raynatours.com/abu-dhabi/cultural/grand-mosque-e-509007',
    highlights: ['Largest Mosque', 'Architecture', 'Guided Tour'],
    rating: 4.9,
    isPopular: true
  },
  {
    id: 'ferrari-world',
    title: 'Ferrari World Abu Dhabi',
    category: 'Theme Parks',
    location: 'Abu Dhabi',
    country: 'UAE',
    price: 345.00,
    currency: 'AED',
    duration: 'Full Day',
    emoji: '🏎️',
    url: 'https://www.raynatours.com/abu-dhabi/themepark/ferrari-world-e-509008',
    highlights: ['Formula Rossa', 'Flying Aces', 'Ferrari Experiences'],
    rating: 4.7,
    isPopular: true
  },

  // 🇦🇪 UAE - Ras Al Khaimah
  {
    id: 'jais-zipline',
    title: 'Jais Flight Zipline',
    category: 'Adventure & Thrills',
    location: 'Ras Al Khaimah',
    country: 'UAE',
    price: 150.00,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🚁',
    url: 'https://www.raynatours.com/rak/adventure/jais-zipline-e-509011',
    highlights: ['World\'s Longest Zipline', 'Mountain Views', 'Adrenaline Rush'],
    rating: 4.8,
    isPopular: true
  },

  // 🇸🇦 Saudi Arabia
  {
    id: 'jeddah-historical',
    title: 'Jeddah Historical District',
    category: 'Heritage & Culture',
    location: 'Jeddah',
    country: 'Saudi Arabia',
    price: 145.00,
    currency: 'AED',
    duration: '4 hrs',
    emoji: '🏛️',
    url: 'https://www.raynatours.com/jeddah/heritage/historical-district-e-509013',
    highlights: ['Al-Balad', 'Traditional Architecture', 'Heritage Sites'],
    rating: 4.5
  },
  {
    id: 'masmak-fortress',
    title: 'Masmak Fortress',
    category: 'Historical & Cultural',
    location: 'Riyadh',
    country: 'Saudi Arabia',
    price: 85.00,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🏰',
    url: 'https://www.raynatours.com/riyadh/historical/masmak-fortress-e-509015',
    highlights: ['Saudi History', 'Museum', 'Architecture'],
    rating: 4.3
  },
  {
    id: 'umrah-package',
    title: 'Umrah Package',
    category: 'Religious & Spiritual',
    location: 'Makkah',
    country: 'Saudi Arabia',
    price: 1250.00,
    currency: 'AED',
    duration: '3 Days',
    emoji: '🕋',
    url: 'https://www.raynatours.com/makkah/religious/umrah-package-e-509017',
    highlights: ['Holy Kaaba', 'Spiritual Journey', 'Guided Tours'],
    rating: 5.0,
    isPopular: true
  },

  // 🇴🇲 Oman
  {
    id: 'muscat-grand-mosque',
    title: 'Sultan Qaboos Grand Mosque',
    category: 'Religious & Architecture',
    location: 'Muscat',
    country: 'Oman',
    price: 115.00,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🕌',
    url: 'https://www.raynatours.com/muscat/religious/grand-mosque-e-509021',
    highlights: ['Beautiful Architecture', 'Prayer Hall', 'Islamic Art'],
    rating: 4.7
  },
  {
    id: 'khasab-dhow-cruise',
    title: 'Khasab Dhow Cruise',
    category: 'Marine & Wildlife',
    location: 'Khasab',
    country: 'Oman',
    price: 195.00,
    currency: 'AED',
    duration: '6 hrs',
    emoji: '🐬',
    url: 'https://www.raynatours.com/khasab/marine/dhow-cruise-e-509024',
    highlights: ['Dolphin Watching', 'Fjords', 'Swimming', 'Snorkeling'],
    rating: 4.8,
    isPopular: true
  },

  // 🇹🇭 Thailand - Bangkok
  {
    id: 'bangkok-floating-markets',
    title: 'Bangkok Floating Markets',
    category: 'Culture & Attractions',
    location: 'Bangkok',
    country: 'Thailand',
    price: 434.98,
    currency: 'AED',
    duration: '4 hrs',
    emoji: '🌊',
    url: 'https://www.raynatours.com/bangkok/culture/floating-markets-e-509026',
    highlights: ['Traditional Markets', 'Boat Rides', 'Local Food', 'Culture'],
    rating: 4.6,
    isPopular: true
  },
  {
    id: 'chaophraya-dinner-cruise',
    title: 'Chaophraya Princess Dinner Cruise',
    category: 'Cruise & Boat Tours',
    location: 'Bangkok',
    country: 'Thailand',
    price: 123.53,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🚢',
    url: 'https://www.raynatours.com/bangkok/cruise/princess-dinner-cruise-e-509027',
    highlights: ['River Views', 'Thai Cuisine', 'Traditional Dance', 'Temples'],
    rating: 4.5
  },
  {
    id: 'grand-palace-bangkok',
    title: 'Grand Palace & Temple Tour',
    category: 'Cultural & Religious',
    location: 'Bangkok',
    country: 'Thailand',
    price: 189.00,
    currency: 'AED',
    duration: '4 hrs',
    emoji: '⛩️',
    url: 'https://www.raynatours.com/bangkok/temples/grand-palace-e-509028',
    highlights: ['Emerald Buddha', 'Royal Palace', 'Wat Pho', 'Architecture'],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'elephant-sanctuary',
    title: 'Elephant Sanctuary Visit',
    category: 'Wildlife & Conservation',
    location: 'Bangkok',
    country: 'Thailand',
    price: 245.75,
    currency: 'AED',
    duration: '6 hrs',
    emoji: '🐘',
    url: 'https://www.raynatours.com/bangkok/wildlife/elephant-sanctuary-e-509029',
    highlights: ['Elephant Care', 'Feeding', 'Bathing', 'Conservation'],
    rating: 4.8,
    isPopular: true
  },

  // 🇹🇭 Thailand - Phuket
  {
    id: 'phi-phi-island',
    title: 'Phi Phi Island Day Trip',
    category: 'Island Hopping',
    location: 'Phuket',
    country: 'Thailand',
    price: 185.50,
    currency: 'AED',
    duration: '8 hrs',
    emoji: '🏝️',
    url: 'https://www.raynatours.com/phuket/islands/phi-phi-day-trip-e-509030',
    highlights: ['Maya Bay', 'Snorkeling', 'Beach Time', 'Lunch'],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'phuket-sunset-cruise',
    title: 'Phuket Sunset Cruise',
    category: 'Romantic & Leisure',
    location: 'Phuket',
    country: 'Thailand',
    price: 165.00,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🌅',
    url: 'https://www.raynatours.com/phuket/cruise/sunset-cruise-e-509031',
    highlights: ['Sunset Views', 'Romantic Setting', 'Drinks', 'Relaxation'],
    rating: 4.6
  },

  // 🇹🇭 Thailand - Other Cities
  {
    id: 'four-islands-krabi',
    title: 'Four Islands Tour',
    category: 'Island Hopping & Snorkeling',
    location: 'Krabi',
    country: 'Thailand',
    price: 145.25,
    currency: 'AED',
    duration: '7 hrs',
    emoji: '🏝️',
    url: 'https://www.raynatours.com/krabi/islands/four-islands-tour-e-509033',
    highlights: ['4 Islands', 'Snorkeling', 'Swimming', 'Beach Lunch'],
    rating: 4.5
  },
  {
    id: 'ang-thong-marine',
    title: 'Ang Thong Marine Park',
    category: 'Island Adventure',
    location: 'Koh Samui',
    country: 'Thailand',
    price: 195.50,
    currency: 'AED',
    duration: '8 hrs',
    emoji: '🐠',
    url: 'https://www.raynatours.com/kohsamui/marine/ang-thong-park-e-509035',
    highlights: ['Marine Park', 'Kayaking', 'Hiking', 'Emerald Lake'],
    rating: 4.6,
    isPopular: true
  },
  {
    id: 'tiffany-cabaret',
    title: 'Tiffany\'s Cabaret Show',
    category: 'Entertainment & Nightlife',
    location: 'Pattaya',
    country: 'Thailand',
    price: 85.25,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🎭',
    url: 'https://www.raynatours.com/pattaya/shows/tiffany-cabaret-e-509037',
    highlights: ['Cabaret Show', 'Costumes', 'Entertainment', 'Famous Show'],
    rating: 4.4
  },

  // 🇮🇩 Indonesia - Bali
  {
    id: 'mount-batur-trek',
    title: 'Mount Batur Sunrise Trek',
    category: 'Adventure & Nature',
    location: 'Bali',
    country: 'Indonesia',
    price: 185.00,
    currency: 'AED',
    duration: '8 hrs',
    emoji: '🌋',
    url: 'https://www.raynatours.com/bali/adventure/mount-batur-trek-e-509039',
    highlights: ['Sunrise Views', 'Volcano Trek', 'Hot Springs', 'Breakfast'],
    rating: 4.8,
    isPopular: true
  },
  {
    id: 'ubud-rice-terraces',
    title: 'Ubud Rice Terraces & Temples',
    category: 'Culture & Nature',
    location: 'Bali',
    country: 'Indonesia',
    price: 125.75,
    currency: 'AED',
    duration: '6 hrs',
    emoji: '🏛️',
    url: 'https://www.raynatours.com/bali/culture/ubud-rice-terraces-e-509040',
    highlights: ['Tegallalang Terraces', 'Temples', 'Traditional Village', 'Art'],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'bali-water-temple',
    title: 'Bali Water Temple Tour',
    category: 'Spiritual & Cultural',
    location: 'Bali',
    country: 'Indonesia',
    price: 95.50,
    currency: 'AED',
    duration: '4 hrs',
    emoji: '🌊',
    url: 'https://www.raynatours.com/bali/temples/water-temple-tour-e-509041',
    highlights: ['Ulun Danu Temple', 'Lake Beratan', 'Photography', 'Spiritual'],
    rating: 4.6
  },

  // 🇲🇾 Malaysia
  {
    id: 'petronas-towers',
    title: 'Petronas Twin Towers',
    category: 'Modern Attractions',
    location: 'Kuala Lumpur',
    country: 'Malaysia',
    price: 89.50,
    currency: 'AED',
    duration: '2 hrs',
    emoji: '🗼',
    url: 'https://www.raynatours.com/kualalumpur/attractions/petronas-towers-e-509043',
    highlights: ['Sky Bridge', 'City Views', 'Architecture', 'Photography'],
    rating: 4.5,
    isPopular: true
  },
  {
    id: 'batu-caves',
    title: 'Batu Caves Temple',
    category: 'Religious & Natural',
    location: 'Kuala Lumpur',
    country: 'Malaysia',
    price: 65.25,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🦅',
    url: 'https://www.raynatours.com/kualalumpur/temples/batu-caves-e-509044',
    highlights: ['Hindu Temple', 'Limestone Caves', 'Golden Statue', 'Monkeys'],
    rating: 4.4
  },
  {
    id: 'langkawi-cable-car',
    title: 'Langkawi Cable Car',
    category: 'Scenic & Adventure',
    location: 'Langkawi',
    country: 'Malaysia',
    price: 85.75,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🚡',
    url: 'https://www.raynatours.com/langkawi/scenic/cable-car-e-509046',
    highlights: ['Mountain Views', 'Sky Bridge', 'Rainforest', 'Cable Ride'],
    rating: 4.6,
    isPopular: true
  },
  {
    id: 'george-town-walk',
    title: 'George Town Heritage Walk',
    category: 'Heritage & Culture',
    location: 'Penang',
    country: 'Malaysia',
    price: 55.25,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🎨',
    url: 'https://www.raynatours.com/penang/heritage/george-town-walk-e-509048',
    highlights: ['Street Art', 'Heritage Buildings', 'Local Culture', 'Walking Tour'],
    rating: 4.3
  },

  // 🇸🇬 Singapore
  {
    id: 'singapore-flyer',
    title: 'Singapore Flyer',
    category: 'Modern Attractions',
    location: 'Singapore',
    country: 'Singapore',
    price: 125.50,
    currency: 'AED',
    duration: '1.5 hrs',
    emoji: '🎡',
    url: 'https://www.raynatours.com/singapore/attractions/singapore-flyer-e-509050',
    highlights: ['Giant Observation Wheel', 'City Views', 'Marina Bay', 'Photography'],
    rating: 4.5,
    isPopular: true
  },
  {
    id: 'gardens-by-bay',
    title: 'Gardens by the Bay',
    category: 'Nature & Modern',
    location: 'Singapore',
    country: 'Singapore',
    price: 85.25,
    currency: 'AED',
    duration: '3 hrs',
    emoji: '🌺',
    url: 'https://www.raynatours.com/singapore/gardens/gardens-by-bay-e-509051',
    highlights: ['Supertree Grove', 'Cloud Forest', 'Flower Dome', 'Light Show'],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'universal-studios-sg',
    title: 'Universal Studios Singapore',
    category: 'Theme Parks',
    location: 'Singapore',
    country: 'Singapore',
    price: 275.00,
    currency: 'AED',
    duration: 'Full Day',
    emoji: '🦁',
    url: 'https://www.raynatours.com/singapore/themepark/universal-studios-e-509052',
    highlights: ['Movie Themes', 'Rides', 'Shows', 'Sentosa Island'],
    rating: 4.6,
    isPopular: true
  },
  {
    id: 'night-safari',
    title: 'Singapore Night Safari',
    category: 'Wildlife & Adventure',
    location: 'Singapore',
    country: 'Singapore',
    price: 145.75,
    currency: 'AED',
    duration: '4 hrs',
    emoji: '🌃',
    url: 'https://www.raynatours.com/singapore/wildlife/night-safari-e-509053',
    highlights: ['Nocturnal Animals', 'Tram Ride', 'Walking Trails', 'Shows'],
    rating: 4.7,
    isPopular: true
  }
];

/**
 * Get tours by location
 */
export function getToursByLocation(location: string): TourData[] {
  return TOUR_DATABASE.filter(tour => 
    tour.location.toLowerCase() === location.toLowerCase()
  );
}

/**
 * Get tours by country
 */
export function getToursByCountry(country: string): TourData[] {
  return TOUR_DATABASE.filter(tour => 
    tour.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get tours by category
 */
export function getToursByCategory(category: string): TourData[] {
  return TOUR_DATABASE.filter(tour => 
    tour.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Get popular tours
 */
export function getPopularTours(limit: number = 6): TourData[] {
  return TOUR_DATABASE
    .filter(tour => tour.isPopular)
    .slice(0, limit);
}

/**
 * Get tours by price range
 */
export function getToursByPriceRange(min: number, max: number): TourData[] {
  return TOUR_DATABASE.filter(tour => 
    tour.price >= min && tour.price <= max
  );
}

/**
 * Search tours by keywords
 */
export function searchTours(query: string): TourData[] {
  const keywords = query.toLowerCase().split(' ');
  return TOUR_DATABASE.filter(tour => {
    const searchText = `${tour.title} ${tour.category} ${tour.location} ${tour.description || ''} ${tour.highlights?.join(' ') || ''}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  });
}

/**
 * Get all available locations
 */
export function getAllLocations(): string[] {
  return [...new Set(TOUR_DATABASE.map(tour => tour.location))].sort();
}

/**
 * Get all available countries
 */
export function getAllCountries(): string[] {
  return [...new Set(TOUR_DATABASE.map(tour => tour.country))].sort();
}