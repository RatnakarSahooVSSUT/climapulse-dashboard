"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsMzZjFtYKM_jYtyjQyLpdoTrQA4RPX1k",
  authDomain: "envai-monitoring.firebaseapp.com",
  projectId: "envai-monitoring",
  storageBucket: "envai-monitoring.firebasestorage.app",
  messagingSenderId: "921805072757",
  appId: "1:921805072757:web:784efbbe8af8fb1a8e0b3c",
  measurementId: "G-VHF8T8K4BK",
};

// Prevent multiple Firebase initializations in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firestore database
export const db = getFirestore(app);