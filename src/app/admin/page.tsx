
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, ShieldAlert, LayoutDashboard, UploadCloud, Send, PackagePlus, ListOrdered, Image as ImageIcon, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MAX_SHARED_FILE_SIZE_MB = 5;
const MAX_SHARED_FILE_SIZE_BYTES = MAX_SHARED_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_SHARED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const sharedFileUploadSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Include country code e.g. +12223334444" }),
  file: z.any()
    .refine((files: FileList | undefined | null) => files && files.length > 0, "File is required.")
    .refine(
      (files: FileList | undefined | null) => files && files[0] && files[0].size <= MAX_SHARED_FILE_SIZE_BYTES,
      `Max file size is ${MAX_SHARED_FILE_SIZE_MB}MB.`
    )
    .refine(
      (files: FileList | undefined | null) => files && files[0] && ACCEPTED_SHARED_FILE_TYPES.includes(files[0].type),
      "Only PDF and common image files (JPEG, PNG, GIF, WebP) are accepted."
    ),
});
type SharedFileUploadFormValues = z.infer<typeof sharedFileUploadSchema>;

const MAX_PRODUCT_IMAGE_SIZE_MB = 2;
const MAX_PRODUCT_IMAGE_SIZE_BYTES = MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  mrp: z.coerce.number().positive("MRP must be a positive number.").optional().nullable(),
  mop: z.coerce.number().positive("MOP must be a positive number."),
  dp: z.coerce.number().positive("DP must be a positive number.").optional().nullable(),
  category: z.string().min(1, "Category is required.").min(2, "Category name must be at least 2 characters."),
  features: z.string().optional(),
  productImage: z.any()
    .refine((files: FileList | undefined | null) => files && files.length > 0, "Product image is required.")
    .refine(
      (files: FileList | undefined | null) => files && files[0] && files[0].size <= MAX_PRODUCT_IMAGE_SIZE_BYTES,
      `Max image size is ${MAX_PRODUCT_IMAGE_SIZE_MB}MB.`
    )
    .refine(
      (files: FileList | undefined | null) => files && files[0] && ACCEPTED_PRODUCT_IMAGE_TYPES.includes(files[0].type),
      `Only ${ACCEPTED_PRODUCT_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')} images are accepted.`
    ),
});
type ProductFormValues = z.infer<typeof productFormSchema>;


