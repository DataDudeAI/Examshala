// firebase-auth-service.js
// Complete Firebase authentication service for ExamPro Elite

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { auth, db } from './firebase-config.js';

/**
 * Firebase Authentication Service
 * Handles all user authentication operations
 */
class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authStateUnsubscribe = null;
    this.listeners = [];
  }

  /**
   * Initialize auth state listener
   * Calls callbacks whenever auth state changes
   */
  initAuthStateListener(callback) {
    this.authStateUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userData = await this.getUserData(user.uid);
          this.currentUser = { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            ...userData 
          };
          callback(this.currentUser);
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
          callback(user);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  /**
   * Get user data from Firestore
   */
  async getUserData(uid) {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return {};
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return {};
    }
  }

  /**
   * Register new user with email and password
   */
  async register(email, password, displayName) {
    try {
      console.log("🔄 Registering user:", email);
      
      // Validate inputs
      if (!email || !password || !displayName) {
        throw new Error("All fields are required");
      }
      
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F46E5&color=fff`
      });
      
      // Create user document in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F46E5&color=fff`,
        
        // User Statistics
        stats: {
          totalExamsTaken: 0,
          totalScore: 0,
          avgScore: 0,
          globalRank: 999999,
          streak: 0,
          longestStreak: 0
        },
        
        // User Preferences
        preferences: {
          theme: "light",
          language: "en",
          notificationsEnabled: true,
          emailUpdates: true
        },
        
        // Security & Verification
        security: {
          verified: true,
          verifiedAt: Date.now(),
          twoFactorEnabled: false,
          lastLogin: Date.now()
        },
        
        // Admin flag
        isAdmin: false,
        
        // Timestamps
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      // Create leaderboard entry
      const leaderboardRef = doc(db, "leaderboard", userCredential.user.uid);
      await setDoc(leaderboardRef, {
        uid: userCredential.user.uid,
        displayName: displayName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F46E5&color=fff`,
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
      
      console.log("✅ User registered successfully:", userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error("❌ Registration error:", error.message);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async login(email, password, rememberMe = false) {
    try {
      console.log("🔄 Logging in user:", email);
      
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
      
      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }
      
      console.log("✅ Login successful:", userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    try {
      console.log("🔄 Sending password reset email to:", email);
      
      await sendPasswordResetEmail(auth, email);
      
      console.log("✅ Password reset email sent");
      return true;
    } catch (error) {
      console.error("❌ Forgot password error:", error.message);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async logout() {
    try {
      console.log("🔄 Logging out user");
      
      await signOut(auth);
      this.currentUser = null;
      
      console.log("✅ Logout successful");
      return true;
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      throw error;
    }
  }

  /**
   * Get current logged in user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Get ID token for API calls
   */
  async getIdToken() {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error("❌ Error getting ID token:", error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) throw new Error("No user logged in");
      
      const userRef = doc(db, "users", this.currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Date.now()
      });
      
      console.log("✅ Profile updated");
      return true;
    } catch (error) {
      console.error("❌ Profile update error:", error.message);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(newPassword) {
    try {
      if (!auth.currentUser) throw new Error("No user logged in");
      
      await auth.currentUser.updatePassword(newPassword);
      
      console.log("✅ Password changed successfully");
      return true;
    } catch (error) {
      console.error("❌ Password change error:", error.message);
      throw error;
    }
  }

  /**
   * Cleanup auth listener
   */
  destroy() {
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
