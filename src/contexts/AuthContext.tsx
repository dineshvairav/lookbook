
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
import { useRouter } from "next/navigation"; // Import useRouter

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

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
          });
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isDealer: false, 
            isAdmin: false, 
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
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase login error:", error);
      throw error; 
    }
  };

  const signup = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email signup.");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userName = firebaseUser.displayName || firebaseUser.email?.split('@')[0];
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userName,
        isDealer: false, 
        isAdmin: false, 
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase signup error:", error);
      throw error; 
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null
      router.push('/'); // Redirect to landing page after sign out
    } catch (error) {
      setIsLoading(false);
      console.error("Firebase logout error:", error);
      throw error;
    }
    // setIsLoading(false) is handled by onAuthStateChanged after navigation and state update
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

