
"use client"; // Required for useAuth hook or client components like ProductPricing

import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "./WishlistButton";
import { ProductPricing } from "./ProductPricing"; // Import the new pricing component
import { ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card rounded-lg">
      <Link href={`/products/${product.id}`} className="block group">
        <CardHeader className="p-0 relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={800}
            className="object-contain w-full h-96 group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="household product"
          />
          <div className="absolute top-2 right-2 z-10">
             <WishlistButton product={product} />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl mb-1 font-headline truncate group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-2 font-body h-10 overflow-hidden text-ellipsis">
            {product.description}
          </CardDescription>
          {/* Use ProductPricing component here */}
          <ProductPricing 
            product={product} 
            mopClassName="text-lg font-semibold text-primary font-headline" 
            dpClassName="text-base font-medium text-green-600 dark:text-green-400 font-body"
          />
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto"> {/* Added mt-auto to push footer to bottom if content is short */}
        <Button asChild variant="outline" className="w-full group">
          <Link href={`/products/${product.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
