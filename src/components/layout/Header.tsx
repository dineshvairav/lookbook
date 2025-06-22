
"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { UserNav } from "@/components/auth/UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchInputRef.current?.value;
    if (query) {
        console.log(`Searching for: ${query}`);
        // In a real app, you'd redirect:
        // router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsSearchOpen(false);
        searchInputRef.current.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold font-headline text-primary hover:opacity-80 transition-opacity">
          ushªOªpp
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
             <div className={cn(
                "flex items-center h-9 rounded-md border transition-all duration-300 ease-in-out",
                isSearchOpen ? "w-56 bg-background border-input" : "w-9 bg-transparent border-transparent"
              )}>
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => {
                      setIsSearchOpen(true);
                      searchInputRef.current?.focus();
                  }}
              >
                  <Search className="h-5 w-5" />
              </Button>
              <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products..."
                  className={cn(
                      "flex-grow bg-transparent h-full outline-none text-sm transition-all duration-300 ease-in-out placeholder:text-muted-foreground",
                      isSearchOpen ? "w-full opacity-100 pl-1 pr-2" : "w-0 opacity-0 p-0"
                  )}
                  onBlur={() => {
                      if (!searchInputRef.current?.value) {
                          setIsSearchOpen(false);
                      }
                  }}
              />
            </div>
          </form>
          
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
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 flex flex-col bg-background">
              <SheetHeader className="p-4 border-b border-border/40 text-left">
                <SheetTitle>
                  <Link href="/" onClick={closeMobileMenu} className="text-xl font-bold font-headline text-primary">
                    ushªOªpp
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu for ushªOªpp. Access shop, wishlist, profile, and other settings.
                </SheetDescription>
              </SheetHeader>

              <div className="p-4">
                 <form onSubmit={handleSearchSubmit} className="relative">
                    <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search products..."
                        className="h-10 pl-10 w-full"
                        onFocus={() => setIsSearchOpen(true)}
                        onBlur={() => setIsSearchOpen(false)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 </form>
              </div>

              <nav className="flex-grow flex flex-col space-y-1 p-4 pt-0">
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
