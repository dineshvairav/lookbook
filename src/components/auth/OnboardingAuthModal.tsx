
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
import { Loader2, LogIn, Mail, KeyRound, UserPlus, User } from 'lucide-react'; 
import { useRouter } from 'next/navigation';

interface OnboardingAuthModalProps {
  onLoginSuccess: () => void; 
  onClose: () => void;
}

export function OnboardingAuthModal({ onLoginSuccess, onClose }: OnboardingAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup, signInWithGoogle, isLoading: authLoading } = useAuth(); // Added signInWithGoogle
  const { toast } = useToast();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // Default to login
  const router = useRouter();

  const currentLoading = authLoading || isSubmitting;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Login Error", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({ title: "Login Successful", description: `Welcome back!` });
      onLoginSuccess();
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Could not log in. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Signup Error", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(email, password);
      toast({ title: "Signup Successful", description: "Welcome! Your account has been created." });
      onLoginSuccess();
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message || "Could not create account. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle(); 
      toast({ title: "Google Sign-In Successful", description: "Welcome!" });
      onLoginSuccess();
    } catch (error: any) {
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLoginSuccess = (phoneNumber: string) => {
    setIsGuestModalOpen(false);
    router.push('/downloads'); 
  };
  
  return (
    <>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Join Lookbook</CardTitle>
          <CardDescription className="font-body">Create an account or sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full"> {/* Default to login */}
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4 inline-block"/>Login</TabsTrigger>
              <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4 inline-block"/>Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-login-email" className="font-body flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/>Email</Label>
                  <Input
                    id="onboarding-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboarding-login-password" className="font-body flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground"/>Password</Label>
                  <Input
                    id="onboarding-login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <Button type="submit" disabled={currentLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {currentLoading && activeTab === "login" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {currentLoading && activeTab === "login" ? "Logging In..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-signup-email" className="font-body flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/>Email</Label>
                  <Input
                    id="onboarding-signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboarding-signup-password" className="font-body flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground"/>Password</Label>
                  <Input
                    id="onboarding-signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <Button type="submit" disabled={currentLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {currentLoading && activeTab === "signup" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {currentLoading && activeTab === "signup" ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button onClick={handleGoogleLogin} variant="outline" className="w-full mt-4" disabled={currentLoading}>
                {isSubmitting && !authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                  <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.386-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.85l3.254-3.138C18.189 1.186 15.479 0 12.24 0 5.48 0 0 5.48 0 12s5.48 12 12.24 12c7.27 0 11.99-4.916 11.99-11.986a10.94 10.94 0 00-.186-1.729H12.24z" fill="#4285F4"/></svg>
                }
                {isSubmitting && !authLoading ? "Processing..." : "Sign in with Google"}
              </Button> 
              
              <Button onClick={() => setIsGuestModalOpen(true)} variant="secondary" className="w-full mt-2" disabled={currentLoading}>
                {currentLoading && activeTab === "guest" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                Continue as Guest
              </Button> 
            </div>
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
