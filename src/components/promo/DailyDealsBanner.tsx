
"use client";

import React, { useState, useEffect } from 'react';
import type { Product, BannerConfig } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { X, Percent, Loader2 } from 'lucide-react';
import { getBannerConfig } from '@/lib/data';

interface DailyDealsBannerProps {
  products: Product[];
  isVisible: boolean;
  onClose: () => void;
}

export function DailyDealsBanner({ products, isVisible, onClose }: DailyDealsBannerProps) {
  const [productOfDay, setProductOfDay] = useState<Product | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [config, setConfig] = useState<BannerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      setIsLoading(true);
      const bannerConfig = await getBannerConfig();
      setConfig(bannerConfig);
      setIsLoading(false);
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    if (isLoading || !config || config.mode === 'disabled' || products.length === 0) {
      setProductOfDay(null);
      return;
    }
    
    let selectedProduct: Product | undefined;

    if (config.mode === 'manual' && config.productId) {
      selectedProduct = products.find(p => p.id === config.productId);
      if (selectedProduct && (!selectedProduct.mrp || selectedProduct.mrp <= selectedProduct.mop)) {
          selectedProduct = undefined; 
      }
    } else if (config.mode === 'automatic') {
      const suitableProducts = products.filter(p => p.mrp && p.mrp > p.mop && p.description);
      if (suitableProducts.length > 0) {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const productIndex = dayOfYear % suitableProducts.length;
        selectedProduct = suitableProducts[productIndex];
      }
    }

    setProductOfDay(selectedProduct || null);

    if (selectedProduct && selectedProduct.mrp && selectedProduct.mop) {
      const discountPercentage = ((selectedProduct.mrp - selectedProduct.mop) / selectedProduct.mrp) * 100;
      setDiscount(Math.round(discountPercentage));
    }

  }, [products, config, isLoading]);

  useEffect(() => {
    if (isVisible && productOfDay) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Banner disappears after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, productOfDay]);

  if (!isVisible || !productOfDay || isLoading) {
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
