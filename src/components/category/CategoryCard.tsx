
"use client";

import type { Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: (categoryId: string) => void;
}

export function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  const defaultPlaceholder = `https://placehold.co/300x200.png`;
  const imageToUse = category.imageUrl || defaultPlaceholder;
  
  // Determine AI hint based on whether the image is a generic placeholder
  const isGenericPlaceholder = imageToUse.includes('placehold.co');
  const aiHint = isGenericPlaceholder 
    ? (category.name.toLowerCase().split(" ").slice(0, 2).join(" ") + (category.name.toLowerCase() === "all" ? "household goods" : " household item") || "household item").trim()
    : "category item";

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 w-full sm:w-56 md:w-64 flex-shrink-0 transform hover:-translate-y-1",
        isActive ? "ring-2 ring-primary shadow-xl" : "ring-1 ring-border"
      )}
      onClick={() => onClick(category.id)}
    >
      <CardHeader className="p-0 relative h-32 sm:h-40">
        <Image
          src={imageToUse}
          alt={category.name}
          layout="fill"
          objectFit="contain"
          className="rounded-t-lg p-2 transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={aiHint} 
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-headline text-center truncate group-hover:text-primary transition-colors">
          {category.name}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
