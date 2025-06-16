
"use client";

import type { Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react"; // Example icon

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: (categoryId: string) => void;
}

export function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  const placeholderImage = `https://placehold.co/300x200.png`;
  // Simple way to generate different placeholder hints for categories
  const aiHint = category.name.toLowerCase().split(" ").slice(0, 2).join(" ") || "abstract";

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 w-full sm:w-56 md:w-64 flex-shrink-0",
        isActive ? "ring-2 ring-primary shadow-xl" : "ring-1 ring-border"
      )}
      onClick={() => onClick(category.id)}
    >
      <CardHeader className="p-0 relative h-32 sm:h-40">
        <Image
          src={category.imageUrl || placeholderImage}
          alt={category.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          data-ai-hint={category.imageUrl ? "category fashion" : aiHint} 
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
