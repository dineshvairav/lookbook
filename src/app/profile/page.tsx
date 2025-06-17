
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Mail, Phone, Home, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must be 50 characters or less."}),
  phoneNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatarFile: z.instanceof(FileList).optional() // Placeholder for file upload
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateUserInContext } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/?authModal=true'); // Or your login page
    }
    if (user) {
      reset({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
      const avatarSrc = user.avatarUrl || (user.email ? `https://avatar.vercel.sh/${user.email}.png` : undefined);
      if (avatarSrc) setPreviewAvatar(avatarSrc);
    }
  }, [user, authLoading, router, reset]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length -1]) {
        return (parts[0][0] + parts[parts.length -1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  }

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      const updateData: Partial<User> = {
        name: data.name,
        phoneNumber: data.phoneNumber || null,
        address: data.address || null,
        // avatarUrl handling will be added here when Firebase Storage is integrated
      };

      await updateDoc(userDocRef, updateData);

      // Update user in AuthContext
      updateUserInContext(updateData);
      
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) {
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">Your Profile</CardTitle>
            <CardDescription className="font-body">Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
                  <AvatarImage src={previewAvatar || undefined} alt={user.name || "User Avatar"} />
                  <AvatarFallback className="text-3xl">
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="avatarFile" className="font-body">Change Avatar (Upload not implemented)</Label>
                  <Input 
                    id="avatarFile" 
                    type="file" 
                    accept="image/*"
                    {...register("avatarFile")}
                    onChange={handleAvatarChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled // Disabled until upload logic is implemented
                  />
                  {errors.avatarFile && <p className="text-sm text-destructive">{errors.avatarFile.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-body flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/>Email</Label>
                <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted/50"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="font-body flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground"/>Name</Label>
                <Input id="name" type="text" {...register("name")} placeholder="Your full name" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-body flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground"/>Phone Number</Label>
                <Input id="phoneNumber" type="tel" {...register("phoneNumber")} placeholder="e.g., (555) 123-4567"/>
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="font-body flex items-center"><Home className="mr-2 h-4 w-4 text-muted-foreground"/>Address</Label>
                <Textarea id="address" {...register("address")} placeholder="123 Main St, Anytown, USA" rows={3}/>
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              
              <CardFooter className="px-0 pt-6">
                <Button type="submit" disabled={isSaving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
