
"use client";

import type { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface ProductPricingProps {
  product: Product;
  mopClassName?: string;
  dpClassName?: string;
}

export function ProductPricing({ product, mopClassName = "text-2xl font-semibold text-primary font-headline", dpClassName = "text-lg font-medium text-green-600 dark:text-green-400 font-body" }: ProductPricingProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-1">
      {product.mrp && product.mrp > product.mop && (
        <p className="text-sm text-muted-foreground line-through font-body">
          MRP: ₹{product.mrp.toFixed(2)}
        </p>
      )}
      <p className={mopClassName}>
        MOP: ₹{product.mop.toFixed(2)}
      </p>
      {user?.isDealer && product.dp && (
        <p className={dpClassName}>
          Dealer Price: ₹{product.dp.toFixed(2)}
        </p>
      )}
    </div>
  );
}
