"use client";

import type { Product } from "@/lib/types";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading wishlist from localStorage
    const storedWishlist = localStorage.getItem("ushªOªppWishlist");
    if (storedWishlist) {
      setWishlistItems(JSON.parse(storedWishlist));
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (items: Product[]) => {
    localStorage.setItem("ushªOªppWishlist", JSON.stringify(items));
  };

  const addToWishlist = (product: Product) => {
    if (!wishlistItems.find(item => item.id === product.id)) {
      const newWishlist = [...wishlistItems, product];
      setWishlistItems(newWishlist);
      updateLocalStorage(newWishlist);
      toast({ title: "Added to Wishlist", description: `${product.name} has been added.`});
    }
  };

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(newWishlist);
    updateLocalStorage(newWishlist);
    const productName = wishlistItems.find(item => item.id === productId)?.name || "Product";
    toast({ title: "Removed from Wishlist", description: `${productName} has been removed.`});
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
