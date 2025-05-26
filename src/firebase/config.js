import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2QMUF5UaedkMDHqP9qHg56BTeNvW1JV4",
  authDomain: "suresh-teddy-bears-shop.firebaseapp.com",
  projectId: "suresh-teddy-bears-shop",
  storageBucket: "suresh-teddy-bears-shop.appspot.com",
  messagingSenderId: "1031138989468",
  appId: "1:1031138989468:web:37cd47e653f0d166392459",
  measurementId: "G-8MDZL7FS4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
export default app;
