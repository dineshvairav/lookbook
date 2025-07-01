
"use client";

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, ShieldAlert, LayoutDashboard, UploadCloud, Send, PackagePlus, ListOrdered, Image as ImageIcon, Edit3, Trash2, Shapes, FolderPlus, ListChecks, ClipboardList, Download, Save, Users, UserCircle2, MessageSquare, X, Megaphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Product, Category, SharedFile, User, BannerConfig } from '@/lib/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getBannerConfig } from '@/lib/data';


const MAX_SHARED_FILE_SIZE_MB = 1;
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

const MAX_PRODUCT_IMAGE_SIZE_MB = 1;
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
  productImages: z.any().optional() // Optional at schema level, validated in handler
    .refine((files: FileList | undefined | null) => {
        if (!files || files.length === 0) return true;
        for (const file of Array.from(files)) {
          if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) return false;
        }
        return true;
      }, `Max image size per file is ${MAX_PRODUCT_IMAGE_SIZE_MB}MB.`)
    .refine((files: FileList | undefined | null) => {
        if (!files || files.length === 0) return true;
        for (const file of Array.from(files)) {
          if (!ACCEPTED_PRODUCT_IMAGE_TYPES.includes(file.type)) return false;
        }
        return true;
      }, `Only ${ACCEPTED_PRODUCT_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')} images are accepted.`),
});
type ProductFormValues = z.infer<typeof productFormSchema>;


const MAX_CATEGORY_IMAGE_SIZE_MB = 1;
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

const userEditFormSchema = z.object({
  isAdmin: z.boolean().default(false),
  isDealer: z.boolean().default(false),
});
type UserEditFormValues = z.infer<typeof userEditFormSchema>;

const notificationFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title too long."),
  body: z.string().min(10, "Body must be at least 10 characters.").max(500, "Body too long."),
  target: z.enum(["all", "dealers", "nonDealers"], { required_error: "Target audience is required."}),
});
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const bannerConfigFormSchema = z.object({
  mode: z.enum(['disabled', 'automatic', 'manual']),
  productId: z.string().optional().nullable(),
}).refine(data => {
    if (data.mode === 'manual') {
        return !!data.productId;
    }
    return true;
}, {
    message: "A product must be selected for manual mode.",
    path: ["productId"],
});
type BannerConfigFormValues = z.infer<typeof bannerConfigFormSchema>;


function AdminPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isUploadingSharedFile, setIsUploadingSharedFile] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [isLoadingSharedFiles, setIsLoadingSharedFiles] = useState(true);
  const [editingSharedFile, setEditingSharedFile] = useState<SharedFile | null>(null);
  const [isUpdatingSharedFile, setIsUpdatingSharedFile] = useState(false);
  
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [isSavingBannerConfig, setIsSavingBannerConfig] = useState(false);

  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<{
    type: 'product' | 'category' | 'sharedFile' | 'user';
    id: string;
    name: string;
    storagePath?: string;
    imageUrl?: string;
    imageUrls?: string[]; // For product deletion
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);


  const {
    register: registerSharedFile,
    handleSubmit: handleSubmitSharedFile,
    reset: resetSharedFileForm,
    setValue: setSharedFileValue,
    watch: watchSharedFile,
    formState: { errors: sharedFileErrors }
  } = useForm<SharedFileUploadFormValues>({
    resolver: zodResolver(sharedFileUploadSchema),
  });

  const sharedFile = watchSharedFile("file");

  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    reset: resetProductForm,
    setValue: setProductFormValue,
    control: productControl,
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

  const {
    register: registerUserEdit,
    handleSubmit: handleSubmitUserEdit,
    reset: resetUserEditForm,
    setValue: setUserEditFormValue,
    control: userEditFormControl,
    formState: { errors: userEditErrors }
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      isAdmin: false,
      isDealer: false,
    }
  });
  
  const {
    register: registerNotification,
    handleSubmit: handleSubmitNotification,
    reset: resetNotificationForm,
    control: notificationControl, // For Select component
    formState: { errors: notificationErrors }
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
  });

  const {
    handleSubmit: handleSubmitBannerConfig,
    reset: resetBannerConfigForm,
    control: bannerConfigControl,
    watch: watchBannerConfig,
    formState: { errors: bannerConfigErrors },
  } = useForm<BannerConfigFormValues>({
    resolver: zodResolver(bannerConfigFormSchema),
    defaultValues: {
        mode: 'automatic',
        productId: null
    }
  });

  const bannerConfigMode = watchBannerConfig("mode");
  const dealProducts = useMemo(() => products.filter(p => p.mrp && p.mrp > p.mop), [products]);

  // Effect to pre-fill phone number from URL query parameter and scroll to the upload card
  useEffect(() => {
    const phoneFromQuery = searchParams.get('phoneNumber');
    // Run this logic only after auth has finished loading and a phone number is present
    if (!authLoading && phoneFromQuery) {
      setSharedFileValue('phoneNumber', phoneFromQuery, { shouldValidate: true });
      document.getElementById('uploadFileCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams, setSharedFileValue, authLoading]);


  const fetchProducts = useCallback(async () => {
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
  }, [toast]);

  const fetchCategories = useCallback(async () => {
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
  }, [toast]);

  const fetchSharedFiles = useCallback(async () => {
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
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ uid: doc.id, ...doc.data() } as User);
      });
      setUsersList(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Could not fetch users. Check permissions.", variant: "destructive" });
    }
    setIsLoadingUsers(false);
  }, [toast]);

  const fetchBannerConfig = useCallback(async () => {
    const config = await getBannerConfig();
    if (config) {
      resetBannerConfigForm(config);
    }
  }, [resetBannerConfigForm]);


  useEffect(() => {
    if (user && user.isAdmin) {
      fetchProducts();
      fetchCategories();
      fetchSharedFiles();
      fetchUsers();
      fetchBannerConfig();
    }
  }, [user, fetchProducts, fetchCategories, fetchSharedFiles, fetchUsers, fetchBannerConfig]);


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
    const { type, id, name, storagePath, imageUrl, imageUrls } = showDeleteConfirmModal;

    try {
      if (type === 'product') {
        const imagesToDelete = imageUrls || (imageUrl ? [imageUrl] : []);
        if (imagesToDelete.length > 0) {
          const deletePromises = imagesToDelete.map(url => {
            const path = getStoragePathFromUrl(url);
            if (path) return deleteObject(storageRef(storage, path));
            return Promise.resolve();
          });
          await Promise.all(deletePromises);
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
      } else if (type === 'user') {
        await deleteDoc(doc(db, "users", id));
        toast({ title: "User Record Deleted", description: `Firestore record for ${name} has been deleted.` });
        fetchUsers();
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

      const appUrl = window.location.origin;
      const downloadLink = `${appUrl}/downloads?phone=${encodeURIComponent(data.phoneNumber)}`;

      console.log("--- SIMULATING NOTIFICATION ---");
      console.log(`A backend function would be triggered for phone: ${data.phoneNumber}`);
      console.log(`It would send a push notification with a deep link: ${downloadLink}`);
      console.log(`The user clicking the notification would be taken to the downloads page and see their files.`);
      
      toast({
        title: "Notification Sent (Simulated)",
        description: `A notification to open the app would be sent to ${data.phoneNumber}.`,
      });

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

  const handleMarkImageForDeletion = (imageUrl: string) => {
    setImagesMarkedForDeletion(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl); // Unmark for deletion
      }
      return [...prev, imageUrl]; // Mark for deletion
    });
  };

  const onProductSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "Permission denied.", variant: "destructive" });
      return;
    }

    const isCreating = !editingProduct;
    const hasNewImages = data.productImages && data.productImages.length > 0;
    const keptExistingImages = editingProduct?.images?.filter(img => !imagesMarkedForDeletion.includes(img)) || [];
    
    if (isCreating && !hasNewImages) {
      toast({ title: "Image Required", description: "At least one product image is required for new products.", variant: "destructive" });
      return;
    }
    if (!isCreating && !hasNewImages && keptExistingImages.length === 0) {
      toast({ title: "Image Required", description: "A product must have at least one image.", variant: "destructive" });
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const docRef = editingProduct ? doc(db, "products", editingProduct.id) : doc(collection(db, "products"));
      const productId = docRef.id;

      // 1. Upload new images
      let newImageUrls: string[] = [];
      if (hasNewImages) {
        const uploadPromises = Array.from(data.productImages!).map(file => {
          const imagePath = `product-images/${productId}/${Date.now()}-${file.name}`;
          const imageFileRef = storageRef(storage, imagePath);
          return uploadBytes(imageFileRef, file).then(() => getDownloadURL(imageFileRef));
        });
        newImageUrls = await Promise.all(uploadPromises);
      }

      // 2. Delete marked images from storage
      if (imagesMarkedForDeletion.length > 0) {
        const deletePromises = imagesMarkedForDeletion.map(url => {
          const path = getStoragePathFromUrl(url);
          if (path) return deleteObject(storageRef(storage, path)).catch(e => console.warn("Failed to delete old image", e));
          return Promise.resolve();
        });
        await Promise.all(deletePromises);
      }
      
      // 3. Combine image lists
      const finalImageUrls = [...keptExistingImages, ...newImageUrls];
      
      // Re-check after operations, just in case.
      if (finalImageUrls.length === 0) {
        toast({ title: "Image Required", description: "A product must have at least one image.", variant: "destructive" });
        setIsSubmittingProduct(false);
        return;
      }
      
      // 4. Prepare data for Firestore
      const productData = {
        name: data.name,
        description: data.description,
        mrp: data.mrp || null,
        mop: data.mop,
        dp: data.dp || null,
        category: data.category,
        features: data.features || '',
        imageUrl: finalImageUrls[0],
        images: finalImageUrls,
        slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        updatedAt: serverTimestamp(),
      };

      // 5. Update or create document
      if (editingProduct) {
        await updateDoc(docRef, productData);
        toast({ title: "Product Updated", description: `${data.name} has been updated.` });
      } else {
        await setDoc(docRef, { ...productData, createdAt: serverTimestamp() });
        toast({ title: "Product Added", description: `${data.name} has been added.` });
      }
      
      // 6. Cleanup
      resetProductForm();
      setEditingProduct(null);
      setImagesMarkedForDeletion([]);
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
    setImagesMarkedForDeletion([]);
    setProductFormValue("name", product.name);
    setProductFormValue("description", product.description);
    setProductFormValue("mrp", product.mrp || null);
    setProductFormValue("mop", product.mop);
    setProductFormValue("dp", product.dp || null);
    setProductFormValue("category", product.category);
    setProductFormValue("features", product.features || '');
    setProductFormValue("productImages", undefined); // Reset file input
    document.getElementById('productFormCard')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const cancelProductEdit = () => {
    setEditingProduct(null);
    resetProductForm();
    setImagesMarkedForDeletion([]);
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

  const handleEditUserClick = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserEditFormValue("isAdmin", userToEdit.isAdmin || false);
    setUserEditFormValue("isDealer", userToEdit.isDealer || false);
  };

  const onUserEditSubmit: SubmitHandler<UserEditFormValues> = async (data) => {
    if (!editingUser || !user || !user.isAdmin) {
      toast({ title: "Error", description: "Invalid operation or insufficient permissions.", variant: "destructive" });
      return;
    }
    if (editingUser.uid === user.uid && !data.isAdmin) {
        toast({ title: "Action Restricted", description: "You cannot remove your own admin role.", variant: "destructive" });
        return;
    }

    setIsUpdatingUser(true);
    try {
      const userDocRef = doc(db, "users", editingUser.uid);
      await updateDoc(userDocRef, {
        isAdmin: data.isAdmin,
        isDealer: data.isDealer,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "User Roles Updated", description: `Roles for ${editingUser.name || editingUser.email} have been updated.` });
      fetchUsers();
      setEditingUser(null);
      resetUserEditForm();
    } catch (error: any) {
      console.error("Error updating user roles:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update user roles.", variant: "destructive" });
    } finally {
      setIsUpdatingUser(false);
    }
  };
  
  const onSendNotificationSubmit: SubmitHandler<NotificationFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "Permission denied.", variant: "destructive" });
      return;
    }
    setIsSendingNotification(true);
    
    // In a real application, this would call a Firebase Cloud Function
    // The function would query users based on the target and send FCM messages.
    // Example: await sendPushNotificationToTarget(data.title, data.body, data.target);
    console.log("Attempting to send notification:", data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Notification Sent (Simulated)", description: `"${data.title}" would be sent to ${data.target}.` });
    resetNotificationForm();
    setIsSendingNotification(false);

    // TODO: Implement a Firebase Cloud Function to handle actual push notification sending.
    // This function should:
    // 1. Be callable (e.g., HTTPS callable function).
    // 2. Receive `title`, `body`, and `target` as parameters.
    // 3. Query Firestore for users matching the `target`:
    //    - "all": All users with `fcmTokens`.
    //    - "dealers": Users with `isDealer: true` and `fcmTokens`.
    //    - "nonDealers": Users with `isDealer: false` (or field not present) and `fcmTokens`.
    // 4. Collect all unique FCM tokens from the targeted users.
    // 5. Use the Firebase Admin SDK (`admin.messaging().sendToDevice()`, `sendEachForMulticast()`, or Topic Messaging)
    //    to send the push notification with the provided title and body to the collected tokens.
    // 6. Handle token cleanup (e.g., remove invalid/unregistered tokens from Firestore).
  };
  
  const onBannerConfigSubmit: SubmitHandler<BannerConfigFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "Permission denied.", variant: "destructive" });
      return;
    }
    setIsSavingBannerConfig(true);

    try {
      const configDocRef = doc(db, "siteConfig", "banner");
      const configToSave: BannerConfig = {
        mode: data.mode,
        productId: data.mode === 'manual' ? data.productId : null,
      };
      await setDoc(configDocRef, configToSave);
      toast({ title: "Banner Settings Saved", description: "The promotional banner settings have been updated." });
    } catch (error: any) {
        console.error("Error saving banner config:", error);
        toast({ title: "Save Failed", description: "Could not save banner settings.", variant: "destructive" });
    } finally {
        setIsSavingBannerConfig(false);
    }
  };


  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length -1]) {
        return (parts[0][0] + parts[parts.length -1][0]).toUpperCase();
      }
      if (parts[0] && parts[0].length >=2) return parts[0].substring(0, 2).toUpperCase();
      if (parts[0]) return parts[0][0].toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSharedFileValue("file", files, { shouldValidate: true });
    }
  }, [setSharedFileValue]);


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

          <Card id="sendNotificationCard" className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Send Push Notification</CardTitle>
              </div>
              <CardDescription className="font-body text-muted-foreground pt-2">
                Compose and send a push notification to a targeted group of users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNotification(onSendNotificationSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notificationTitle" className="font-body">Notification Title</Label>
                  <Input
                    id="notificationTitle"
                    {...registerNotification("title")}
                    placeholder="e.g., New Arrivals Alert!"
                    disabled={isSendingNotification}
                  />
                  {notificationErrors.title && <p className="text-sm text-destructive">{notificationErrors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationBody" className="font-body">Notification Body</Label>
                  <Textarea
                    id="notificationBody"
                    {...registerNotification("body")}
                    placeholder="e.g., Check out our latest collection of summer dresses..."
                    rows={4}
                    disabled={isSendingNotification}
                  />
                  {notificationErrors.body && <p className="text-sm text-destructive">{notificationErrors.body.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notificationTarget" className="font-body">Target Audience</Label>
                  <Controller
                    name="target"
                    control={notificationControl}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSendingNotification}
                      >
                        <SelectTrigger id="notificationTarget">
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="dealers">Dealers Only</SelectItem>
                          <SelectItem value="nonDealers">Non-Dealers Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {notificationErrors.target && <p className="text-sm text-destructive">{notificationErrors.target.message}</p>}
                </div>

                <Button type="submit" disabled={isSendingNotification} className="w-full sm:w-auto">
                  {isSendingNotification ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isSendingNotification ? "Sending..." : "Send Notification"}
                </Button>
              </form>
            </CardContent>
          </Card>

           <Card id="promoBannerCard" className="shadow-xl">
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <Megaphone className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-bold font-headline text-primary">Promotional Banner Control</CardTitle>
                    </div>
                    <CardDescription className="font-body text-muted-foreground pt-2">
                        Configure the inactivity pop-up banner on the shop page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitBannerConfig(onBannerConfigSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="bannerMode" className="font-body">Banner Mode</Label>
                            <Controller
                                name="mode"
                                control={bannerConfigControl}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isSavingBannerConfig}
                                    >
                                        <SelectTrigger id="bannerMode">
                                            <SelectValue placeholder="Select banner mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="disabled">Disabled (Banner will not show)</SelectItem>
                                            <SelectItem value="automatic">Automatic (Deal of the Day)</SelectItem>
                                            <SelectItem value="manual">Manual (Select a specific product)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {bannerConfigErrors.mode && <p className="text-sm text-destructive">{bannerConfigErrors.mode.message}</p>}
                        </div>

                        {bannerConfigMode === 'manual' && (
                            <div className="space-y-2 animate-in fade-in-50">
                                <Label htmlFor="bannerProduct" className="font-body">Featured Product</Label>
                                <Controller
                                    name="productId"
                                    control={bannerConfigControl}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            disabled={isSavingBannerConfig || dealProducts.length === 0}
                                        >
                                            <SelectTrigger id="bannerProduct">
                                                <SelectValue placeholder="Select a product to feature" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dealProducts.length === 0 ? (
                                                    <SelectItem value="no-deals" disabled>No products with discounts available.</SelectItem>
                                                ) : (
                                                    dealProducts.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {bannerConfigErrors.productId && <p className="text-sm text-destructive">{bannerConfigErrors.productId.message}</p>}
                            </div>
                        )}

                        <Button type="submit" disabled={isSavingBannerConfig} className="w-full sm:w-auto">
                            {isSavingBannerConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSavingBannerConfig ? "Saving..." : "Save Banner Settings"}
                        </Button>
                    </form>
                </CardContent>
            </Card>


          <Card id="manageUsersCard" className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold font-headline text-primary">Manage Users</CardTitle>
              </div>
              <CardDescription className="font-body text-muted-foreground pt-2">
                View users and manage their roles (Admin, Dealer).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : usersList.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No users found.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Avatar</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead className="text-center w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.map((u) => (
                        <TableRow key={u.uid}>
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={u.avatarUrl || undefined} alt={u.name || u.email || 'User Avatar'} />
                              <AvatarFallback>{getInitials(u.name, u.email)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{u.name || 'N/A'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.isAdmin && <Badge variant="destructive">Admin</Badge>}
                              {u.isDealer && <Badge variant="secondary">Dealer</Badge>}
                              {!u.isAdmin && !u.isDealer && <Badge variant="outline">User</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditUserClick(u)}
                                disabled={u.uid === user.uid && u.isAdmin && usersList.filter(usr => usr.isAdmin).length === 1}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowDeleteConfirmModal({ type: 'user', id: u.uid, name: u.name || u.email || 'N/A' })}
                                disabled={u.uid === user.uid}
                              >
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
                      className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
                                  className="rounded-md object-contain p-1 aspect-square"
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
                      <Controller
                        name="category"
                        control={productControl}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
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
                        )}
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
                    <Label htmlFor="productImages" className="font-body">
                      Product Images (Max ${MAX_PRODUCT_IMAGE_SIZE_MB}MB each)
                    </Label>
                    <Input
                      id="productImages"
                      type="file"
                      {...registerProduct("productImages")}
                      accept={ACCEPTED_PRODUCT_IMAGE_TYPES.join(',')}
                      className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      disabled={isSubmittingProduct}
                      multiple
                    />
                    {productErrors.productImages && <p className="text-sm text-destructive">{productErrors.productImages.message as string}</p>}
                    
                    {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                      <div className="mt-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Current Images (Hover to see delete button):</p>
                          <div className="flex flex-wrap gap-2">
                              {editingProduct.images.map((imgUrl, index) => (
                                  <div key={imgUrl} className="relative group">
                                      <Image
                                          src={imgUrl}
                                          alt={`Current product image ${index + 1}`}
                                          width={80}
                                          height={80}
                                          className={cn(
                                              "rounded object-cover aspect-square transition-opacity",
                                              imagesMarkedForDeletion.includes(imgUrl) && "opacity-40 border-2 border-destructive"
                                          )}
                                      />
                                      <button
                                          type="button"
                                          onClick={() => handleMarkImageForDeletion(imgUrl)}
                                          className="absolute top-0.5 right-0.5 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                          aria-label="Mark image for deletion"
                                      >
                                          <X className="h-3 w-3" />
                                      </button>
                                      {imagesMarkedForDeletion.includes(imgUrl) && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40 rounded">
                                          <Trash2 className="h-6 w-6 text-destructive-foreground" />
                                        </div>
                                      )}
                                  </div>
                              ))}
                          </div>
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
                                className="rounded-md object-contain aspect-square"
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
                                onClick={() => setShowDeleteConfirmModal({ type: 'product', id: product.id, name: product.name, imageUrls: product.images })}>
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

          <Card id="manageSharedFilesCard" className="shadow-xl">
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
                        <TableHead className="text-center w-[200px]">Actions</TableHead>
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
                               <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                title="Share on WhatsApp"
                                onClick={() => {
                                  const appUrl = window.location.origin;
                                  const userDownloadsLink = `${appUrl}/downloads?phone=${encodeURIComponent(file.phoneNumber)}`;
                                  const message = `You have new files from ushªOªpp. View them here: ${userDownloadsLink}`;
                                  
                                  // For wa.me links, phone number should not have '+' or other symbols.
                                  const cleanPhoneNumber = file.phoneNumber.replace(/[^0-9]/g, '');
                                  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;
                                  
                                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.472 5.375 5.54-1.451zm4.492-5.588c-.273-.136-1.612-.796-1.863-.886-.251-.09-.434-.136-.617.136-.182.273-.703.886-.864 1.062-.161.176-.322.196-.594.06-.273-.136-1.146-.423-2.182-1.346-.807-.719-1.353-1.612-1.514-1.886-.161-.273-.017-.42.118-.557.121-.122.273-.323.409-.484.137-.161.183-.273.273-.455.09-.182.045-.344-.023-.484-.068-.136-.617-1.476-.844-2.015-.228-.539-.456-.464-.617-.47-.162-.006-.344-.006-.527-.006-.183 0-.465.068-.703.344-.237.273-.902.886-.902 2.158 0 1.272.923 2.496 1.043 2.671.121.176 1.816 2.786 4.403 3.84.58.243 1.04.388 1.402.498.534.164.99.146 1.364.088.409-.068 1.251-.512 1.426-.995.176-.484.176-.899.121-1.004-.055-.105-.182-.161-.273-.19z" />
                                </svg>
                                <span className="sr-only">Share on WhatsApp</span>
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

          <Card id="uploadFileCard" className="shadow-xl scroll-mt-20">
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
                  <Label htmlFor="phoneNumber" className="font-body">User's Phone Number</Label>
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
                   <Label
                      htmlFor="file"
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={cn(
                          "relative block w-full p-8 border-2 border-dashed rounded-lg cursor-pointer text-center hover:bg-muted/50 transition-colors",
                          isDragging ? "border-primary bg-primary/10" : "border-input"
                      )}
                    >
                      <div className="flex flex-col items-center justify-center">
                          <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                          <span className="font-semibold text-primary">
                              {sharedFile?.[0]?.name ? 'File selected:' : 'Choose a file or drag it here'}
                          </span>
                          {sharedFile?.[0]?.name && <span className="text-sm text-foreground mt-1 truncate max-w-full">{sharedFile[0].name}</span>}
                          <p className="text-xs text-muted-foreground mt-2">
                              PDF or Image, Max ${MAX_SHARED_FILE_SIZE_MB}MB
                          </p>
                      </div>
                      <Input
                          id="file"
                          type="file"
                          {...registerSharedFile("file")}
                          accept={ACCEPTED_SHARED_FILE_TYPES.join(',')}
                          className="sr-only" // Visually hidden but accessible
                          disabled={isUploadingSharedFile}
                      />
                  </Label>
                  {sharedFileErrors.file && <p className="text-sm text-destructive mt-2">{sharedFileErrors.file.message as string}</p>}
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
                { (showDeleteConfirmModal.type === 'product' || showDeleteConfirmModal.type === 'category' || showDeleteConfirmModal.type === 'sharedFile' ) && " and its associated file(s)/image(s) from storage."}
                { showDeleteConfirmModal.type === 'user' && " from the user database. This does not remove the user from Firebase Authentication."}
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
                <Label htmlFor="editSharedFilePhoneNumber">Phone Number</Label>
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

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(isOpen) => {
          if (!isUpdatingUser && !isOpen) {
            setEditingUser(null);
            resetUserEditForm();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Roles: {editingUser.name || editingUser.email}</DialogTitle>
              <DialogDescription>
                Modify the Admin and Dealer roles for this user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitUserEdit(onUserEditSubmit)} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                   <Controller
                    name="isAdmin"
                    control={userEditFormControl}
                    render={({ field }) => (
                      <Checkbox
                        id="isAdmin"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isUpdatingUser || (editingUser.uid === user?.uid && usersList.filter(usr => usr.isAdmin).length === 1)}
                      />
                    )}
                  />
                  <Label htmlFor="isAdmin" className="font-body">
                    Administrator Role
                  </Label>
                </div>
                {editingUser.uid === user?.uid && usersList.filter(usr => usr.isAdmin).length === 1 && (
                   <p className="text-xs text-destructive">Cannot remove admin role from the only administrator.</p>
                )}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="isDealer"
                    control={userEditFormControl}
                    render={({ field }) => (
                       <Checkbox
                        id="isDealer"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isUpdatingUser}
                      />
                    )}
                  />
                  <Label htmlFor="isDealer" className="font-body">
                    Dealer Role
                  </Label>
                </div>
              </div>
              {userEditErrors.isAdmin && <p className="text-sm text-destructive">{userEditErrors.isAdmin.message}</p>}
              {userEditErrors.isDealer && <p className="text-sm text-destructive">{userEditErrors.isDealer.message}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setEditingUser(null); resetUserEditForm(); }} disabled={isUpdatingUser}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingUser}>
                  {isUpdatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isUpdatingUser ? "Saving..." : "Save Roles"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
      <Footer />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminPageContent />
    </Suspense>
  );
}

    

    

    
