// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnFwH5BGi40Kat1XjM-2Zrpd_yHEri7qE",
  authDomain: "wedding-invitation-b75f5.firebaseapp.com",
  projectId: "wedding-invitation-b75f5",
  storageBucket: "wedding-invitation-b75f5.firebasestorage.app",
  messagingSenderId: "273159250920",
  appId: "1:273159250920:web:e0ddaa61b2be31bfcf3a5d",
  measurementId: "G-RQ7NHCVWNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);