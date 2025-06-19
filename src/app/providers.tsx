
"use client";

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { FCMSetup } from '@/components/FCMSetup'; // Import FCMSetup

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <FCMSetup /> {/* Add FCMSetup here */}
        {children}
      </WishlistProvider>
    </AuthProvider>
  );
}
