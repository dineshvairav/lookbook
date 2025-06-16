"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ProductImageGalleryProps {
  images: string[];
  altText: string;
}

export function ProductImageGallery({ images, altText }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!images || images.length === 0) {
    return (
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <Image
            src="https://placehold.co/600x800.png?text=No+Image"
            alt="No image available"
            width={600}
            height={800}
            className="object-cover w-full h-auto aspect-[3/4]"
            priority
            data-ai-hint="placeholder image"
          />
        </CardContent>
      </Card>
    );
  }
  
  const handleSelectImage = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <Image
            src={selectedImage}
            alt={altText}
            width={600}
            height={800}
            className="object-cover w-full h-auto aspect-[3/4] transition-opacity duration-300 ease-in-out"
            priority // Prioritize loading the main image
            key={selectedImage} // Re-trigger animation on image change
            data-ai-hint="fashion product"
          />
        </CardContent>
      </Card>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => handleSelectImage(src)}
              className={cn(
                "rounded-md overflow-hidden aspect-square focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all",
                selectedImage === src ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={src}
                alt={`${altText} - thumbnail ${index + 1}`}
                width={150}
                height={150}
                className="object-cover w-full h-full"
                data-ai-hint="product detail"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
