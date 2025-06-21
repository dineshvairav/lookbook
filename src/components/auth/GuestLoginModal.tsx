
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone } from 'lucide-react';
import { z } from 'zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestLoginSuccess: (phoneNumber: string) => void; // Pass phone number back
}

const guestLoginFormSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Include country code e.g. +12223334444" }),
});

type GuestLoginFormValues = z.infer<typeof guestLoginFormSchema>;

export function GuestLoginModal({ isOpen, onClose, onGuestLoginSuccess }: GuestLoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GuestLoginFormValues>({
    resolver: zodResolver(guestLoginFormSchema),
  });


  const handleFormSubmit: SubmitHandler<GuestLoginFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call or local storage action for guest "login"
    // In a real scenario with Firebase Phone Auth, this would be more complex.
    await new Promise(resolve => setTimeout(resolve, 700)); 
    
    localStorage.setItem('guestPhoneNumber', data.phoneNumber); // Store for /downloads page

    toast({ title: "Continuing as Guest", description: `You'll see files shared for phone: ${data.phoneNumber}` });
    setIsLoading(false);
    onGuestLoginSuccess(data.phoneNumber);
    reset(); // Reset form after successful submission
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!isLoading) {
        if (!open) {
            reset(); // Reset form when modal is closed
        }
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Continue as Guest</DialogTitle>
          <DialogDescription className="font-body">
            Enter your phone number to view shared files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-phone-number" className="font-body flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground"/>Phone Number
              </Label>
              <Input
                id="guest-phone-number"
                type="tel"
                {...register("phoneNumber")}
                placeholder="+12345678900"
                disabled={isLoading}
              />
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Processing..." : "View My Files"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
