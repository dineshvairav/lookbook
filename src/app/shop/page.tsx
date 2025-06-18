
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { fetchProductsFromFirestore } from "@/lib/data"; // Updated import
import type { Product, Category as CategoryType } from "@/lib/types";
import { CategoryCard } from "@/components/category/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const productsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const fetchedProducts = await fetchProductsFromFirestore();
        setAllProducts(fetchedProducts);

        // Dynamically derive categories from fetched products
        if (fetchedProducts.length > 0) {
          const uniqueCategoryNames = Array.from(new Set(fetchedProducts.map(p => p.category)));
          const derivedCategories: CategoryType[] = uniqueCategoryNames.map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'), // Create a slug-like ID
            name: name,
            imageUrl: `https://placehold.co/300x200.png` // Generic placeholder
          }));
          
          setCategoriesData([
            { id: 'all', name: 'All', imageUrl: 'https://placehold.co/300x200/A9A9A9/FFFFFF.png' },
            ...derivedCategories.sort((a,b) => a.name.localeCompare(b.name)) // Sort derived categories
          ]);
        } else {
            // Fallback if no products, show "All" category or a message
             setCategoriesData([{ id: 'all', name: 'All', imageUrl: 'https://placehold.co/300x200/A9A9A9/FFFFFF.png' }]);
        }

      } catch (error) {
        console.error("ShopPage: Failed to fetch products from Firestore:", error);
        // Optionally set static data or error state here
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const dealProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return allProducts;
    }
    // Find the category name that matches the selectedCategoryId (which is slug-like)
    const selectedCategoryObject = categoriesData.find(c => c.id === selectedCategoryId);
    if (selectedCategoryObject) {
        return allProducts.filter(p => p.category === selectedCategoryObject.name);
    }
    return []; // Or allProducts if category not found, though this shouldn't happen with derived categories.
  }, [allProducts, selectedCategoryId, categoriesData]);

  const currentCategoryName = useMemo(() => {
    if (selectedCategoryId === 'all') return 'Featured Products';
    const cat = categoriesData.find(c => c.id === selectedCategoryId);
    return cat ? cat.name : 'Products';
  }, [selectedCategoryId, categoriesData]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section id="categories" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center font-headline text-primary">
            Shop by Category
          </h2>
          {isLoading && categoriesData.length === 0 ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-full sm:w-56 md:w-64">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <div className="p-4 border border-t-0 rounded-b-lg">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoriesData.length > 1 ? ( // Only show if more than "All"
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {categoriesData.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isActive={selectedCategoryId === category.id}
                  onClick={handleCategorySelect}
                />
              ))}
            </div>
          ) : !isLoading && categoriesData.length <=1 ? (
             <p className="text-center text-muted-foreground font-body">No product categories available yet.</p>
          ) : null}
        </section>

        <section id="deal-products" ref={productsSectionRef} className="mb-12 scroll-mt-20">
          <h2 className="text-3xl font-bold mb-6 text-center font-headline text-accent">
            {currentCategoryName}
          </h2>
          {isLoading && allProducts.length === 0 ? (
             <div className="flex space-x-4 p-4 overflow-hidden">
               {Array.from({ length: 4 }).map((_, index) => (
                 <div key={index} className="w-72 flex-shrink-0">
                    <Skeleton className="h-96 w-full rounded-t-lg" />
                    <div className="p-4 border border-t-0 rounded-b-lg space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-5 w-1/4 mt-1" />
                    </div>
                 </div>
               ))}
             </div>
          ) : dealProducts.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <div className="flex w-max space-x-4 p-4">
                {dealProducts.map((product) => (
                  <div key={product.id} className="w-72 flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground font-body text-lg py-10">
              No products found {selectedCategoryId === 'all' ? 'yet' : 'in this category'}. Explore other styles!
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
