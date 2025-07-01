"use client";

import React, { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { X, Percent } from 'lucide-react';

interface DailyDealsBannerProps {
  products: Product[];
  isVisible: boolean;
  onClose: () => void;
}

export function DailyDealsBanner({ products, isVisible, onClose }: DailyDealsBannerProps) {
  const [productOfDay, setProductOfDay] = useState<Product | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    // Filter for products that have a discount potential and a description
    const suitableProducts = products.filter(p => p.mrp && p.mrp > p.mop && p.description);
    if (suitableProducts.length === 0) {
      return;
    }

    // Select a product pseudo-randomly based on the day of the year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const productIndex = dayOfYear % suitableProducts.length;
    const selectedProduct = suitableProducts[productIndex];
    setProductOfDay(selectedProduct);

    if (selectedProduct && selectedProduct.mrp && selectedProduct.mop) {
      const discountPercentage = ((selectedProduct.mrp - selectedProduct.mop) / selectedProduct.mrp) * 100;
      setDiscount(Math.round(discountPercentage));
    }

  }, [products]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Banner disappears after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !productOfDay) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm animate-in fade-in slide-in-from-bottom-10 duration-500">
      <Card className="shadow-2xl bg-card/90 backdrop-blur-sm border-primary/50 overflow-hidden">
        <CardContent className="p-0 flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 z-10 rounded-full bg-background/50 hover:bg-background/80"
            onClick={onClose}
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </Button>

          <Link href={`/products/${productOfDay.id}`} className="flex items-center w-full" onClick={onClose}>
            <div className="w-28 h-36 flex-shrink-0 relative">
              <Image
                src={productOfDay.imageUrl}
                alt={productOfDay.name}
                layout="fill"
                objectFit="contain"
                className="p-1"
                data-ai-hint="promotional item"
              />
            </div>

            <div className="p-3 pl-0 flex-grow overflow-hidden">
              <Badge variant="destructive" className="mb-1 animate-pulse">
                <Percent className="mr-1 h-3 w-3" /> {discount}% OFF
              </Badge>
              <h3 className="font-headline font-semibold text-primary truncate">
                {productOfDay.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {productOfDay.description}
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
