"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { UserNav } from "@/components/auth/UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Menu, X } from "lucide-react";
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
import { useRouter } from "next/navigation";


const AISearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="m14 7-1-2-1 2-2 1 2 1 1 2 1-2 2-1-2-1Z" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user, isLoading } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchValue.trim();
    
    if (query) {
        closeMobileMenu();
        setIsSearchOpen(false);
        setSearchValue("");
        searchInputRef.current?.blur();
        router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold font-headline text-primary hover:opacity-80 transition-opacity">
          ushªOªpp
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center h-9">
            <div
              className={cn(
                "relative transition-all duration-300 ease-in-out",
                isSearchOpen ? "w-56" : "w-9",
                isSearchOpen && searchValue && "p-[1.5px] rounded-lg search-container-with-glow"
              )}
            >
              <Input
                ref={searchInputRef}
                type="search"
                name="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => {
                  if (!searchValue) {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="AI Search..."
                className={cn(
                  "relative h-9 w-full bg-background pl-10 pr-4 text-sm transition-all duration-300 ease-in-out focus-visible:ring-0 focus-visible:ring-offset-0",
                  isSearchOpen ? "cursor-text" : "cursor-pointer",
                  // If glowing, remove border and adjust radius. Otherwise, use default input border.
                  isSearchOpen && searchValue
                    ? "border-0 rounded-[calc(var(--radius)-1.5px)]"
                    : "border border-input rounded-lg"
                )}
              />
            </div>

            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Search"
              className="absolute left-0 h-9 w-9 shrink-0 rounded-lg"
              onClick={(e) => {
                if (!isSearchOpen) {
                  e.preventDefault();
                  setIsSearchOpen(true);
                  searchInputRef.current?.focus();
                }
              }}
            >
              <AISearchIcon />
            </Button>
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
                        name="search"
                        type="search"
                        placeholder="AI Search..."
                        className="h-10 pl-10 w-full"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-label="Search">
                      <AISearchIcon />
                    </button>
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
    <style jsx global>{`
      .search-container-with-glow {
        overflow: hidden;
        position: relative;
        z-index: 0;
      }
      .search-container-with-glow::before {
        content: '';
        position: absolute;
        z-index: -1;
        top: 50%;
        left: 50%;
        width: 250%;
        height: 250%;
        background: conic-gradient(
          from 180deg at 50% 50%,
          #F87171 0deg,
          #FCD34D 180deg,
          #F472B6 360deg
        );
        animation: rotateGlow 3s linear infinite;
        transform: translate(-50%, -50%);
      }

      @keyframes rotateGlow {
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    `}</style>
    </>
  );
}
