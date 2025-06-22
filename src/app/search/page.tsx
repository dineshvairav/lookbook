
"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchResults } from '@/components/search/SearchResults';
import { Loader2, Search } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {query ? (
          <>
            <h1 className="text-3xl font-bold font-headline mb-2">Search Results</h1>
            <p className="text-muted-foreground font-body mb-8">
              Showing results for: <span className="font-semibold text-primary">{`"${query}"`}</span>
            </p>
            <SearchResults query={query} />
          </>
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold font-headline">Search for Products</h1>
            <p className="text-muted-foreground font-body mt-2 max-w-md">
              Use the search bar in the header to find anything from our store, like "brass cookware" or "something for a gift".
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SearchPageSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </main>
            <Footer />
        </div>
    );
}

export default function SearchPage() {
  // The search page uses useSearchParams(), which requires a Suspense boundary.
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
