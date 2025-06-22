
"use client";

import React, { useState, useEffect } from 'react';
import { productSearch } from '@/ai/flows/product-search';
import { fetchProductsFromFirestore } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductList } from '@/components/product/ProductList';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Frown } from 'lucide-react';

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a larger app, you might fetch only the products with the returned IDs
        // for better performance. For this app, fetching all is acceptable.
        const allProducts = await fetchProductsFromFirestore();

        // Call the AI flow to get relevant product IDs
        const searchResult = await productSearch({ query });
        const { productIds } = searchResult;
        
        if (productIds && productIds.length > 0) {
          // Filter the full product list to get the product objects
          const foundProducts = allProducts.filter(p => productIds.includes(p.id));
          // Maintain the order returned by the AI for relevance
          const orderedProducts = productIds.map(id => foundProducts.find(p => p.id === id)).filter(Boolean) as Product[];
          setResults(orderedProducts);
        } else {
          setResults([]);
        }

      } catch (e) {
        console.error("AI Search failed:", e);
        setError("The AI search encountered an error. Please try again.");
        toast({
          title: "Search Failed",
          description: "Could not perform AI search.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, toast]);

  if (isLoading) {
    // ProductList shows its own skeleton loaders
    return <ProductList products={[]} isLoading={true} />;
  }

  if (error) {
    return (
       <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Search Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
        <div className="text-center py-20 flex flex-col items-center">
            <Frown className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold font-headline">No Results Found</h2>
            <p className="text-muted-foreground font-body mt-2 max-w-md">
                Sorry, we couldn't find any products matching your search. Try a different term.
            </p>
        </div>
    );
  }

  return <ProductList products={results} isLoading={false} />;
}
