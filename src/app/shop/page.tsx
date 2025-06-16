
"use client"; 

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductList } from "@/components/product/ProductList";
import { FilterSortControls } from "@/components/product/FilterSortControls";
import { getProducts, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategoriesData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("default");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(), 
          getCategories(),
        ]);
        setAllProducts(fetchedProducts);
        setProducts(fetchedProducts); 
        setCategoriesData(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);
  
  const filteredAndSortedProducts = useMemo(() => {
    let itemsToDisplay = [...allProducts];

    if (selectedCategory && selectedCategory !== 'all') {
      itemsToDisplay = itemsToDisplay.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (sortKey) {
      if (sortKey === 'price-asc') {
        itemsToDisplay.sort((a, b) => a.price - b.price);
      } else if (sortKey === 'price-desc') {
        itemsToDisplay.sort((a, b) => b.price - a.price);
      } else if (sortKey === 'name-asc') {
        itemsToDisplay.sort((a,b) => a.name.localeCompare(b.name));
      }
    }
    return itemsToDisplay;
  }, [allProducts, selectedCategory, sortKey]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center font-headline">Discover Our Collection</h1>
        {!isLoading && categories.length > 0 && (
          <FilterSortControls
            categories={categories}
            onFilterChange={setSelectedCategory}
            onSortChange={setSortKey}
            currentCategory={selectedCategory}
            currentSort={sortKey}
          />
        )}
        <ProductList products={filteredAndSortedProducts} isLoading={isLoading} />
      </main>
      <Footer />
    </div>
  );
}
