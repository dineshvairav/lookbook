
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GuestLoginModal } from './GuestLoginModal';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, Mail, KeyRound, User } from 'lucide-react';

interface OnboardingAuthModalProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

export function OnboardingAuthModal({ onLoginSuccess, onClose }: OnboardingAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Login Error", description: "Please enter an email.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email); // Simplified login from AuthContext
      toast({ title: "Login Successful", description: `Welcome, ${email.split('@')[0]}!` });
      onLoginSuccess();
    } catch (error) {
      toast({ title: "Login Failed", description: "Could not log in. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Mock Google Login
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    toast({ title: "Google Login (Mock)", description: "Successfully signed in with Google." });
    onLoginSuccess();
    setIsSubmitting(false);
  };

  const handleGuestLoginSuccess = () => {
    setIsGuestModalOpen(false);
    onLoginSuccess();
  };
  
  const currentLoading = authLoading || isSubmitting;

  return (
    <>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Join Lookbook</CardTitle>
          <CardDescription className="font-body">Sign in or create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4 inline-block"/>Email</TabsTrigger>
              <TabsTrigger value="social"><User className="mr-2 h-4 w-4 inline-block"/>Other</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-email" className="font-body flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/>Email</Label>
                  <Input
                    id="onboarding-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboarding-password" className="font-body flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground"/>Password</Label>
                  <Input
                    id="onboarding-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter any password (mock)"
                    disabled={currentLoading}
                  />
                </div>
                <Button type="submit" disabled={currentLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {currentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {currentLoading ? "Processing..." : "Login / Sign Up"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="social">
              <div className="space-y-4">
                <Button onClick={handleGoogleLogin} variant="outline" className="w-full" disabled={currentLoading}>
                  {currentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.386-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.85l3.254-3.138C18.189 1.186 15.479 0 12.24 0 5.48 0 0 5.48 0 12s5.48 12 12.24 12c7.27 0 11.99-4.916 11.99-11.986a10.94 10.94 0 00-.186-1.729H12.24z" fill="#4285F4"/></svg>
                  }
                  Sign in with Google (Mock)
                </Button>
                <Button onClick={() => setIsGuestModalOpen(true)} variant="secondary" className="w-full" disabled={currentLoading}>
                  {currentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                  Continue as Guest (Mock)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
           <Button variant="link" onClick={onClose} disabled={currentLoading} className="text-sm">
            Maybe later
          </Button>
        </CardFooter>
      </Card>

      <GuestLoginModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onGuestLoginSuccess={handleGuestLoginSuccess}
      />
    </>
  );
}
