
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/?authModal=true');
      } else if (!user.isAdmin) {
        router.replace('/shop'); // Or a dedicated access denied page
      }
    }
  }, [user, authLoading, router]);

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
              This is the central hub for all administrative tasks. In the future, you'll find tools here to manage users, products, categories, site settings, deal banners, and more.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder for future admin modules/links */}
              <div className="bg-background p-4 rounded-lg border hover:shadow-md transition-shadow">
                <h3 className="font-headline text-lg text-accent">User Management</h3>
                <p className="text-sm text-muted-foreground font-body">View, edit, and manage user accounts.</p>
              </div>
              <div className="bg-background p-4 rounded-lg border hover:shadow-md transition-shadow">
                <h3 className="font-headline text-lg text-accent">Product Catalog</h3>
                <p className="text-sm text-muted-foreground font-body">Add, update, and remove products.</p>
              </div>
              <div className="bg-background p-4 rounded-lg border hover:shadow-md transition-shadow">
                <h3 className="font-headline text-lg text-accent">Categories</h3>
                <p className="text-sm text-muted-foreground font-body">Organize products by categories.</p>
              </div>
              <div className="bg-background p-4 rounded-lg border hover:shadow-md transition-shadow">
                <h3 className="font-headline text-lg text-accent">Site Settings</h3>
                <p className="text-sm text-muted-foreground font-body">Configure global application settings.</p>
              </div>
              <div className="bg-background p-4 rounded-lg border hover:shadow-md transition-shadow">
                <h3 className="font-headline text-lg text-accent">Deal Banners</h3>
                <p className="text-sm text-muted-foreground font-body">Manage promotional banners for the shop.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
