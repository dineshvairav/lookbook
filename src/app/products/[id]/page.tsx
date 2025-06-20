
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

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
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
  const productForClient: Omit<Product, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string } = {
    ...productData,
    createdAt: productData.createdAt instanceof Date 
      ? productData.createdAt.toISOString() 
      : (productData.createdAt as Timestamp | undefined)?.toDate().toISOString(),
    updatedAt: productData.updatedAt instanceof Date
      ? productData.updatedAt.toISOString()
      :(productData.updatedAt as Timestamp | undefined)?.toDate().toISOString(),
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
              <WishlistButton product={productForClient as Product} size="default" className="mt-1" />
            </div>
            
            <Badge variant="secondary" className="text-sm font-body">{productData.category}</Badge>
            
            {/* Pass the client-safe product object to client components */}
            <ProductPricing product={productForClient as Product} />
            
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
