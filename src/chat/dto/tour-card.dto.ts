export interface TourCard {
  id: string;
  title: string;
  slug: string;
  image: string;
  location: string;
  category: string;
  originalPrice?: number | null;
  currentPrice: number;
  currency: string;
  discount?: number;
  discountPercentage?: number;
  isRecommended?: boolean;
  isNew?: boolean;
  rPoints?: number;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  highlights?: string[];
  url: string;
}

export interface TourCarousel {
  type: 'tour_carousel';
  title: string;
  subtitle?: string;
  cards: TourCard[];
  totalResults?: number;
}

export interface ChatResponseWithCards {
  message: string;
  tourCarousel?: TourCarousel;
  sessionId: string;
}