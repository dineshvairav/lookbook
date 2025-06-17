
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, ShieldCheck, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link"; 

export function UserNav() {
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />;
  }

  if (!user) {
    return null; 
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message || "Could not log out. Please try again.", variant: "destructive" });
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

  const avatarSrc = user.avatarUrl || (user.email ? `https://avatar.vercel.sh/${user.email}.png` : undefined);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarSrc} alt={user.name || user.email || "User"} />
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none font-headline flex items-center">
              {user.name || "User"}
              {user.isDealer && <ShieldCheck className="ml-2 h-4 w-4 text-green-500" title="Dealer Account" />}
              {user.isAdmin && <Settings className="ml-2 h-4 w-4 text-blue-500" title="Admin Account" />}
            </p>
            <p className="text-xs leading-none text-muted-foreground font-body">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem asChild disabled> 
              {/* 
                This Link component will be enabled when /admin page exists.
                For now, keeping it as a disabled menu item.
                <Link href="/admin">
              */}
              <>
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </>
              {/* </Link> */}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
