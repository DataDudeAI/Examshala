# 🔥 Firebase Integration Guide for ExamPro Elite

**Complete Firebase Realtime Database & Firestore setup for the ExamPro Elite exam portal.**

---

## 📋 Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Installation & Configuration](#installation--configuration)
3. [Firestore Database Schema](#firestore-database-schema)
4. [Authentication](#authentication)
5. [Frontend Integration](#frontend-integration)
6. [Real-time Sync Strategy](#real-time-sync-strategy)
7. [Deployment](#deployment)

---

## 🚀 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter Project Name: `exampro-elite`
4. Enable Google Analytics (optional)
5. Create Project
6. Wait for provisioning to complete

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable Sign-in methods:
   - ✅ **Email/Password**
   - ✅ **Google**
   - ✅ **GitHub** (optional)
4. Configure OAuth redirect URIs:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **Production Mode**
5. Security Rules will be configured in Step 5

### Step 4: Configure Realtime Database (Optional)

For real-time notifications and leaderboard updates:

1. Go to **Realtime Database**
2. Click "Create Database"
3. Choose region
4. Start in **Test Mode** for development

### Step 5: Get Firebase Config

1. Click Project Settings (gear icon)
2. Go to "Your apps" section
3. Click "Web" to create web app
4. Register app name: `exampro-web`
5. Copy the Firebase config:

```javascript
// Copy this to your environment variables
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "exampro-elite.firebaseapp.com",
  projectId: "exampro-elite",
  storageBucket: "exampro-elite.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 💾 Installation & Configuration

### Step 1: Install Firebase SDK

```bash
# Using npm
npm install firebase

# Or using yarn
yarn add firebase

# Or via CDN (for vanilla HTML)
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js"></script>
```

### Step 2: Create Firebase Configuration File

Create `firebase-config.js`:

```javascript
// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "exampro-elite.firebaseapp.com",
  projectId: "exampro-elite",
  storageBucket: "exampro-elite.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://exampro-elite.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Authentication with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence error:", error);
});

// Initialize Firestore with offline persistence
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((error) => {
  if (error.code === 'failed-precondition') {
    console.warn("Firestore offline persistence: Multiple tabs open");
  } else if (error.code === 'unimplemented') {
    console.warn("Firestore offline persistence: Browser not supported");
  }
});

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Storage
export const storage = getStorage(app);
```

### Step 3: Update HTML Files to Use Firebase

Add to `auth.html` before closing `</body>`:

```html
<!-- Firebase Configuration -->
<script type="module">
  import { auth, db } from './firebase-config.js';
  // Make available globally for auth.js
  window.firebase = { auth, db };
</script>
<script src="auth-firebase.js"></script>
```

Add to `portal.html`:

```html
<!-- Firebase Configuration -->
<script type="module">
  import { auth, db, rtdb } from './firebase-config.js';
  window.firebase = { auth, db, rtdb };
</script>
<script src="portal-firebase.js"></script>
```

---

## 🗄️ Firestore Database Schema

### Collection Structure

#### 1. **users** Collection

```javascript
// Document ID: uid (from Firebase Auth)
{
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  avatar: "https://...",
  
  // User Statistics
  stats: {
    totalExamsTaken: 25,
    totalScore: 2150,
    avgScore: 86,
    globalRank: 142,
    streak: 5,
    longestStreak: 12
  },
  
  // User Preferences
  preferences: {
    theme: "dark",
    language: "en",
    notificationsEnabled: true,
    emailUpdates: true
  },
  
  // Security & Verification
  security: {
    verified: true,
    verifiedAt: 1642521600000,
    twoFactorEnabled: false,
    lastLogin: 1642521600000
  },
  
  // Admin Flag
  isAdmin: false,
  
  // Timestamps
  createdAt: 1642521600000,
  updatedAt: 1642521600000
}
```

**Indexes:**
- Single field: `globalRank` (ascending)
- Single field: `createdAt` (descending)
- Composite: `stats.avgScore` + `stats.totalExamsTaken`

#### 2. **exams** Collection

```javascript
// Document ID: examId
{
  examId: "exam001",
  title: "Data Structures & Algorithms",
  description: "Master DSA fundamentals",
  category: "DSA",
  difficulty: "hard",
  duration: 45, // minutes
  icon: "📊",
  color: "#4F46E5",
  
  // Exam Metadata
  metadata: {
    totalQuestions: 30,
    passingScore: 60,
    totalAttempts: 1250,
    avgScore: 72,
    createdBy: "admin@exampro.com",
    createdAt: 1642521600000
  },
  
  // Questions Sub-collection reference
  questionCount: 30,
  
  // Tags and Topics
  tags: ["array", "trees", "graphs", "sorting"],
  topics: ["Arrays", "Trees", "Graphs", "Sorting"],
  
  // Status
  isActive: true,
  isPublished: true
}
```

**Sub-collection: `exams/{examId}/questions`**

```javascript
// Document ID: q001, q002, etc.
{
  questionId: "q001",
  text: "What is the time complexity of binary search?",
  type: "multiple-choice", // or "essay", "fill-blank"
  difficulty: "easy",
  
  // Options for multiple choice
  options: [
    { id: "a", text: "O(n)", correct: false },
    { id: "b", text: "O(log n)", correct: true },
    { id: "c", text: "O(n log n)", correct: false },
    { id: "d", text: "O(n²)", correct: false }
  ],
  
  // Correct answer(s)
  correctAnswer: "b",
  
  // Explanation
  explanation: "Binary search divides the array in half each time...",
  
  // Analytics
  analytics: {
    attempts: 450,
    correctAttempts: 340,
    avgTimeSpent: 45, // seconds
    difficulty: 0.75 // success rate
  },
  
  // Metadata
  createdAt: 1642521600000,
  updatedAt: 1642521600000
}
```

#### 3. **results** Collection

```javascript
// Document ID: resultId (auto-generated)
{
  resultId: "result123",
  userId: "user123",
  examId: "exam001",
  
  // Answers
  answers: [
    {
      questionId: "q001",
      userAnswer: "b",
      correct: true,
      timeSpent: 45 // seconds
    },
    {
      questionId: "q002",
      userAnswer: "c",
      correct: false,
      timeSpent: 120
    }
    // ... more answers
  ],
  
  // Scoring
  score: 28, // out of 30
  percentage: 93.33,
  accuracy: 0.9333,
  
  // Performance
  totalTime: 1800, // seconds
  avgTimePerQuestion: 60,
  
  // Category Performance
  categoryPerformance: {
    "Arrays": { correct: 8, total: 10 },
    "Trees": { correct: 10, total: 10 },
    "Graphs": { correct: 8, total: 10 },
    "Sorting": { correct: 2, total: 0 }
  },
  
  // Status
  status: "submitted", // or "in-progress", "abandoned"
  
  // Timestamps
  startedAt: 1642521600000,
  submittedAt: 1642521660000,
  duration: 60000 // milliseconds
}
```

**Indexes:**
- Composite: `userId` + `submittedAt` (descending)
- Composite: `examId` + `submittedAt` (descending)

#### 4. **leaderboard** Collection

```javascript
// Document ID: uid (same as users)
{
  uid: "user123",
  displayName: "John Doe",
  avatar: "https://...",
  
  // Global Rankings
  globalRank: 142,
  totalScore: 2150,
  totalExams: 25,
  avgScore: 86,
  
  // Category Rankings
  categoryRanks: {
    "DSA": 15,
    "Web": 42,
    "ML": 89,
    "Database": 23
  },
  
  // Badges & Achievements
  badges: [
    "fast-learner",
    "perfect-score",
    "streak-master"
  ],
  achievements: [
    {
      id: "first-exam",
      title: "First Exam",
      earnedAt: 1642521600000
    }
  ],
  
  // Period
  period: "all-time", // or "monthly", "weekly"
  
  // Last Updated
  updatedAt: 1642521600000
}
```

#### 5. **progressTracking** Collection

```javascript
// Document ID: uid
{
  uid: "user123",
  
  // Learning Progress
  learningPath: {
    completedTopics: ["Arrays", "Lists", "Stacks"],
    currentTopic: "Queues",
    suggestedNext: "Trees",
    completionPercentage: 35
  },
  
  // Exam History
  examHistory: {
    "DSA": {
      attempts: 5,
      bestScore: 95,
      lastAttempt: 1642521600000,
      improvement: 12 // percentage
    }
  },
  
  // Goals
  goals: {
    "target-score": 85,
    "exams-per-week": 3,
    "streak-goal": 7
  },
  
  // Recommendations
  recommendations: [
    {
      examId: "exam002",
      reason: "Similar to recently completed exam",
      priority: "high"
    }
  ],
  
  // Last Updated
  updatedAt: 1642521600000
}
```

#### 6. **passwordResets** Collection

```javascript
// Document ID: resetId (auto-generated)
{
  resetId: "reset123",
  uid: "user123",
  email: "user@example.com",
  token: "hashed_token_here",
  
  // Token Expiration
  expiresAt: 1642525200000,
  
  // Status
  used: false,
  usedAt: null,
  
  // Timestamps
  createdAt: 1642521600000
}
```

#### 7. **notifications** Collection

```javascript
// Document ID: uid (sub-collection)
// {uid}/notifications/{notificationId}
{
  notificationId: "notif123",
  userId: "user123",
  
  // Notification Content
  type: "exam-result", // or "achievement", "leaderboard", "comment"
  title: "Great Score!",
  message: "You scored 95% on DSA exam!",
  
  // Related Data
  relatedId: "result123",
  relatedType: "result",
  
  // Read Status
  read: false,
  readAt: null,
  
  // Timestamps
  createdAt: 1642521600000,
  expiresAt: 1643126400000 // 7 days
}
```

#### 8. **adminActivity** Collection

```javascript
// Document ID: activityId (auto-generated)
{
  activityId: "activity123",
  adminId: "admin@exampro.com",
  
  // Activity Details
  action: "create_exam", // or "delete", "update", "export"
  resource: "exams",
  resourceId: "exam001",
  
  // Changes
  changes: {
    title: { before: "Old Title", after: "New Title" },
    difficulty: { before: "easy", after: "medium" }
  },
  
  // Status
  status: "success",
  
  // Timestamps
  createdAt: 1642521600000
}
```

---

## 🔐 Authentication

### Using Firebase Authentication

#### Email/Password Sign Up

```javascript
// auth-firebase.js
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";

async function handleRegister(email, password, displayName) {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    // Update profile
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      avatar: `https://ui-avatars.com/api/?name=${displayName}`,
      
      stats: {
        totalExamsTaken: 0,
        totalScore: 0,
        avgScore: 0,
        globalRank: 999999,
        streak: 0,
        longestStreak: 0
      },
      
      preferences: {
        theme: "light",
        language: "en",
        notificationsEnabled: true,
        emailUpdates: true
      },
      
      security: {
        verified: true,
        twoFactorEnabled: false,
        lastLogin: Date.now()
      },
      
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // Create leaderboard entry
    const leaderboardRef = doc(db, "leaderboard", userCredential.user.uid);
    await setDoc(leaderboardRef, {
      uid: userCredential.user.uid,
      displayName: displayName,
      avatar: `https://ui-avatars.com/api/?name=${displayName}`,
      globalRank: 999999,
      totalScore: 0,
      totalExams: 0,
      avgScore: 0,
      categoryRanks: {},
      badges: [],
      achievements: [],
      period: "all-time",
      updatedAt: Date.now()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}
```

#### Email/Password Sign In

```javascript
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

async function handleLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    // Update last login
    const userRef = doc(db, "users", userCredential.user.uid);
    await updateDoc(userRef, {
      "security.lastLogin": Date.now()
    });
    
    // Get user data for frontend
    const userDoc = await getDoc(userRef);
    return userDoc.data();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
```

#### Forgot Password

```javascript
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

async function handleForgotPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    
    // Log password reset request
    await addDoc(collection(db, "passwordResets"), {
      email: email,
      requestedAt: Date.now(),
      status: "sent"
    });
    
    return true;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}
```

#### Google Sign In

```javascript
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        avatar: user.photoURL,
        stats: {
          totalExamsTaken: 0,
          totalScore: 0,
          avgScore: 0,
          globalRank: 999999,
          streak: 0
        },
        preferences: {
          theme: "light",
          language: "en",
          notificationsEnabled: true
        },
        security: {
          verified: true,
          twoFactorEnabled: false,
          lastLogin: Date.now()
        },
        isAdmin: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}
```

---

## 🔌 Frontend Integration

### Create Firebase Service Files

#### `firebase-auth-service.js`

```javascript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from './firebase-config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authUnsubscribe = null;
  }
  
  // Initialize auth state listener
  initAuthStateListener(callback) {
    this.authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await this.getUserData(user.uid);
        this.currentUser = { ...user, ...userDoc };
        callback(this.currentUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }
  
  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      return userDoc.data() || {};
    } catch (error) {
      console.error("Error fetching user data:", error);
      return {};
    }
  }
  
  // Register new user
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, email, password
      );
      
      // Create Firestore document
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        avatar: `https://ui-avatars.com/api/?name=${displayName}`,
        stats: {
          totalExamsTaken: 0,
          totalScore: 0,
          avgScore: 0,
          globalRank: 999999,
          streak: 0,
          longestStreak: 0
        },
        preferences: {
          theme: "light",
          language: "en",
          notificationsEnabled: true,
          emailUpdates: true
        },
        security: {
          verified: true,
          twoFactorEnabled: false,
          lastLogin: Date.now()
        },
        isAdmin: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }
  
  // Sign in
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, email, password
      );
      
      // Update last login
      const userRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userRef, {
        "security.lastLogin": Date.now()
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }
  
  // Forgot password
  async forgotPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      throw error;
    }
  }
  
  // Cleanup
  destroy() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }
}

