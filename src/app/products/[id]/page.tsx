
import { getProductById, products as allProductsStatic } from "@/lib/data"; 
import type { Product } from "@/lib/types";
import Image from "next/image";
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

interface ProductPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const products = allProductsStatic; 
  return products.map((product) => ({
    id: product.id,
  }));
}


export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-semibold font-headline">Product not found</h1>
          <Button asChild variant="link" className="mt-4">
            <Link href="/shop">Go back to products</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

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
          <ProductImageGallery images={product.images || [product.imageUrl]} altText={product.name} />
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary">{product.name}</h1>
              <WishlistButton product={product} size="default" className="mt-1" />
            </div>
            
            <Badge variant="secondary" className="text-sm font-body">{product.category}</Badge>
            
            <p className="text-3xl font-semibold text-foreground font-headline">₹{product.price.toFixed(2)}</p>
            
            <div className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90">
              <h2 className="font-headline text-xl">Description</h2>
              <p>{product.description}</p>
            </div>

            {product.features && (
               <div className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90">
                <h2 className="font-headline text-xl">Features</h2>
                <ul className="list-disc list-inside">
                  {product.features.split(',').map((feature, index) => (
                    <li key={index}>{feature.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <ShareToWhatsAppButton 
              productName={product.name} 
              productId={product.id} 
              className="w-full sm:w-auto" 
            />

            <AIDescriptionGenerator
              productName={product.name}
              currentDescription={product.description}
              features={product.features}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

