// firebase-config.js
// Firebase initialization and configuration for ExamPro Elite

// Import Firebase SDK methods
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeSWog8lCk__K53uuV7SmySB-obQYzB_E",
  authDomain: "examshala-ce41d.firebaseapp.com",
  projectId: "examshala-ce41d",
  storageBucket: "examshala-ce41d.firebasestorage.app",
  messagingSenderId: "172203928340",
  appId: "1:172203928340:web:bc06c3becfcc925bd5b001",
  measurementId: "G-RQ2SP16JQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
const analytics = getAnalytics(app);

// Initialize Authentication with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("⚠️ Auth persistence error:", error.code);
});

// Initialize Firestore with offline persistence
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((error) => {
  if (error.code === 'failed-precondition') {
    console.warn("⚠️ Firestore offline: Multiple tabs open");
  } else if (error.code === 'unimplemented') {
    console.warn("⚠️ Firestore offline: Browser not supported");
  }
});

// Initialize Realtime Database (optional)
const rtdb = getDatabase(app);

// Initialize Storage
const storage = getStorage(app);

// Export Firebase services
export { app, auth, db, rtdb, storage, analytics };
