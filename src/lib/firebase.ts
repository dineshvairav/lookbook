
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

// Critical check and log for the API key
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "") {
  console.error(
    "CRITICAL_FIREBASE_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid. " +
    "Ensure it's correctly set in your environment variables (e.g., .env or GitHub Secrets) and prefixed with NEXT_PUBLIC_."
  );
  // You might want to throw an error here in production or handle it more strictly.
} else {
  // Log the API key being used (first few and last few characters for verification without exposing the full key)
  const apiKeyPreview = `${firebaseConfig.apiKey.substring(0, 5)}...${firebaseConfig.apiKey.substring(firebaseConfig.apiKey.length - 5)}`;
  console.log(`Attempting to initialize Firebase with API Key (preview): ${apiKeyPreview}`);
}


if (!getApps().length) {
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
