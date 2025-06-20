
import { getProductById, fetchProductsFromFirestore } from "@/lib/data";
import type { Product } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { AIDescriptionGenerator } from "@/components/product/AIDescriptionGenerator";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ShareToWhatsAppButton } from "@/components/product/ShareToWhatsAppButton";
import { ProductPricing } from "@/components/product/ProductPricing";
import type { Timestamp } from "firebase/firestore";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const products = await fetchProductsFromFirestore();
  return products.map((product) => ({
    id: product.id,
  }));
}

// Helper function to safely serialize Firestore Timestamps or JS Dates
const serializeDateSafely = (dateValue: unknown): string | undefined => {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) { // Handles if it's already a JS Date
    return dateValue.toISOString();
  }
  // Check if it's a Firestore Timestamp-like object (has toDate method)
  if (dateValue && typeof (dateValue as Timestamp).toDate === 'function') {
    return (dateValue as Timestamp).toDate().toISOString();
  }
  // If it's already a string, try to parse and re-format to ensure ISO standard.
  // If it's not a valid date string, new Date() might return "Invalid Date",
  // and toISOString() on that would throw.
  if (typeof dateValue === 'string') {
    try {
      const d = new Date(dateValue);
      // Check if the date is valid before calling toISOString
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
      return undefined; // Or return original string if preferred for invalid date strings
    } catch (e) {
      // Catch errors from new Date(invalidString) or toISOString()
      return undefined;
    }
  }
  return undefined;
};

// Using the standard Next.js App Router page props signature
export default async function ProductPage({ params }: { params: { id: string } }) {
  const productData = await getProductById(params.id);

  if (!productData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-semibold font-headline">Product not found</h1>
          <p className="text-muted-foreground font-body mt-2">The product you are looking for might have been removed or does not exist.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/shop">Go back to products</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Create a version of the product with dates serialized for client components
  const productForClient: Product = {
    ...productData,
    // Explicitly cast to 'any' then to 'string | undefined' to satisfy Product type
    // while ensuring serializable data for client components.
    createdAt: serializeDateSafely(productData.createdAt) as any,
    updatedAt: serializeDateSafely(productData.updatedAt) as any,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="text-sm">
            <Link href="/shop">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ProductImageGallery images={productData.images || [productData.imageUrl]} altText={productData.name} />

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary">{productData.name}</h1>
              {/* Pass the client-safe product object to client components */}
              <WishlistButton product={productForClient} size="default" className="mt-1" />
            </div>

            <Badge variant="secondary" className="text-sm font-body">{productData.category}</Badge>

            {/* Pass the client-safe product object to client components */}
            <ProductPricing product={productForClient} />

            <div className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90">
              <h2 className="font-headline text-xl">Description</h2>
              <p>{productData.description}</p>
            </div>

            {productData.features && (
               <div className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90">
                <h2 className="font-headline text-xl">Features</h2>
                <ul className="list-disc list-inside">
                  {productData.features.split(',').map((feature, index) => (
                    <li key={index}>{feature.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            <ShareToWhatsAppButton
              productName={productData.name}
              productId={productData.id}
              className="w-full sm:w-auto"
            />

            <AIDescriptionGenerator
              productName={productData.name}
              currentDescription={productData.description}
              features={productData.features || ""}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
