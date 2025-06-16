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
import { Filter, ListFilter } from "lucide-react";

interface FilterSortControlsProps {
  categories: Category[];
  onFilterChange: (categoryId: string) => void;
  onSortChange: (sortKey: string) => void;
  currentCategory: string;
  currentSort: string;
}

export function FilterSortControls({
  categories,
  onFilterChange,
  onSortChange,
  currentCategory,
  currentSort,
}: FilterSortControlsProps) {
  const sortOptions = [
    { id: "default", name: "Default" },
    { id: "price-asc", name: "Price: Low to High" },
    { id: "price-desc", name: "Price: High to Low" },
    { id: "name-asc", name: "Name: A-Z" },
  ];

  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center justify-between">
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
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ListFilter className="h-5 w-5 text-muted-foreground" />
        <Select onValueChange={onSortChange} defaultValue={currentSort}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id} className="font-body">
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
