

import type { Product, Category, BannerConfig, SocialPreviewConfig } from './types';
import { db } from '@/lib/firebase'; // Import Firestore db instance
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';

// Static categories are kept for the Admin product form dropdown.
// The shop page derives categories dynamically from Firestore products.
export const categories: Category[] = [
  { id: 'all', name: 'All', imageUrl: 'https://placehold.co/300x200/A9A9A9/FFFFFF.png' },
  { id: 'outerwear', name: 'Outerwear', imageUrl: 'https://placehold.co/300x200/B0C4DE/FFFFFF.png' },
  { id: 'dresses', name: 'Dresses', imageUrl: 'https://placehold.co/300x200/FFC0CB/333333.png' },
  { id: 'accessories', name: 'Accessories', imageUrl: 'https://placehold.co/300x200/D2B48C/FFFFFF.png' },
  { id: 'footwear', name: 'Footwear', imageUrl: 'https://placehold.co/300x200/8FBC8F/FFFFFF.png' },
  { id: 'tops', name: 'Tops', imageUrl: 'https://placehold.co/300x200/E6E6FA/333333.png'},
];


// Function to fetch products from Firestore
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const productsCollectionRef = collection(db, "products");
  const q = query(productsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const fetchedProducts: Product[] = [];
  querySnapshot.forEach((doc) => {
    fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
  });
  return fetchedProducts;
}


// Updated function to fetch a single product from Firestore
export async function getProductById(id: string): Promise<Product | undefined> {
  if (!id) {
    console.error("getProductById: No ID provided.");
    return undefined;
  }
  try {
    const productDocRef = doc(db, "products", id);
    const productDocSnap = await getDoc(productDocRef);

    if (productDocSnap.exists()) {
      return { id: productDocSnap.id, ...productDocSnap.data() } as Product;
    } else {
      console.log(`No product found with ID: ${id}`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return undefined;
  }
}

export async function getCategories(): Promise<Category[]> {
  // This function returns static categories, which are used in the Admin product form.
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async if needed
  return categories.map(c => ({
    ...c,
    imageUrl: c.imageUrl || `https://placehold.co/300x200.png`
  }));
}

export async function getBannerConfig(): Promise<BannerConfig | null> {
  try {
    const docRef = doc(db, "siteConfig", "banner");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as BannerConfig;
    }
    // Return a default config if it doesn't exist, so the banner works automatically out of the box.
    return { mode: 'automatic', productId: null };
  } catch (error) {
    console.error("Error fetching banner config:", error);
    return { mode: 'disabled', productId: null }; // Return disabled on error
  }
}

export async function getSocialPreviewConfig(): Promise<SocialPreviewConfig> {
  const defaultConfig: SocialPreviewConfig = {
    title: 'ushªOªpp | wholesale household goods | since1960',
    description: 'Your one-stop destination for quality household goods, from traditional vessels to modern appliances.',
    imageUrl: '/home_1.png', // Default local image
  };

  try {
    const docRef = doc(db, "siteConfig", "socialPreview");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Important: Ensure the returned object matches the SocialPreviewConfig interface
      const data = docSnap.data();
      return {
        title: data.title || defaultConfig.title,
        description: data.description || defaultConfig.description,
        imageUrl: data.imageUrl || defaultConfig.imageUrl,
      };
    }
    return defaultConfig;
  } catch (error) {
    console.error("Error fetching social preview config:", error);
    return defaultConfig;
  }
}
