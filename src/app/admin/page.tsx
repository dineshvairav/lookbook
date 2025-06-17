
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, ShieldAlert, LayoutDashboard, UploadCloud, Send, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const fileUploadSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Include country code e.g. +12223334444" }),
  file: z.any()
    .refine((files: FileList | undefined | null) => files && files.length > 0, "File is required.")
    .refine(
      (files: FileList | undefined | null) => files && files[0] && files[0].size <= MAX_FILE_SIZE_BYTES,
      `Max file size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (files: FileList | undefined | null) => files && files[0] && ACCEPTED_FILE_TYPES.includes(files[0].type),
      "Only PDF and common image files (JPEG, PNG, GIF, WebP) are accepted."
    ),
});

type FileUploadFormValues = z.infer<typeof fileUploadSchema>;

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploadingSharedFile, setIsUploadingSharedFile] = useState(false);

  const {
    register: registerSharedFile,
    handleSubmit: handleSubmitSharedFile,
    reset: resetSharedFileForm,
    formState: { errors: sharedFileErrors }
  } = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadSchema),
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/?authModal=true'); // Or your landing page
      } else if (!user.isAdmin) {
        router.replace('/shop'); // Or a general "access denied" page
      }
    }
  }, [user, authLoading, router]);

  const onSharedFileUploadSubmit: SubmitHandler<FileUploadFormValues> = async (data) => {
    if (!user || !user.isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to perform this action.", variant: "destructive" });
      return;
    }
    setIsUploadingSharedFile(true);
    try {
      const fileToUpload = data.file[0];
      // Sanitize phone number for use in path if necessary, though Firebase paths are quite flexible.
      // For simplicity, using it directly. Ensure your validation covers typical formats.
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

      toast({ title: "File Uploaded", description: `${fileToUpload.name} has been uploaded successfully for ${data.phoneNumber}.` });
      resetSharedFileForm();
    } catch (error: any) {
      console.error("Error uploading shared file:", error);
      let errorMessage = "Could not upload file. Please try again.";
      if (error.code) { // Firebase error codes
         switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = "Permission denied by storage rules. Ensure admin has write access and CORS is configured correctly.";
                break;
              case 'storage/object-not-found':
              case 'storage/bucket-not-found':
              case 'storage/project-not-found':
                errorMessage = "Storage configuration error. Please check Firebase setup or bucket name.";
                break;
              case 'storage/quota-exceeded':
                errorMessage = "Storage quota exceeded.";
                break;
              case 'storage/canceled':
                errorMessage = "Upload cancelled by the user.";
                break;
              case 'storage/unknown':
                errorMessage = "An unknown storage error occurred. Check browser console for details.";
                break;
              default:
                errorMessage = `Storage error: ${error.message || error.code}`;
            }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsUploadingSharedFile(false);
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
            <CardContent>
              <p className="font-body text-foreground/90">
                This is the central hub for all administrative tasks. More modules will be added here.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for future admin modules/links */}
                <div className="bg-secondary/30 p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <h3 className="font-headline text-lg text-accent">User Management</h3>
                  <p className="text-sm text-muted-foreground font-body">View, edit, and manage user accounts.</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <h3 className="font-headline text-lg text-accent">Product Catalog</h3>
                  <p className="text-sm text-muted-foreground font-body">Add, update, and remove products.</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <h3 className="font-headline text-lg text-accent">Categories</h3>
                  <p className="text-sm text-muted-foreground font-body">Organize products by categories.</p>
                </div>
              </div>
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
                This file will be accessible to them if they log in as a guest with that number.
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
                  <Label htmlFor="file" className="font-body">File (PDF or Image, Max {MAX_FILE_SIZE_MB}MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    {...registerSharedFile("file")}
                    accept={ACCEPTED_FILE_TYPES.join(',')}
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
