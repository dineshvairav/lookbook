
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage
import { getMessaging, isSupported } from "firebase/messaging"; // Added for FCM

// Your web app's Firebase configuration
// Using environment variables for Firebase config
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;

// This guard prevents re-initialization on hot reloads
if (!getApps().length) {
  // Check for placeholder values which are not allowed
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('REPLACE_WITH_YOUR_')) {
    // We're using a more visible console.error with styling to make it unmissable.
    console.error(
      `%c
======================================================================
          >>> CRITICAL FIREBASE CONFIGURATION ERROR <<<
======================================================================

 The Firebase API Key is missing or using a placeholder value.
 The application cannot connect to Firebase without it.

 === PLEASE FOLLOW THESE STEPS ===

 1. Find your project's API key in the Firebase Console:
    Project Settings > General > Your apps > Web app > SDK setup and configuration

 2. Open the '.env' file located in the root of this project.

 3. Paste your credentials into the file, replacing the placeholders.

 4. Restart the application for the changes to take effect.

======================================================================`,
      'font-family:monospace; color:red; font-size:14px; font-weight:bold;'
    );
    // You could throw an error here to halt execution completely on the server-side,
    // but the console error is often sufficient for development.
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Messaging and export it
// We need to check if messaging is supported by the browser
const initializeMessaging = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    // Check if all necessary FCM config values are present
    if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
        return getMessaging(app);
    } else {
        console.warn(
          "Firebase Messaging could not be initialized due to missing core Firebase configuration values. " +
          "Ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, " +
          "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, and NEXT_PUBLIC_FIREBASE_APP_ID are set in your .env file."
        );
        return null;
    }
  }
  return null;
};

// messaging will be a Promise that resolves to the Messaging instance or null
export const messaging = initializeMessaging();


export default app;
