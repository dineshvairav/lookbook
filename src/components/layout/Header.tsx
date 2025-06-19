
"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { UserNav } from "@/components/auth/UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold font-headline text-primary hover:opacity-80 transition-opacity">
          Lookbook
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/shop"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors font-body"
          >
            Shop
          </Link>
          <Link
            href="/wishlist"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center font-body"
          >
            <Heart className="mr-1 h-4 w-4" /> Wishlist
          </Link>
          {/* Desktop Auth and Theme */}
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="w-20 h-9 bg-muted rounded animate-pulse" />
            ) : user ? (
              <UserNav />
            ) : (
              <AuthDialog />
            )}
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Navigation - Hamburger Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0 flex flex-col bg-background">
              <SheetHeader className="p-4 border-b border-border/40 text-left">
                <div className="flex justify-between items-center">
                  <SheetTitle>
                    <Link href="/" onClick={closeMobileMenu} className="text-xl font-bold font-headline text-primary">
                      Lookbook
                    </Link>
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-6 w-6" />
                    </Button>
                  </SheetClose>
                </div>
                <SheetDescription className="sr-only">
                  Main navigation menu for Lookbook. Access shop, wishlist, profile, and other settings.
                </SheetDescription>
              </SheetHeader>

              <nav className="flex-grow flex flex-col space-y-1 p-4">
                <Link
                  href="/shop"
                  className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors p-3 rounded-md hover:bg-accent/50 block"
                  onClick={closeMobileMenu}
                >
                  Shop
                </Link>
                <Link
                  href="/wishlist"
                  className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors flex items-center p-3 rounded-md hover:bg-accent/50"
                  onClick={closeMobileMenu}
                >
                  <Heart className="mr-2 h-5 w-5" /> Wishlist
                </Link>
                {user && (
                  <Link
                    href="/profile"
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors p-3 rounded-md hover:bg-accent/50 block"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>
                )}
                 {user?.isAdmin && (
                    <Link
                        href="/admin"
                        className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors p-3 rounded-md hover:bg-accent/50 block"
                        onClick={closeMobileMenu}
                    >
                        Admin Panel
                    </Link>
                 )}
              </nav>

              <div className="mt-auto p-4 border-t border-border/40 space-y-4">
                {/* Mobile Auth: UserNav for logged-in, AuthDialog for logged-out */}
                {isLoading ? (
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                ) : user ? (
                  <div className="flex items-center space-x-2">
                     <UserNav />
                     <span className="text-sm text-foreground/80 truncate">{user.name || user.email}</span>
                  </div>
                ) : (
                  <AuthDialog />
                )}
                {/* Mobile Theme Toggle */}
                <div className="flex justify-between items-center pt-4 border-t border-border/20">
                  <span className="text-sm font-medium text-foreground/80">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
