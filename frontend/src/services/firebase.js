// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDzPPhGP-JWDVDYO40NVxhyqVZt9bYR1s",
  authDomain: "massmatualsystems.firebaseapp.com",
  projectId: "massmatualsystems",
  storageBucket: "massmatualsystems.firebasestorage.app",
  messagingSenderId: "1081754386043",
  appId: "1:1081754386043:web:aed611c8d1ce2a082b6cde",
  measurementId: "G-FSV8WG75QZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