export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploadingSharedFile, setIsUploadingSharedFile] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const {
    register: registerSharedFile,
    handleSubmit: handleSubmitSharedFile,
    reset: resetSharedFileForm,
    formState: { errors: sharedFileErrors }
  } = useForm<SharedFileUploadFormValues>({
    resolver: zodResolver(sharedFileUploadSchema),
  });

  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProductForm,
    formState: { errors: productErrors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
  });

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const productsCollectionRef = collection(db, "products");
      const q = query(productsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({ title: "Error", description: "Could not fetch products.", variant: "destructive" });
    }
    setIsLoadingProducts(false);
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchProducts();
    }
  }, [user]); 


  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/?authModal=true');
      } else if (!user.isAdmin) {
        router.replace('/shop');
      }
    }
  }, [user, authLoading, router]);

  const onSharedFileUploadSubmit: SubmitHandler<SharedFileUploadFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to perform this action.", variant: "destructive" });
      return;
    }
    console.log("Attempting shared file upload. User from AuthContext:", user);
    console.log("User isAdmin status from AuthContext:", user.isAdmin);

    setIsUploadingSharedFile(true);
    const fileToUpload = data.file[0];

    try {
      const sharedFileStoragePath = `userSharedFiles/${data.phoneNumber}/${fileToUpload.name}`;
      const fileRef = storageRef(storage, sharedFileStoragePath);

      await uploadBytes(fileRef, fileToUpload);
      const downloadURL = await getDownloadURL(fileRef);
      
      await addDoc(collection(db, "sharedFiles"), {
        phoneNumber: data.phoneNumber,
        originalFileName: fileToUpload.name,
        storagePath: sharedFileStoragePath,
        downloadURL: downloadURL,
        fileType: fileToUpload.type,
        uploadedAt: serverTimestamp(),
        uploadedBy: user.uid,
      });
      toast({ title: "File Uploaded Successfully", description: `${fileToUpload.name} has been uploaded for ${data.phoneNumber}.` });
      resetSharedFileForm();

    } catch (error: any) {
      console.error("Error uploading shared file to Firebase Storage:", error);
      let errorMessage = "Could not upload file. Please try again.";
      if (error.code) {
         switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = `Storage permission denied (Code: ${error.code}). Ensure admin has write access via Storage rules AND Firestore rules allow the 'get()' for isAdmin check on the 'users' collection. Also verify the 'isAdmin' flag in Firestore for UID: ${user?.uid}.`;
            break;
          case 'storage/object-not-found':
          case 'storage/bucket-not-found':
          case 'storage/project-not-found':
            errorMessage = `Storage configuration error (Code: ${error.code}). Please check Firebase setup or bucket name.`;
            break;
          case 'firestore/permission-denied':
             errorMessage = `Firestore permission denied (Code: ${error.code}). Could not save file metadata. Check Firestore rules for 'sharedFiles' collection.`;
            break;
          default:
            errorMessage = `Error: ${error.message || error.code}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsUploadingSharedFile(false);
    }
  };

  const onProductSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to add products.", variant: "destructive" });
      return;
    }
    console.log("Attempting product addition. User from AuthContext:", user);
    console.log("User isAdmin status from AuthContext:", user.isAdmin);

    setIsSubmittingProduct(true);
    const imageFile = data.productImage[0];
    const newProductId = doc(collection(db, "products")).id; 

    try {
      const imagePath = `product-images/${newProductId}/${imageFile.name}`;
      const imageFileRef = storageRef(storage, imagePath);
      await uploadBytes(imageFileRef, imageFile);
      const imageUrl = await getDownloadURL(imageFileRef);

      const productData: Omit<Product, 'id'> & { createdAt: any, updatedAt: any } = {
        name: data.name,
        description: data.description,
        mrp: data.mrp || undefined,
        mop: data.mop,
        dp: data.dp || undefined,
        category: data.category.trim(),
        features: data.features || '',
        imageUrl: imageUrl,
        images: [imageUrl], 
        slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "products", newProductId), productData);

      toast({ title: "Product Added", description: `${data.name} has been successfully added to the catalog.` });
      resetProductForm();
      fetchProducts(); 

    } catch (error: any)
     {
      console.error("Error adding product:", error);
      let errorMessage = "Could not add product. Please try again.";
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = `Product Image Upload: Storage permission denied (Code: ${error.code}). Ensure admin (UID: ${user?.uid}) has 'isAdmin:true' in Firestore and that Storage/Firestore rules allow the 'isAdmin' check via 'get()'.`;
            break;
          case 'firestore/permission-denied':
            errorMessage = `Firestore permission denied (Code: ${error.code}). Could not save product data. Check Firestore rules for 'products' collection.`;
            break;
          default:
            errorMessage = `Error: ${error.message || error.code}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: "Product Add Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmittingProduct(false);
    }
  };


  if (authLoading || !user || (user && !user.isAdmin)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-background">
          {authLoading || !user ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <div className="bg-card p-8 rounded-lg shadow-xl max-w-md w-full">
              <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-semibold font-headline text-destructive">Access Denied</h1>
              <p className="text-muted-foreground font-body mt-2">
                You do not have permission to view this page.
              </p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <CardTitle className="text-4xl font-bold font-headline text-primary">Admin Dashboard</CardTitle>
              </div>
              <CardDescription className="font-body text-lg text-muted-foreground pt-2">
                Welcome, {user.name || user.email}. Manage your application content and settings here.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <PackagePlus className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Product Catalog Management</CardTitle>
              </div>
              <CardDescription className="font-body text-muted-foreground pt-2">
                Add, view, and manage products in your catalog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold font-headline text-accent mb-4">Add New Product</h3>
                <form onSubmit={handleSubmitProduct(onProductSubmit)} className="space-y-6 p-4 border rounded-lg bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="font-body">Product Name</Label>
                      <Input id="productName" {...registerProduct("name")} placeholder="e.g., Classic Leather Jacket" disabled={isSubmittingProduct} />
                      {productErrors.name && <p className="text-sm text-destructive">{productErrors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productCategory" className="font-body">Category</Label>
                       <Input 
                        id="productCategory" 
                        {...registerProduct("category")} 
                        placeholder="e.g., Outerwear, Dresses, Accessories" 
                        disabled={isSubmittingProduct} 
                      />
                      {productErrors.category && <p className="text-sm text-destructive">{productErrors.category.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productDescription" className="font-body">Description</Label>
                    <Textarea id="productDescription" {...registerProduct("description")} placeholder="Detailed product description..." rows={4} disabled={isSubmittingProduct} />
                    {productErrors.description && <p className="text-sm text-destructive">{productErrors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productMrp" className="font-body">MRP (₹)</Label>
                      <Input id="productMrp" type="number" step="0.01" {...registerProduct("mrp")} placeholder="e.g., 1999.99" disabled={isSubmittingProduct} />
                      {productErrors.mrp && <p className="text-sm text-destructive">{productErrors.mrp.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productMop" className="font-body">MOP (₹)</Label>
                      <Input id="productMop" type="number" step="0.01" {...registerProduct("mop")} placeholder="e.g., 1499.99" disabled={isSubmittingProduct} />
                      {productErrors.mop && <p className="text-sm text-destructive">{productErrors.mop.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productDp" className="font-body">DP (₹) (Optional)</Label>
                      <Input id="productDp" type="number" step="0.01" {...registerProduct("dp")} placeholder="e.g., 1199.99" disabled={isSubmittingProduct} />
                      {productErrors.dp && <p className="text-sm text-destructive">{productErrors.dp.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productFeatures" className="font-body">Features (comma-separated)</Label>
                    <Textarea id="productFeatures" {...registerProduct("features")} placeholder="e.g., Water-resistant, Pure Cotton, Hand-stitched" rows={2} disabled={isSubmittingProduct} />
                    {productErrors.features && <p className="text-sm text-destructive">{productErrors.features.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productImage" className="font-body">Product Image (Max ${MAX_PRODUCT_IMAGE_SIZE_MB}MB)</Label>
                    <Input
                      id="productImage"
                      type="file"
                      {...registerProduct("productImage")}
                      accept={ACCEPTED_PRODUCT_IMAGE_TYPES.join(',')}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      disabled={isSubmittingProduct}
                    />
                    {productErrors.productImage && <p className="text-sm text-destructive">{productErrors.productImage.message as string}</p>}
                  </div>

                  <Button type="submit" disabled={isSubmittingProduct} className="w-full sm:w-auto">
                    {isSubmittingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                    {isSubmittingProduct ? "Adding Product..." : "Add Product to Catalog"}
                  </Button>
                </form>
              </section>

              <section>
                <h3 className="text-xl font-semibold font-headline text-accent mb-4 flex items-center">
                  <ListOrdered className="mr-2 h-5 w-5" /> Existing Products
                </h3>
                {isLoadingProducts ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No products found in the catalog yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">MOP (₹)</TableHead>
                          <TableHead className="text-center w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={60}
                                height={60}
                                className="rounded-md object-cover aspect-square"
                                data-ai-hint="product thumbnail"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">{product.mop.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toast({title: "Edit (Not Implemented)", description: `Would edit ${product.name}`})}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => toast({title: "Delete (Not Implemented)", description: `Would delete ${product.name}`, variant: "destructive"})}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <UploadCloud className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Upload File for User</CardTitle>
              </div>
              <CardDescription className="font-body text-muted-foreground pt-2">
                Upload a PDF or image file for a user identified by their phone number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSharedFile(onSharedFileUploadSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="font-body">User's Phone Number (with country code)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...registerSharedFile("phoneNumber")}
                    placeholder="+12345678900"
                    className="bg-background"
                    disabled={isUploadingSharedFile}
                  />
                  {sharedFileErrors.phoneNumber && <p className="text-sm text-destructive">{sharedFileErrors.phoneNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="font-body">File (PDF or Image, Max ${MAX_SHARED_FILE_SIZE_MB}MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    {...registerSharedFile("file")}
                    accept={ACCEPTED_SHARED_FILE_TYPES.join(',')}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isUploadingSharedFile}
                  />
                  {sharedFileErrors.file && <p className="text-sm text-destructive">{sharedFileErrors.file.message as string}</p>}
                </div>

                <Button type="submit" disabled={isUploadingSharedFile} className="w-full sm:w-auto">
                  {isUploadingSharedFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isUploadingSharedFile ? "Uploading..." : "Upload File"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  );
}
