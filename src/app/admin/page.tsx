
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, ShieldAlert, LayoutDashboard, UploadCloud, Send, PackagePlus, ListOrdered, Image as ImageIcon, Edit3, Trash2, Shapes, FolderPlus, ListChecks, ClipboardList, Download, Save } from 'lucide-react';
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
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Product, Category, SharedFile } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


const MAX_SHARED_FILE_SIZE_MB = 1; // Updated to 1MB
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

const MAX_PRODUCT_IMAGE_SIZE_MB = 1; // Updated to 1MB
const MAX_PRODUCT_IMAGE_SIZE_BYTES = MAX_PRODUCT_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  mrp: z.coerce.number().positive("MRP must be a positive number.").optional().nullable(),
  mop: z.coerce.number().positive("MOP must be a positive number."),
  dp: z.coerce.number().positive("DP must be a positive number.").optional().nullable(),
  category: z.string().min(1, "Category is required."),
  features: z.string().optional(),
  productImage: z.any()
    .refine((files: FileList | undefined | null, ctx) => {
      const { editingProduct } = ctx.custom || {}; 
      if (editingProduct) return true; 
      return files && files.length > 0;
    }, "Product image is required for new products.")
    .refine(
      (files: FileList | undefined | null) => {
        if (!files || files.length === 0) return true; 
        return files[0].size <= MAX_PRODUCT_IMAGE_SIZE_BYTES;
      }, `Max image size is ${MAX_PRODUCT_IMAGE_SIZE_MB}MB.`
    )
    .refine(
      (files: FileList | undefined | null) => {
        if (!files || files.length === 0) return true; 
        return ACCEPTED_PRODUCT_IMAGE_TYPES.includes(files[0].type);
      }, `Only ${ACCEPTED_PRODUCT_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')} images are accepted.`
    ),
});
type ProductFormValues = z.infer<typeof productFormSchema>;


const MAX_CATEGORY_IMAGE_SIZE_MB = 1; // Updated to 1MB
const MAX_CATEGORY_IMAGE_SIZE_BYTES = MAX_CATEGORY_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_CATEGORY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  description: z.string().optional(),
  categoryImage: z.any().optional()
    .refine((files: FileList | undefined | null) => {
        if (!files || files.length === 0) return true;
        return files[0].size <= MAX_CATEGORY_IMAGE_SIZE_BYTES;
      }, `Max image size is ${MAX_CATEGORY_IMAGE_SIZE_MB}MB.`)
    .refine((files: FileList | undefined | null) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_CATEGORY_IMAGE_TYPES.includes(files[0].type);
      }, `Only ${ACCEPTED_CATEGORY_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')} images are accepted.`)
});
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const editSharedFileFormSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Include country code e.g. +12223334444" }),
});
type EditSharedFileFormValues = z.infer<typeof editSharedFileFormSchema>;


