// Firebase configuration
// Replace with your actual Firebase project config
// Get these values from Firebase Console > Project Settings > Your apps

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);

// =============================================
// COLLECTIONS
// =============================================
export const COLLECTIONS = {
  VOLUNTEERS: 'volunteers',
  YOUTH_IDEAS: 'youth_ideas',
  CONTACTS: 'contacts',
};

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Save volunteer registration to Firestore
 */
export async function saveVolunteer(data) {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  return addDoc(collection(db, COLLECTIONS.VOLUNTEERS), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'pending',
  });
}

/**
 * Save youth idea submission
 */
export async function saveYouthIdea(data) {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  return addDoc(collection(db, COLLECTIONS.YOUTH_IDEAS), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'submitted',
  });
}

/**
 * Save contact form submission
 */
export async function saveContact(data) {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  return addDoc(collection(db, COLLECTIONS.CONTACTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