export const authService = new AuthService();
```

#### `firebase-exam-service.js`

```javascript
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from './firebase-config.js';

class ExamService {
  // Get all exams
  async getAllExams() {
    try {
      const examsRef = collection(db, "exams");
      const snapshot = await getDocs(examsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching exams:", error);
      return [];
    }
  }
  
  // Get exam by ID
  async getExamById(examId) {
    try {
      const examRef = doc(db, "exams", examId);
      const examDoc = await getDoc(examRef);
      return examDoc.data();
    } catch (error) {
      console.error("Error fetching exam:", error);
      return null;
    }
  }
  
  // Get exam questions
  async getExamQuestions(examId) {
    try {
      const questionsRef = collection(db, "exams", examId, "questions");
      const snapshot = await getDocs(questionsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  }
  
  // Get exams by category
  async getExamsByCategory(category) {
    try {
      const examsRef = collection(db, "exams");
      const q = query(examsRef, where("category", "==", category));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching exams by category:", error);
      return [];
    }
  }
}

export const examService = new ExamService();
```

#### `firebase-result-service.js`

```javascript
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from './firebase-config.js';

class ResultService {
  // Submit exam result
  async submitResult(userId, examId, answers, score, accuracy, duration) {
    try {
      const resultsRef = collection(db, "results");
      
      const resultData = {
        userId: userId,
        examId: examId,
        answers: answers,
        score: score,
        percentage: (score.correct / score.total) * 100,
        accuracy: accuracy,
        totalTime: duration,
        avgTimePerQuestion: duration / answers.length,
        status: "submitted",
        startedAt: Date.now() - duration,
        submittedAt: Date.now(),
        duration: duration
      };
      
      const resultRef = await addDoc(resultsRef, resultData);
      
      // Update user stats
      await this.updateUserStats(userId, examId, score, accuracy);
      
      return resultRef.id;
    } catch (error) {
      console.error("Error submitting result:", error);
      throw error;
    }
  }
  
  // Get user results
  async getUserResults(userId) {
    try {
      const resultsRef = collection(db, "results");
      const q = query(
        resultsRef, 
        where("userId", "==", userId),
        orderBy("submittedAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching results:", error);
      return [];
    }
  }
  
  // Update user stats after exam
  async updateUserStats(userId, examId, score, accuracy) {
    try {
      const userRef = doc(db, "users", userId);
      
      // Get current user data
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      const newStats = {
        totalExamsTaken: (userData.stats.totalExamsTaken || 0) + 1,
        totalScore: (userData.stats.totalScore || 0) + score.correct,
        avgScore: Math.round(
          ((userData.stats.totalScore || 0) + score.correct) / 
          ((userData.stats.totalExamsTaken || 0) + 1)
        ),
        streak: (userData.stats.streak || 0) + 1
      };
      
      await updateDoc(userRef, {
        stats: { ...userData.stats, ...newStats }
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  }
}

export const resultService = new ResultService();
```

#### `firebase-leaderboard-service.js`

```javascript
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from './firebase-config.js';

class LeaderboardService {
  // Get global leaderboard (paginated)
  async getGlobalLeaderboard(pageSize = 50, startAfterDoc = null) {
    try {
      const leaderboardRef = collection(db, "leaderboard");
      
      let q;
      if (startAfterDoc) {
        q = query(
          leaderboardRef,
          orderBy("totalScore", "desc"),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          leaderboardRef,
          orderBy("totalScore", "desc"),
          limit(pageSize)
        );
      }
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        data: data,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return { data: [], lastDoc: null };
    }
  }
  
  // Get user rank
  async getUserRank(userId) {
    try {
      const userRef = doc(db, "leaderboard", userId);
      const userDoc = await getDoc(userRef);
      return userDoc.data() || null;
    } catch (error) {
      console.error("Error fetching user rank:", error);
      return null;
    }
  }
}

export const leaderboardService = new LeaderboardService();
```

---

## 🔄 Real-time Sync Strategy

### Offline-First Architecture

```javascript
// offline-sync.js
import { collection, addDoc, writeBatch } from "firebase/firestore";
import { db } from './firebase-config.js';

class OfflineSyncManager {
  constructor() {
    this.syncQueue = [];
    this.syncInterval = 30000; // 30 seconds
    this.isOnline = navigator.onLine;
    this.init();
  }
  
  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  handleOnline() {
    this.isOnline = true;
    this.syncQueue();
  }
  
  handleOffline() {
    this.isOnline = false;
  }
  
  // Add operation to sync queue
  queueOperation(operation) {
    this.syncQueue.push({
      id: Date.now(),
      operation: operation,
      timestamp: Date.now(),
      retries: 0
    });
    
    // Save to IndexedDB
    this.saveToIndexedDB(this.syncQueue);
    
    // Try immediate sync if online
    if (this.isOnline) {
      this.sync();
    }
  }
  
  // Sync all pending operations
  async sync() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    for (let op of this.syncQueue) {
      try {
        await this.executeSyncOperation(op);
        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter(o => o.id !== op.id);
      } catch (error) {
        console.error("Sync error:", error);
        op.retries++;
        
        // Remove after 3 retries
        if (op.retries > 3) {
          this.syncQueue = this.syncQueue.filter(o => o.id !== op.id);
        }
      }
    }
    
    // Save updated queue
    this.saveToIndexedDB(this.syncQueue);
  }
  
  // Execute individual sync operation
  async executeSyncOperation(op) {
    const { collection: coll, data } = op.operation;
    await addDoc(collection(db, coll), data);
  }
  
  // Save queue to IndexedDB
  async saveToIndexedDB(queue) {
    return new Promise((resolve) => {
      const request = indexedDB.open('ExamProDB', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        queue.forEach(item => store.add(item));
        tx.oncomplete = resolve;
      };
    });
  }
  
  // Start periodic sync
  startPeriodicSync() {
    setInterval(() => {
      this.sync();
    }, this.syncInterval);
  }
}

export const syncManager = new OfflineSyncManager();
```

---

## 🔒 Firestore Security Rules

### Production Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users collection
    match /users/{uid} {
      allow read: if isOwner(uid);
      allow create: if isAuthenticated() && uid == request.auth.uid;
      allow update: if isOwner(uid);
      allow delete: if isAdmin();
    }
    
    // Exams collection (public read, admin write)
    match /exams/{examId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
      
      // Questions subcollection
      match /questions/{questionId} {
        allow read: if isAuthenticated();
        allow create, update, delete: if isAdmin();
      }
    }
    
    // Results collection (user read/write own, admin read all)
    match /results/{resultId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Leaderboard collection (public read)
    match /leaderboard/{uid} {
      allow read: if isAuthenticated();
      allow write: if isOwner(uid) || isAdmin();
    }
    
    // Progress tracking (user read/write own)
    match /progressTracking/{uid} {
      allow read, write: if isOwner(uid);
    }
    
    // Notifications (user read own)
    match /notifications/{uid}/notifications/{notificationId} {
      allow read: if isOwner(uid);
      allow write: if isAdmin();
    }
    
    // Admin activity log
    match /adminActivity/{docId} {
      allow read, write: if isAdmin();
    }
    
    // Catch-all: deny by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🚀 Deployment

### Deploy to Firebase Hosting

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Initialize Firebase in your project

```bash
firebase init hosting
```

#### Step 3: Build (if using build tools)

```bash
npm run build
```

#### Step 4: Deploy

```bash
firebase deploy
```

#### Step 5: View your app

```bash
firebase open hosting:site
```

---

## 📊 Firestore Pricing Considerations

### Estimated Monthly Costs

| Operation | Reads | Writes | Deletes | Estimate |
|-----------|-------|--------|---------|----------|
| 10K users | 100K | 50K | 10K | ~$2/month |
| 50K users | 500K | 250K | 50K | ~$8/month |
| 100K users | 1M | 500K | 100K | ~$15/month |

**Free Tier Limits:**
- 50K reads/day
- 20K writes/day
- 20K deletes/day
- 1GB storage

**Cost Optimization:**
1. Use indexes wisely
2. Batch operations with writeBatch
3. Archive old results
4. Use Realtime Database for frequently updated data (cheaper)

---

## ✅ Testing Firebase Integration

### Test Email/Password Registration

```html
<button onclick="testRegister()">Test Register</button>

<script>
async function testRegister() {
  try {
    const user = await authService.register(
      'test@exampro.com',
      'Password123!',
      'Test User'
    );
    console.log('✅ Registration successful:', user);
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}
</script>
```

### Test Getting Exams

```javascript
async function testGetExams() {
  const exams = await examService.getAllExams();
  console.log('✅ Exams loaded:', exams);
}
```

---

## 🔧 Troubleshooting

### Issue: Permission Denied Error
**Solution:** Check Firestore Security Rules

### Issue: Firebase not initialized
**Solution:** Ensure firebase-config.js is loaded before other scripts

### Issue: Offline sync not working
**Solution:** Enable IndexedDB persistence in firebase-config.js

---

## 📚 Next Steps

1. **Populate Exams:** Add exam data and questions
2. **Admin Panel:** Create admin UI for managing exams
3. **Email Verification:** Set up email verification
4. **Analytics:** Enable Google Analytics
5. **Push Notifications:** Set up FCM for notifications

---

**Firebase Configuration Complete!** ✅

Your ExamPro Elite portal is now ready to use Firebase for all backend operations.
