
import type { Product, Category } from './types';
import { db } from '@/lib/firebase'; // Import Firestore db instance
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export const categories: Category[] = [
  { id: 'all', name: 'All', imageUrl: 'https://placehold.co/300x200/A9A9A9/FFFFFF.png' },
  { id: 'outerwear', name: 'Outerwear', imageUrl: 'https://placehold.co/300x200/B0C4DE/FFFFFF.png' },
  { id: 'dresses', name: 'Dresses', imageUrl: 'https://placehold.co/300x200/FFC0CB/333333.png' },
  { id: 'accessories', name: 'Accessories', imageUrl: 'https://placehold.co/300x200/D2B48C/FFFFFF.png' },
  { id: 'footwear', name: 'Footwear', imageUrl: 'https://placehold.co/300x200/8FBC8F/FFFFFF.png' },
];

export const products: Product[] = [ // This is now static fallback/example data
  {
    id: '1',
    name: 'Timeless Trench Coat',
    description: 'A classic beige trench coat, perfect for transitional weather. Crafted from water-resistant cotton gabardine with a double-breasted front and belted waist.',
    mrp: 349.99,
    mop: 299.99,
    dp: 249.99,
    category: 'Outerwear',
    imageUrl: 'https://placehold.co/600x800.png',
    features: 'Water-resistant, Double-breasted, Belted waist, Horn buttons, Cotton gabardine',
    images: [
      'https://placehold.co/600x800/E0E0E0/333333.png',
      'https://placehold.co/600x800/D8D8D8/444444.png',
      'https://placehold.co/600x800/C0C0C0/555555.png',
    ],
  },
  {
    id: '2',
    name: 'Elegant Silk Blouse',
    description: 'A luxurious silk blouse with a relaxed fit and mother-of-pearl buttons. Ideal for both office wear and evening occasions.',
    mrp: 179.00,
    mop: 149.50,
    dp: 119.00,
    category: 'Tops', 
    imageUrl: 'https://placehold.co/600x800.png',
    features: '100% Mulberry Silk, Relaxed fit, Mother-of-pearl buttons, Long sleeves',
     images: [
      'https://placehold.co/600x800/F0F0F0/333333.png',
      'https://placehold.co/600x800/E8E8E8/444444.png',
    ],
  },
  {
    id: '3',
    name: 'Bohemian Maxi Dress',
    description: 'Flowy and comfortable maxi dress with a vibrant floral print. Features a smocked bodice and adjustable spaghetti straps.',
    mrp: 99.00,
    mop: 89.00,
    dp: 69.00,
    category: 'Dresses',
    imageUrl: 'https://placehold.co/600x800.png',
    features: 'Floral print, Smocked bodice, Adjustable straps, Lightweight rayon fabric',
     images: [
      'https://placehold.co/600x800/E5E5E5/333333.png',
    ],
  },
  {
    id: '4',
    name: 'Leather Ankle Boots',
    description: 'Chic and versatile ankle boots crafted from genuine leather. Features a comfortable block heel and side-zip closure.',
    mrp: 229.00,
    mop: 199.00,
    dp: 159.00,
    category: 'Footwear',
    imageUrl: 'https://placehold.co/600x800.png',
    features: 'Genuine leather, Block heel, Side-zip closure, Almond toe',
     images: [
      'https://placehold.co/600x800/D0D0D0/333333.png',
      'https://placehold.co/600x800/C8C8C8/444444.png',
    ],
  },
  {
    id: '5',
    name: 'Minimalist Gold Hoops',
    description: 'Elegant and understated gold hoop earrings, perfect for everyday wear. Made from 14k gold-plated sterling silver.',
    mrp: 85.00,
    mop: 75.00,
    // dp: 55.00, // Example: This product might not have a special dealer price
    category: 'Accessories',
    imageUrl: 'https://placehold.co/600x800.png',
    features: '14k Gold-plated, Sterling silver base, Lightweight, Hypoallergenic',
     images: [
      'https://placehold.co/600x800/FAF3DD/333333.png',
    ],
  },
];

// Add 'Tops' to static categories if not present (used by admin product form)
if (!categories.find(c => c.id === 'tops')) {
  categories.push({id: 'tops', name: 'Tops', imageUrl: 'https://placehold.co/300x200/E6E6FA/333333.png'});
}

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


// --- Static data functions (can be phased out or kept for fallback) ---
export async function getProducts(category?: string, sortBy?: string): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = products; // Using static products array
  if (category && category !== 'all') {
    filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (sortBy) {
    if (sortBy === 'price-asc') {
      filteredProducts.sort((a, b) => a.mop - b.mop);
    } else if (sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => b.mop - a.mop);
    } else if (sortBy === 'name-asc') {
      filteredProducts.sort((a,b) => a.name.localeCompare(b.name));
    }
  }
  
  return filteredProducts;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // This should ideally fetch from Firestore if products are dynamic.
  // For now, it could check Firestore first, then static as fallback, or be fully dynamic.
  // Let's assume products on product page will eventually come from Firestore.
  // For now, if admin adds products, this static version won't find them unless ID matches.
  return products.find(p => p.id === id); // Still using static products
}

export async function getCategories(): Promise<Category[]> {
  // This function returns static categories, which are used in the Admin product form.
  // The shop page will derive categories dynamically.
  await new Promise(resolve => setTimeout(resolve, 100));
  return categories.map(c => ({
    ...c,
    imageUrl: c.imageUrl || `https://placehold.co/300x200.png`
  }));
}
