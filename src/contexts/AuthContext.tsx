
"use client";

import type { User } from "@/lib/types";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>; // Password is now optional for initial state, but required for email/pass
  logout: () => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>; // For email/password signup
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            isAdmin: userData.isAdmin || false, // Read isAdmin, default to false
          });
        } else {
          // This case should ideally be handled during signup
          // For robustness, create a user document if it doesn't exist
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isDealer: false, // Default to false
            isAdmin: false, // Default to false for new or uninitialized users
          };
          await setDoc(userDocRef, { 
            email: newUser.email, 
            name: newUser.name, 
            isDealer: newUser.isDealer,
            isAdmin: newUser.isAdmin,
            createdAt: serverTimestamp(),
          });
          setUser(newUser);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email login.");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase login error:", error);
      throw error; // Re-throw to be caught by UI
    }
    // setIsLoading(false) is handled by onAuthStateChanged
  };

  const signup = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email signup.");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userName = firebaseUser.displayName || firebaseUser.email?.split('@')[0];
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userName,
        isDealer: false, // Default for new signups
        isAdmin: false, // Default for new signups
        createdAt: serverTimestamp(),
      });
      // onAuthStateChanged will handle setting the user state
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase signup error:", error);
      throw error; // Re-throw to be caught by UI
    }
     // setIsLoading(false) is handled by onAuthStateChanged
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase logout error:", error);
      throw error;
    }
    // setIsLoading(false) is handled by onAuthStateChanged
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
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
