import type { Product, Category } from './types';

export const categories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'outerwear', name: 'Outerwear' },
  { id: 'dresses', name: 'Dresses' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'footwear', name: 'Footwear' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Timeless Trench Coat',
    description: 'A classic beige trench coat, perfect for transitional weather. Crafted from water-resistant cotton gabardine with a double-breasted front and belted waist.',
    price: 299.99,
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
    price: 149.50,
    category: 'Tops', // Assuming Tops is a valid category, if not, add it to categories list
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
    price: 89.00,
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
    price: 199.00,
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
    price: 75.00,
    category: 'Accessories',
    imageUrl: 'https://placehold.co/600x800.png',
    features: '14k Gold-plated, Sterling silver base, Lightweight, Hypoallergenic',
     images: [
      'https://placehold.co/600x800/FAF3DD/333333.png',
    ],
  },
];

if (!categories.find(c => c.id === 'Tops')) {
  categories.push({id: 'tops', name: 'Tops'});
}


export async function getProducts(category?: string, sortBy?: string): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = products;
  if (category && category !== 'all') {
    filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (sortBy) {
    if (sortBy === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      filteredProducts.sort((a,b) => a.name.localeCompare(b.name));
    }
  }
  
  return filteredProducts;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return products.find(p => p.id === id);
}

export async function getCategories(): Promise<Category[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return categories;
}
