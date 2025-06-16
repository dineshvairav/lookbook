
"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductList } from "@/components/product/ProductList";
import { useWishlist } from "@/contexts/WishlistContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartCrack } from "lucide-react";

export default function WishlistPage() {
  const { wishlistItems, isLoading } = useWishlist();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center font-headline">Your Wishlist</h1>
        {isLoading ? (
          <ProductList products={[]} isLoading={true} />
        ) : wishlistItems.length > 0 ? (
          <ProductList products={wishlistItems} />
        ) : (
          <div className="text-center py-10">
            <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground font-body mb-6">Your wishlist is empty.</p>
            <Button asChild>
              <Link href="/shop">Discover Products</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
