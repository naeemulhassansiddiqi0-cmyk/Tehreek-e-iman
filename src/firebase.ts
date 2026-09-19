import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-Replace-With-Real",
  authDomain: "tehreek-e-iman.firebaseapp.com",
  projectId: "tehreek-e-iman",
  storageBucket: "tehreek-e-iman.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase safely without duplicate app error
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
