
"use client";

import type { User } from "@/lib/types";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider, // Added
  signInWithPopup,      // Added
  type User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Added
  updateUserInContext: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isDealer: userData.isDealer || false,
            isAdmin: userData.isAdmin || false,
            phoneNumber: userData.phoneNumber || null,
            address: userData.address || null,
            avatarUrl: userData.avatarUrl || firebaseUser.photoURL || null, // Prioritize Firestore avatar
          });
        } else {
          // New user (either via email/pass signup or first Google sign-in)
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isDealer: false, 
            isAdmin: false,
            phoneNumber: null,
            address: null,
            avatarUrl: firebaseUser.photoURL || null, // Use Google's photoURL if available
          };
          await setDoc(userDocRef, { 
            email: newUser.email, 
            name: newUser.name, 
            isDealer: newUser.isDealer,
            isAdmin: newUser.isAdmin,
            phoneNumber: newUser.phoneNumber,
            address: newUser.address,
            avatarUrl: newUser.avatarUrl,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email login.");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting user and setIsLoading(false)
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error("This email is already associated with a Google account. Please use 'Sign in with Google' instead.");
      }
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error("Invalid email or password. Please try again.");
      }
      throw error;
    }
  };

  const signup = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email signup.");
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user, creating the Firestore doc, and setting isLoading to false.
      // This avoids a race condition and centralizes new user creation logic.
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use. Please log in or use a different email.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('The password is too weak. Please use at least 6 characters.');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting user, Firestore doc, and setIsLoading(false)
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // Set a flag to show onboarding on the landing page after logout
      sessionStorage.setItem('showOnboardingAfterLogout', 'true');
      router.push('/'); 
    } catch (error) {
      setIsLoading(false); 
      throw error;
    }
  };

  const updateUserInContext = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup, signInWithGoogle, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
