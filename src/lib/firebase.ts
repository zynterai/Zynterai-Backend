import { getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyCK1HufIk2_imCPnJYKJ2rCASES9DuKUI0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "zynterai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "zynterai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "zynterai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "525900628078",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:525900628078:web:49451ddee9fab634f1667f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-8ZVLJH4WM0",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (await isSupported()) {
      getAnalytics(app);
    }
  } catch {
    /* ignore */
  }
}
