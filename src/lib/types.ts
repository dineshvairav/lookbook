
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
  uid: string; // Firebase Auth UID
  email: string | null; // Firebase Auth email
  name?: string | null; // Display name
  isDealer?: boolean; // Flag to identify dealer users, fetched from Firestore
  isAdmin?: boolean; // Flag to identify admin users, fetched from Firestore
  phoneNumber?: string | null;
  address?: string | null;
  avatarUrl?: string | null; // For future use with actual avatar uploads
}
