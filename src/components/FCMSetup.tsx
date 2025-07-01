
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestNotificationPermissionAndSaveToken, onForegroundMessageListener } from '@/lib/fcm';

export function FCMSetup() {
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && !authLoading && user) {
      // Request permission and save token for logged-in user
      requestNotificationPermissionAndSaveToken(user.uid)
        .catch(err => console.error("Error processing FCM token:", err));

      // Set up foreground message listener
      onForegroundMessageListener()
        .catch(err => console.error('An error occurred while setting up foreground message listener. ', err));
    }
  }, [user, authLoading]);

  return null; // This component does not render anything
}
