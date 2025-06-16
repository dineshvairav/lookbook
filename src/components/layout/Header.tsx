
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { UserNav } from "@/components/auth/UserNav";
import { useAuth } from "@/contexts/AuthContext"; 
import { Heart } from "lucide-react";


function HeaderClientContent() {
  const { user, isLoading } = useAuth();

  return (
    <>
      {isLoading ? (
        <div className="w-20 h-9 bg-muted rounded animate-pulse" />
      ) : user ? (
        <UserNav />
      ) : (
        <AuthDialog />
      )}
      <ThemeToggle />
    </>
  );
}


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold font-headline text-primary hover:opacity-80 transition-opacity">
          Lookbook
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
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
          <HeaderClientContent />
        </nav>
      </div>
    </header>
  );
}
