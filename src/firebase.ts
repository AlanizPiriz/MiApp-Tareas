// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyATmFSfglE1IPX51Ricr0pMCjBcBXLaOJA",
  authDomain: "app-tareasv2.firebaseapp.com",
  projectId: "app-tareasv2",
  storageBucket: "app-tareasv2.firebasestorage.app",
  messagingSenderId: "236313959259",
  appId: "1:236313959259:web:b40d15eea44a1e497ed87e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { db, messaging, getToken, onMessage };
export const auth = getAuth(app);
