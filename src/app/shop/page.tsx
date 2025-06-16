
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getProducts, getCategories } from "@/lib/data";
import type { Product, Category as CategoryType } from "@/lib/types";
import { CategoryCard } from "@/components/category/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategoriesData] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setAllProducts(fetchedProducts);
        setCategoriesData(fetchedCategories.map(c => ({
          ...c,
          // Add a placeholder imageUrl if not present for CategoryCard
          imageUrl: c.imageUrl || `https://placehold.co/300x200.png` 
        })));
      } catch (error) {
        console.error("ShopPage: Failed to fetch initial products and categories:", error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const dealProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return allProducts; // Show all products if 'All' is selected
    }
    // Filter products based on the selected category ID
    return allProducts.filter(p => p.category.toLowerCase() === selectedCategoryId.toLowerCase());
  }, [allProducts, selectedCategoryId]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section id="categories" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center font-headline text-primary">
            Shop by Category
          </h2>
          {isLoading ? (
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
          ) : (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isActive={selectedCategoryId === category.id}
                  onClick={handleCategorySelect}
                />
              ))}
            </div>
          )}
        </section>

        <section id="deal-products" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center font-headline text-accent">
            {selectedCategoryId === 'all' ? 'Featured Products' : `${categories.find(c=>c.id === selectedCategoryId)?.name || 'Products'}`}
          </h2>
          {isLoading && dealProducts.length === 0 ? (
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
              No products found in this category.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

