

import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  mop: number; // Market Operating Price (formerly price)
  mrp?: number; // Maximum Retail Price
  dp?: number; // Dealer Price
  category: string; // Stores the category name
  imageUrl: string;
  features?: string; // Comma-separated or structured string
  images?: string[]; // Array of image URLs for gallery
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  slug?: string; // For SEO-friendly URLs
}

export interface Category {
  id: string; // Firestore document ID
  name: string;
  description?: string; // Optional description for the category
  imageUrl?: string; // Optional: For category cards/display
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
  fcmTokens?: string[]; // Array to store FCM device tokens
  fcmTokensUpdatedAt?: Timestamp; // Timestamp of last token update
}

export interface SharedFile {
  id: string; // Firestore document ID
  phoneNumber: string;
  originalFileName: string;
  storagePath: string;
  downloadURL: string;
  fileType: string;
  uploadedAt: any; // Firebase Timestamp // Allow any for display purposes, actual type is Timestamp
  uploadedBy: string; // UID of admin
}

export interface ProductPageProps {
  params: {
    id: string;
  };
}

export interface BannerConfig {
  mode: 'disabled' | 'automatic' | 'manual';
  productId?: string | null;
}
