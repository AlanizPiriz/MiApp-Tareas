// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDFUQE5axt-rdWjKmE_2Vjsuc65_jLhRqY",
  authDomain: "tareas-store.firebaseapp.com",
  projectId: "tareas-store",
  storageBucket: "tareas-store.firebasestorage.app",
  messagingSenderId: "856154823033",
  appId: "1:856154823033:web:9481d295ecbc95c73337a8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { db, messaging, getToken, onMessage };
