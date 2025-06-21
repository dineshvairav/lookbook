"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareToWhatsAppButtonProps {
  productName: string;
  productId: string;
  className?: string;
}

export function ShareToWhatsAppButton({ productName, productId, className }: ShareToWhatsAppButtonProps) {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      const productUrl = `${window.location.origin}/products/${productId}`;
      const message = `Check out this product: ${productName}! You can find it here: ${productUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleShare}
      className={className}
    >
      <Share2 className="mr-2 h-5 w-5" />
      Share to WhatsApp
    </Button>
  );
}
