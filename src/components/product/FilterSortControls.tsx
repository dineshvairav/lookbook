
"use client";

import type { Category } from "@/lib/types";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface FilterSortControlsProps {
  categories: Category[];
  onFilterChange: (categoryId: string) => void;
  currentCategory: string;
}

export function FilterSortControls({
  categories,
  onFilterChange,
  currentCategory,
}: FilterSortControlsProps) {
  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center justify-start">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <Select onValueChange={onFilterChange} defaultValue={currentCategory}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="font-body">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
