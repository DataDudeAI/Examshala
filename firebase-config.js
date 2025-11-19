// firebase-config.js
// Firebase initialization and configuration for ExamPro Elite

// Import Firebase SDK methods
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

// ⚠️ IMPORTANT: Replace with your Firebase configuration
// Get this from Firebase Console > Project Settings > Your Apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // ← Replace
  authDomain: "your-project.firebaseapp.com", // ← Replace
  projectId: "your-project-id", // ← Replace
  storageBucket: "your-project.appspot.com", // ← Replace
  messagingSenderId: "YOUR_SENDER_ID", // ← Replace
  appId: "YOUR_APP_ID", // ← Replace
  databaseURL: "https://your-project.firebaseio.com" // ← Replace (optional)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase app initialized");

// Initialize Authentication with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("⚠️ Auth persistence error:", error.code);
});
console.log("✅ Firebase Auth initialized");

// Initialize Firestore with offline persistence
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((error) => {
  if (error.code === 'failed-precondition') {
    console.warn("⚠️ Firestore offline: Multiple tabs open");
  } else if (error.code === 'unimplemented') {
    console.warn("⚠️ Firestore offline: Browser not supported");
  }
});
console.log("✅ Firestore initialized");

// Initialize Realtime Database (optional)
const rtdb = getDatabase(app);
console.log("✅ Realtime Database initialized");

// Initialize Storage
const storage = getStorage(app);
console.log("✅ Storage initialized");

// Export Firebase services
export { auth, db, rtdb, storage };
