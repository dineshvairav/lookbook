
export interface Product {
  id: string;
  name: string;
  description: string;
  mop: number; // Market Operating Price (formerly price)
  mrp?: number; // Maximum Retail Price
  dp?: number; // Dealer Price
  category: string;
  imageUrl: string;
  features: string; // Comma-separated or structured string
  images?: string[]; // Array of image URLs for gallery
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string; // Optional: For category cards
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isDealer?: boolean; // Flag to identify dealer users
}
