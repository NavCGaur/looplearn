// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getStorage } from 'firebase/storage';

console.log("Vite Env Variables:", import.meta.env);

console.log("firebase api key", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("auth ",import.meta.env.VITE_BASE_URL)
// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);


// Initialize Firebase Auth
const auth = getAuth(app);

export { auth };
export default app;