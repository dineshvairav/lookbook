
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
    "CRITICAL_FIREBASE_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing, undefined, or an empty string in your environment variables. " +
    "Firebase cannot be initialized without a valid API key. " +
    "Please ensure it is correctly set in your .env file (e.g., .env.local) at the project root, " +
    "prefixed with NEXT_PUBLIC_, and that the Next.js server has been restarted after changes. " +
    "In CI/CD environments (like GitHub Actions or Vercel), ensure this variable is set in the build environment's secrets/settings."
  );
  // In a build environment, this might be fatal. Locally, it helps debugging.
} else {
  // Log the API key being used (first few and last few characters for verification without exposing the full key)
  const apiKeyPreview = `${firebaseConfig.apiKey.substring(0, 5)}...${firebaseConfig.apiKey.substring(firebaseConfig.apiKey.length - 5)}`;
  console.log(`Attempting to initialize Firebase with API Key (preview): ${apiKeyPreview}`);
}


if (!getApps().length) {
  // Check if the API key is actually available before initializing
  // This check is particularly important for build processes where env vars might be missing
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "") {
    app = initializeApp(firebaseConfig);
  } else {
    // If API key is still missing here (e.g., in a build process that continued despite the error log),
    // subsequent Firebase service calls will fail.
    // We create a dummy app or handle this case to prevent further crashes if possible,
    // though Firebase services won't be functional.
    // For simplicity, we'll let it proceed and fail at service initialization (getAuth, getFirestore)
    // as those will provide more specific errors if app is not correctly initialized.
    // The console.error above should be the primary indicator.
    // To truly prevent a crash here, you might conditionally initialize or throw a more specific error.
    // However, Next.js build might still fail if Firebase dependent code runs.
    console.error("Firebase app could not be initialized due to missing API key. Subsequent Firebase operations will fail.");
    // A 'dummy' app object to prevent immediate crashes on `getAuth(app)` if app must be defined.
    // This won't make Firebase work, but might change where the build process fails.
    app = {} as FirebaseApp; // This is a risky band-aid, the ENV VAR is the true fix.
                            // It's better to let it fail at `initializeApp` if the key is truly bad/missing.
                            // Reverting to direct initialization and letting it throw if key is bad:
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Messaging and export it
const initializeMessaging = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
        return getMessaging(app);
    } else {
        console.warn(
          "Firebase Messaging could not be initialized due to missing core Firebase configuration values. " +
          "Ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, " +
          "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, and NEXT_PUBLIC_FIREBASE_APP_ID are set."
        );
        return null;
    }
  }
  return null;
};

export const messaging = initializeMessaging();


export default app;

