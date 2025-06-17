// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCLxeB37BzolegJ8dXixOe1el19rkSDqLM",
  authDomain: "lookbook-g7ohv.firebaseapp.com",
  databaseURL: "https://lookbook-g7ohv-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lookbook-g7ohv",
  storageBucket: "lookbook-g7ohv.firebasestorage.app",
  messagingSenderId: "799992658956",
  appId: "1:799992658956:web:4a13724b58297395a28229"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