export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isUploadingSharedFile, setIsUploadingSharedFile] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [isLoadingSharedFiles, setIsLoadingSharedFiles] = useState(true);
  const [editingSharedFile, setEditingSharedFile] = useState<SharedFile | null>(null);
  const [isUpdatingSharedFile, setIsUpdatingSharedFile] = useState(false);
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<{
    type: 'product' | 'category' | 'sharedFile';
    id: string;
    name: string;
    storagePath?: string; 
    imageUrl?: string; 
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


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
    setValue: setProductFormValue,
    formState: { errors: productErrors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
  });

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategoryForm,
    setValue: setCategoryFormValue,
    formState: { errors: categoryErrors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
  });

  const {
    register: registerEditSharedFile,
    handleSubmit: handleSubmitEditSharedFile,
    reset: resetEditSharedFileForm,
    setValue: setEditSharedFileFormValue,
    formState: { errors: editSharedFileErrors }
  } = useForm<EditSharedFileFormValues>({
    resolver: zodResolver(editSharedFileFormSchema),
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

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categoriesCollectionRef = collection(db, "categories");
      const q = query(categoriesCollectionRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedCategories: Category[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategoriesList(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
    }
    setIsLoadingCategories(false);
  };

  const fetchSharedFiles = async () => {
    setIsLoadingSharedFiles(true);
    try {
      const filesCollectionRef = collection(db, "sharedFiles");
      const q = query(filesCollectionRef, orderBy("uploadedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedFiles: SharedFile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let uploadedAtDisplay = 'N/A';
        if (data.uploadedAt && data.uploadedAt.toDate) {
            uploadedAtDisplay = data.uploadedAt.toDate().toLocaleDateString();
        } else if (data.uploadedAt && typeof data.uploadedAt === 'string') {
            uploadedAtDisplay = new Date(data.uploadedAt).toLocaleDateString();
        } else if (data.uploadedAt && typeof data.uploadedAt === 'number') { 
            uploadedAtDisplay = new Date(data.uploadedAt).toLocaleDateString();
        }
        fetchedFiles.push({ id: doc.id, ...data, uploadedAt: uploadedAtDisplay } as SharedFile);
      });
      setSharedFiles(fetchedFiles);
    } catch (error) {
      console.error("Error fetching shared files:", error);
      toast({ title: "Error", description: "Could not fetch shared files.", variant: "destructive" });
    }
    setIsLoadingSharedFiles(false);
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchProducts();
      fetchCategories();
      fetchSharedFiles();
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

  const getStoragePathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'firebasestorage.googleapis.com') {
        const path = urlObj.pathname.split('/o/')[1];
        if (path) {
          return decodeURIComponent(path.split('?')[0]);
        }
      }
    } catch (e) {
      console.error("Error parsing storage URL:", e);
    }
    return null;
  };
  
  const handleDeleteConfirmation = async () => {
    if (!showDeleteConfirmModal) return;
    setIsDeleting(true);
    const { type, id, name, storagePath, imageUrl } = showDeleteConfirmModal;

    try {
      if (type === 'product') {
        if (imageUrl) {
          const path = getStoragePathFromUrl(imageUrl);
          if (path) await deleteObject(storageRef(storage, path));
        }
        await deleteDoc(doc(db, "products", id));
        toast({ title: "Product Deleted", description: `${name} has been deleted.` });
        fetchProducts();
      } else if (type === 'category') {
        if (imageUrl) {
          const path = getStoragePathFromUrl(imageUrl);
          if (path) await deleteObject(storageRef(storage, path));
        }
        await deleteDoc(doc(db, "categories", id));
        toast({ title: "Category Deleted", description: `${name} has been deleted.` });
        fetchCategories();
      } else if (type === 'sharedFile' && storagePath) {
        await deleteObject(storageRef(storage, storagePath));
        await deleteDoc(doc(db, "sharedFiles", id));
        toast({ title: "File Deleted", description: `${name} has been deleted.` });
        fetchSharedFiles();
      }
    } catch (error: any) {
      console.error(`Error deleting ${type} ${name}:`, error);
      toast({ title: "Delete Failed", description: `Could not delete ${name}. ${error.message}`, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmModal(null);
    }
  };

  const onSharedFileUploadSubmit: SubmitHandler<SharedFileUploadFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission.", variant: "destructive" });
      return;
    }
    
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
      fetchSharedFiles(); 

    } catch (error: any) {
      console.error("Error uploading shared file:", error);
      toast({ title: "Upload Failed", description: error.message || "Could not upload file.", variant: "destructive" });
    } finally {
      setIsUploadingSharedFile(false);
    }
  };

  const handleEditSharedFileClick = (file: SharedFile) => {
    setEditingSharedFile(file);
    setEditSharedFileFormValue("phoneNumber", file.phoneNumber);
  };

  const onEditSharedFileSubmit: SubmitHandler<EditSharedFileFormValues> = async (data) => {
    if (!editingSharedFile || !user || !user.isAdmin) {
      toast({ title: "Error", description: "Invalid operation.", variant: "destructive" });
      return;
    }
    setIsUpdatingSharedFile(true);
    try {
      const fileDocRef = doc(db, "sharedFiles", editingSharedFile.id);
      await updateDoc(fileDocRef, { phoneNumber: data.phoneNumber });
      toast({ title: "File Updated", description: `Phone number for ${editingSharedFile.originalFileName} updated.` });
      fetchSharedFiles();
      setEditingSharedFile(null);
      resetEditSharedFileForm();
    } catch (error: any) {
      console.error("Error updating shared file:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update file.", variant: "destructive" });
    } finally {
      setIsUpdatingSharedFile(false);
    }
  };


  const onProductSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "Permission denied.", variant: "destructive" });
      return;
    }
    setIsSubmittingProduct(true);
    const imageFile = data.productImage?.[0];

    try {
      let imageUrl = editingProduct?.imageUrl;
      let imagePath: string | undefined = editingProduct && imageUrl ? getStoragePathFromUrl(imageUrl) : undefined;

      if (imageFile) { 
        if (editingProduct && editingProduct.imageUrl) { 
          const oldPath = getStoragePathFromUrl(editingProduct.imageUrl);
          if (oldPath) await deleteObject(storageRef(storage, oldPath)).catch(e => console.warn("Old image deletion failed (might not exist):", e));
        }
        const newImageId = editingProduct?.id || doc(collection(db, "products")).id; 
        imagePath = `product-images/${newImageId}/${imageFile.name}`;
        const imageFileRef = storageRef(storage, imagePath);
        await uploadBytes(imageFileRef, imageFile);
        imageUrl = await getDownloadURL(imageFileRef);
      } else if (!editingProduct) { 
          toast({title: "Image Required", description: "Product image is required for new products.", variant: "destructive"});
          setIsSubmittingProduct(false);
          return;
      }


      const productData = {
        name: data.name,
        description: data.description,
        mrp: data.mrp || undefined,
        mop: data.mop,
        dp: data.dp || undefined,
        category: data.category,
        features: data.features || '',
        imageUrl: imageUrl,
        images: imageUrl ? [imageUrl] : [], 
        slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        toast({ title: "Product Updated", description: `${data.name} has been updated.` });
      } else {
        const newProductId = doc(collection(db, "products")).id;
        await setDoc(doc(db, "products", newProductId), { ...productData, createdAt: serverTimestamp() });
        toast({ title: "Product Added", description: `${data.name} has been added.` });
      }
      
      resetProductForm();
      setEditingProduct(null);
      fetchProducts();

    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast({ title: "Product Submission Failed", description: error.message || "Could not save product.", variant: "destructive" });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setProductFormValue("name", product.name);
    setProductFormValue("description", product.description);
    setProductFormValue("mrp", product.mrp || null);
    setProductFormValue("mop", product.mop);
    setProductFormValue("dp", product.dp || null);
    setProductFormValue("category", product.category);
    setProductFormValue("features", product.features || '');
    document.getElementById('productFormCard')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const cancelProductEdit = () => {
    setEditingProduct(null);
    resetProductForm();
  };


  const onCategorySubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "Permission denied.", variant: "destructive" });
      return;
    }
    setIsSubmittingCategory(true);
    const imageFile = data.categoryImage?.[0];

    try {
      let imageUrl = editingCategory?.imageUrl;

      if (imageFile) {
        if (editingCategory && editingCategory.imageUrl) {
          const oldPath = getStoragePathFromUrl(editingCategory.imageUrl);
          if (oldPath) await deleteObject(storageRef(storage, oldPath)).catch(e => console.warn("Old category image deletion failed:", e));
        }
        const newImageId = editingCategory?.id || doc(collection(db, "categories")).id;
        const imagePath = `category-images/${newImageId}/${imageFile.name}`;
        const imageFileRef = storageRef(storage, imagePath);
        await uploadBytes(imageFileRef, imageFile);
        imageUrl = await getDownloadURL(imageFileRef);
      }

      const categoryData = {
        name: data.name,
        description: data.description || '',
        imageUrl: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), categoryData);
        toast({ title: "Category Updated", description: `${data.name} has been updated.` });
      } else {
        const newCategoryId = doc(collection(db, "categories")).id;
        await setDoc(doc(db, "categories", newCategoryId), { ...categoryData, createdAt: serverTimestamp() });
        toast({ title: "Category Added", description: `${data.name} has been added.` });
      }
      
      resetCategoryForm();
      setEditingCategory(null);
      fetchCategories();

    } catch (error: any)
     {
      console.error("Error submitting category:", error);
      toast({ title: "Category Submission Failed", description: error.message || "Could not save category.", variant: "destructive" });
    } finally {
      setIsSubmittingCategory(false);
    }
  };
  
  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormValue("name", category.name);
    setCategoryFormValue("description", category.description || '');
    document.getElementById('categoryFormCard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    resetCategoryForm();
  };


  if (authLoading || !user || (user && !user.isAdmin && !authLoading)) { 
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

          <Card id="categoryFormCard" className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shapes className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Manage Categories</CardTitle>
              </div>
              <CardDescription className="font-body text-muted-foreground pt-2">
                {editingCategory ? `Editing: ${editingCategory.name}` : "Add, view, and manage product categories."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold font-headline text-accent mb-4 flex items-center">
                  <FolderPlus className="mr-2 h-5 w-5"/> {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <form onSubmit={handleSubmitCategory(onCategorySubmit)} className="space-y-6 p-4 border rounded-lg bg-card">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName" className="font-body">Category Name</Label>
                    <Input id="categoryName" {...registerCategory("name")} placeholder="e.g., Outerwear, Dresses" disabled={isSubmittingCategory} />
                    {categoryErrors.name && <p className="text-sm text-destructive">{categoryErrors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryDescription" className="font-body">Description (Optional)</Label>
                    <Textarea id="categoryDescription" {...registerCategory("description")} placeholder="Brief description of the category..." rows={3} disabled={isSubmittingCategory} />
                    {categoryErrors.description && <p className="text-sm text-destructive">{categoryErrors.description.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryImage" className="font-body">
                      Image {editingCategory ? '(Leave blank to keep existing)' : ''} (Optional, Max ${MAX_CATEGORY_IMAGE_SIZE_MB}MB)
                    </Label>
                    <Input
                      id="categoryImage"
                      type="file"
                      {...registerCategory("categoryImage")}
                      accept={ACCEPTED_CATEGORY_IMAGE_TYPES.join(',')}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      disabled={isSubmittingCategory}
                    />
                    {categoryErrors.categoryImage && <p className="text-sm text-destructive">{categoryErrors.categoryImage.message as string}</p>}
                    {editingCategory && editingCategory.imageUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Current image:</p>
                            <Image src={editingCategory.imageUrl} alt="Current category image" width={80} height={80} className="rounded object-cover"/>
                        </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmittingCategory} className="w-full sm:w-auto">
                      {isSubmittingCategory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingCategory ? <Save className="mr-2 h-4 w-4" /> : <FolderPlus className="mr-2 h-4 w-4" />)}
                      {isSubmittingCategory ? (editingCategory ? "Updating..." : "Adding...") : (editingCategory ? "Update Category" : "Add Category")}
                    </Button>
                    {editingCategory && (
                      <Button type="button" variant="outline" onClick={cancelCategoryEdit} disabled={isSubmittingCategory}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </section>
              <section>
                <h3 className="text-xl font-semibold font-headline text-accent mb-4 flex items-center">
                  <ListChecks className="mr-2 h-5 w-5"/> Existing Categories
                </h3>
                {isLoadingCategories ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : categoriesList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No categories found yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoriesList.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              {category.imageUrl ? (
                                <Image
                                  src={category.imageUrl}
                                  alt={category.name}
                                  width={60}
                                  height={60}
                                  className="rounded-md object-cover aspect-square"
                                  data-ai-hint="category item"
                                />
                              ) : (
                                <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{category.description || '-'}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditCategoryClick(category)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8" 
                                  onClick={() => setShowDeleteConfirmModal({ type: 'category', id: category.id, name: category.name, imageUrl: category.imageUrl })}>
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


          <Card id="productFormCard" className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <PackagePlus className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Product Catalog Management</CardTitle>
              </div>
               <CardDescription className="font-body text-muted-foreground pt-2">
                {editingProduct ? `Editing: ${editingProduct.name}` : "Add, view, and manage products in your catalog."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold font-headline text-accent mb-4">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <form onSubmit={handleSubmitProduct(onProductSubmit)} className="space-y-6 p-4 border rounded-lg bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="font-body">Product Name</Label>
                      <Input id="productName" {...registerProduct("name")} placeholder="e.g., Classic Leather Jacket" disabled={isSubmittingProduct} />
                      {productErrors.name && <p className="text-sm text-destructive">{productErrors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productCategory" className="font-body">Category</Label>
                       <Select
                        value={editingProduct?.category || undefined} 
                        onValueChange={(value) => setProductFormValue("category", value)}
                        disabled={isSubmittingProduct || isLoadingCategories}
                      >
                        <SelectTrigger id="productCategory">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                          ) : categoriesList.length === 0 ? (
                            <SelectItem value="no-categories" disabled>No categories available. Add one first.</SelectItem>
                          ) : (
                            categoriesList.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
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
                    <Label htmlFor="productImage" className="font-body">
                      Product Image {editingProduct ? '(Leave blank to keep existing)' : ''} (Max ${MAX_PRODUCT_IMAGE_SIZE_MB}MB)
                    </Label>
                    <Input
                      id="productImage"
                      type="file"
                      {...registerProduct("productImage")}
                      accept={ACCEPTED_PRODUCT_IMAGE_TYPES.join(',')}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      disabled={isSubmittingProduct}
                    />
                    {productErrors.productImage && <p className="text-sm text-destructive">{productErrors.productImage.message as string}</p>}
                     {editingProduct && editingProduct.imageUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Current image:</p>
                            <Image src={editingProduct.imageUrl} alt="Current product image" width={80} height={80} className="rounded object-cover"/>
                        </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmittingProduct} className="w-full sm:w-auto">
                      {isSubmittingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingProduct ? <Save className="mr-2 h-4 w-4" /> : <PackagePlus className="mr-2 h-4 w-4" />)}
                      {isSubmittingProduct ? (editingProduct ? "Updating..." : "Adding...") : (editingProduct ? "Update Product" : "Add Product to Catalog")}
                    </Button>
                    {editingProduct && (
                      <Button type="button" variant="outline" onClick={cancelProductEdit} disabled={isSubmittingProduct}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
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
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditProductClick(product)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8" 
                                onClick={() => setShowDeleteConfirmModal({ type: 'product', id: product.id, name: product.name, imageUrl: product.imageUrl })}>
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
                <ClipboardList className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Manage Shared Files</CardTitle>
              </div>
              <CardDescription className="font-body text-muted-foreground pt-2">
                View, download, or manage files previously uploaded for users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSharedFiles ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : sharedFiles.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No files have been shared with users yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>File Type</TableHead>
                        <TableHead>Uploaded Date</TableHead>
                        <TableHead className="text-center w-[180px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sharedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium truncate max-w-xs" title={file.originalFileName}>{file.originalFileName}</TableCell>
                          <TableCell>{file.phoneNumber}</TableCell>
                          <TableCell className="truncate max-w-[100px]">{file.fileType}</TableCell>
                          <TableCell>{file.uploadedAt?.toString() || 'N/A'}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-2">
                              <Button asChild variant="outline" size="sm" className="h-8">
                                <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" download={file.originalFileName}>
                                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                                </a>
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditSharedFileClick(file)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-8 w-8" 
                                onClick={() => setShowDeleteConfirmModal({ type: 'sharedFile', id: file.id, name: file.originalFileName, storagePath: file.storagePath })}>
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

      {showDeleteConfirmModal && (
        <AlertDialog open onOpenChange={() => setShowDeleteConfirmModal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {showDeleteConfirmModal.type} "{showDeleteConfirmModal.name}"
                { (showDeleteConfirmModal.type === 'sharedFile' || ( (showDeleteConfirmModal.type === 'product' || showDeleteConfirmModal.type === 'category') && showDeleteConfirmModal.imageUrl ) ) && " and its associated file/image from storage."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirmModal(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmation} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {editingSharedFile && (
        <Dialog open onOpenChange={() => {
          if (!isUpdatingSharedFile) {
            setEditingSharedFile(null);
            resetEditSharedFileForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Phone Number for {editingSharedFile.originalFileName}</DialogTitle>
              <DialogDescription>
                Update the phone number associated with this shared file.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEditSharedFile(onEditSharedFileSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="editSharedFilePhoneNumber">Phone Number (with country code)</Label>
                <Input 
                  id="editSharedFilePhoneNumber" 
                  type="tel" 
                  {...registerEditSharedFile("phoneNumber")}
                  disabled={isUpdatingSharedFile} 
                  placeholder="+12345678900"
                />
                {editSharedFileErrors.phoneNumber && <p className="text-sm text-destructive mt-1">{editSharedFileErrors.phoneNumber.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setEditingSharedFile(null); resetEditSharedFileForm(); }} disabled={isUpdatingSharedFile}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingSharedFile}>
                  {isUpdatingSharedFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isUpdatingSharedFile ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

    