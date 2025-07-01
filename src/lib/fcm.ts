
'use client'; // For using hooks like useToast

import { getToken, onMessage, isSupported } from 'firebase/messaging';
import { messaging as firebaseMessagingInstancePromise, db } from './firebase'; // firebaseMessagingInstance is now a promise
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export const requestNotificationPermissionAndSaveToken = async (userId: string): Promise<string | null> => {
  if (!(await isSupported()) || typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Firebase Messaging is not supported in this browser or environment.');
    return null;
  }
  const firebaseMessaging = await firebaseMessagingInstancePromise;
  if (!firebaseMessaging) {
    console.log('Firebase Messaging instance is not available.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.error('VAPID key is not configured. Please set NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable.');
        toast({
          title: 'Messaging Error',
          description: 'Notification VAPID key not configured.',
          variant: 'destructive',
        });
        return null;
      }

      const currentToken = await getToken(firebaseMessaging, { vapidKey });
      if (currentToken) {
        // Save the token to Firestore
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          fcmTokens: arrayUnion(currentToken), // Add token to an array
          fcmTokensUpdatedAt: serverTimestamp(), // Keep track of when tokens were last updated
        });
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        toast({
          title: 'Messaging Issue',
          description: 'Could not get notification token. Try enabling notifications for this site.',
          variant: 'destructive',
        });
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      toast({
        title: 'Notifications Denied',
        description: 'You will not receive push notifications.',
        variant: 'default',
      });
      return null;
    }
  } catch (error) {
    console.error('An error occurred while requesting permission or getting token: ', error);
    toast({
      title: 'Messaging Error',
      description: 'An error occurred while setting up notifications.',
      variant: 'destructive',
    });
    return null;
  }
};

export const onForegroundMessageListener = async () => {
  const firebaseMessaging = await firebaseMessagingInstancePromise;
   if (!firebaseMessaging) {
    console.log('Firebase Messaging instance is not available for foreground listener.');
    return null;
  }
  return new Promise((resolve) => {
    onMessage(firebaseMessaging, (payload) => {
      console.log('Received foreground message:', payload);
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body || '',
      });
      resolve(payload);
    });
  });
};
