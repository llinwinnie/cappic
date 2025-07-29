import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your Firebase config for cappic project
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // You'll get this from Firebase Console
  authDomain: "cappic-a0124.firebaseapp.com",
  projectId: "cappic-a0124",
  storageBucket: "cappic-a0124.appspot.com",
  messagingSenderId: "679538022164",
  appId: "1:679538022164:web:XXXXXXXXXXXXXXXXXXXX" // You'll get this from Firebase Console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app; 