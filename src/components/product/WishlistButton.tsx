"use client";

import type { Product } from "@/lib/types";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "icon";
}

export function WishlistButton({ product, className, size = "icon" }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card click or other parent actions
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn("p-2 rounded-full hover:bg-accent/20 active:scale-95 transition-transform", className)}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("h-5 w-5", isWishlisted ? "fill-primary text-primary" : "text-foreground/70")} />
    </Button>
  );
}
