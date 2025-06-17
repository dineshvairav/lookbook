
"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthDialog() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup, isLoading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const currentLoading = authLoading || isSubmitting;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Login Error", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({ title: "Login Successful", description: `Welcome back!` });
      setOpen(false); // Close dialog on successful login
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Could not log in. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Signup Error", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(email, password);
      toast({ title: "Signup Successful", description: `Welcome! Your account has been created.` });
      setOpen(false); // Close dialog on successful signup
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message || "Could not create account. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) { // Reset fields when dialog closes
        setEmail("");
        setPassword("");
        setActiveTab("login");
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">
            {activeTab === "login" ? "Login" : "Sign Up"}
          </DialogTitle>
          <DialogDescription className="font-body text-center">
            {activeTab === "login" ? "Access your Lookbook account." : "Create a new Lookbook account."}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="login-email" className="text-left font-body">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password" className="text-left font-body">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={currentLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={currentLoading} className="w-full">
                  {currentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Login
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <div className="grid gap-4 py-4">
                 <div className="space-y-1">
                  <Label htmlFor="signup-email" className="text-left font-body">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={currentLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password" className="text-left font-body">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    required
                    disabled={currentLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={currentLoading} className="w-full">
                  {currentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Sign Up
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
