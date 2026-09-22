export interface IPhoto {
  _id?: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  caption?: string;
  category: string;
  mediaType: 'image' | 'video' | 'gif';
  date: string;
  isFavorite: boolean;
  isPrivate?: boolean;
  notes?: string;
  fileSize?: number;
  fileName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Category = 
  | 'All'
  | 'Favorites'
  | 'Videos'
  | 'Weddings'
  | 'Dates & Trips'
  | 'Candid & Daily'
  | 'Special Moments';

export interface PhotoResponse {
  photos: IPhoto[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  categories: string[];
}

