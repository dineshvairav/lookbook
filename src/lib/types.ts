
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  features: string; // Comma-separated or structured string
  images?: string[]; // Array of image URLs for gallery
  // Add data-ai-hint for placeholder images if generated dynamically
  // For static data, it's better to put it directly where the image is used
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
}
