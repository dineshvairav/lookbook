
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
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>;
  updateUserInContext: (updatedData: Partial<User>) => void; // For updating local user state
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
            avatarUrl: userData.avatarUrl || null,
          });
        } else {
          // This case should ideally not happen if signup creates the doc properly
          // But as a fallback, create it.
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isDealer: false, 
            isAdmin: false,
            phoneNumber: null,
            address: null,
            avatarUrl: null,
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
        phoneNumber: null, // Initialize new fields
        address: null,     // Initialize new fields
        avatarUrl: null,   // Initialize new fields
        createdAt: serverTimestamp(),
      });
      // onAuthStateChanged will handle setting user and setIsLoading(false)
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
      router.push('/'); 
    } catch (error) {
      console.error("Firebase logout error:", error);
      // Still set loading to false in case of error during logout, 
      // though onAuthStateChanged should also trigger.
      setIsLoading(false); 
      throw error;
    }
    // setIsLoading(false) will be handled by onAuthStateChanged
  };

  const updateUserInContext = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup, updateUserInContext }}>
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
