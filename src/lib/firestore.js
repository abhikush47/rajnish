import { getApps, initializeApp, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * Saves a document to a Firestore collection
 */
export async function saveDoc(colName, data) {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error('MISSING_ENV: Firebase configuration is missing');
  }
  const colRef = collection(db, colName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date().toISOString(),
    status: 'pending' // default status
  });
  return docRef.id;
}

/**
 * Fetches documents from a Firestore collection ordered by createdAt desc
 */
export async function fetchDocs(colName, limitCount = 8) {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return [];
  }
  try {
    const colRef = collection(db, colName);
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return results;
  } catch (error) {
    console.error(`Error fetching docs from ${colName}:`, error);
    return [];
  }
}
