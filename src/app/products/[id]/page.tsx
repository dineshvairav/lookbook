
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
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const products = await fetchProductsFromFirestore();
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usha1960.trade';
  // Firebase Storage URLs are already absolute, so we can use them directly.
  const imageUrl = product.imageUrl;

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | ushªOªpp`,
      description: product.description,
      url: `${siteUrl}/products/${product.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ushªOªpp`,
      description: product.description,
      images: [imageUrl],
    },
  };
}


// Helper function to safely serialize Firestore Timestamps, JS Dates, strings, or numbers
const serializeDateSafely = (dateValue: unknown): string | undefined => {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  // Check for Firestore Timestamp-like structure (duck-typing)
  if (dateValue && typeof (dateValue as Timestamp).toDate === 'function') {
    try {
      return (dateValue as Timestamp).toDate().toISOString();
    } catch (e) {
      // console.error("Error converting Firestore Timestamp to ISOString:", e);
      return undefined;
    }
  }
  // Handle if it's already a string (e.g., from previous serialization or direct string date)
  if (typeof dateValue === 'string') {
    try {
      const d = new Date(dateValue);
      // Check if the date is valid
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
      return undefined; // Invalid date string
    } catch (e) {
      return undefined; // Error parsing string
    }
  }
  // Handle if it's a number (timestamp in milliseconds)
  if (typeof dateValue === 'number') {
    try {
      const d = new Date(dateValue);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  }
  // console.warn("serializeDateSafely: Unhandled date type", typeof dateValue, dateValue);
  return undefined;
};

// Use standard inline prop typing for Next.js App Router pages
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
              <WishlistButton product={productForClient} size="default" className="mt-1" />
            </div>

            <Badge variant="secondary" className="text-sm font-body">{productData.category}</Badge>

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
