/**
 * Firebase Integration Module
 * Provides functions to persist exam data to Firebase Realtime Database
 * Falls back to LocalStorage if Firebase is not available
 */

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "YOUR_DATABASE_URL",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

let db = null;
let useFirebase = false;

/**
 * Initialize Firebase Database
 * Call this on app startup
 */
async function initializeFirebase() {
  try {
    // Load Firebase SDKs
    if (!window.firebase) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
      document.head.appendChild(script);
      
      const script2 = document.createElement('script');
      script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
      document.head.appendChild(script2);
      
      // Wait for scripts to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (window.firebase) {
      window.firebase.initializeApp(firebaseConfig);
      db = window.firebase.database();
      useFirebase = true;
      console.log('✅ Firebase initialized successfully');
      return true;
    }
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, using LocalStorage:', error);
    useFirebase = false;
  }
  return false;
}

/**
 * Save exam results to Firebase or LocalStorage
 */
async function saveResultsBackend(results) {
  try {
    if (useFirebase && db) {
      const resultId = new Date().getTime();
      const resultData = {
        ...results,
        timestamp: new Date().toISOString()
      };
      
      await db.ref(`results/${resultId}`).set(resultData);
      console.log('✅ Results saved to Firebase:', resultId);
      return { success: true, resultId };
    } else {
      // Fallback to Netlify Function
      try {
        const response = await fetch('/.netlify/functions/save-results', {
          method: 'POST',
          body: JSON.stringify(results)
        });
        const data = await response.json();
        if (data.success) {
          console.log('✅ Results saved via Netlify Function');
          return data;
        }
      } catch (error) {
        console.warn('⚠️ Netlify Function unavailable, using LocalStorage');
      }
      
      // Ultimate fallback to LocalStorage
      localStorage.setItem('results', JSON.stringify(results));
      console.log('✅ Results saved to LocalStorage');
      return { success: true, method: 'localStorage' };
    }
  } catch (error) {
    console.error('❌ Error saving results:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load results from Firebase or LocalStorage
 */
async function loadResultsBackend() {
  try {
    if (useFirebase && db) {
      const snapshot = await db.ref('results').once('value');
      const results = snapshot.val() || {};
      console.log('✅ Results loaded from Firebase');
      return Object.values(results);
    } else {
      // Fallback to LocalStorage
      const resultsStr = localStorage.getItem('results');
      const results = resultsStr ? JSON.parse(resultsStr) : [];
      console.log('✅ Results loaded from LocalStorage');
      return Array.isArray(results) ? results : [results];
    }
  } catch (error) {
    console.error('❌ Error loading results:', error);
    return [];
  }
}

/**
 * Save analytics data
 */
async function saveAnalyticsBackend(analytics) {
  try {
    if (useFirebase && db) {
      await db.ref('analytics').set(analytics);
      console.log('✅ Analytics saved to Firebase');
      return { success: true };
    } else {
      localStorage.setItem('analytics', JSON.stringify(analytics));
      console.log('✅ Analytics saved to LocalStorage');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Error saving analytics:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load analytics data
 */
async function loadAnalyticsBackend() {
  try {
    if (useFirebase && db) {
      const snapshot = await db.ref('analytics').once('value');
      const analytics = snapshot.val() || {};
      console.log('✅ Analytics loaded from Firebase');
      return analytics;
    } else {
      const analyticsStr = localStorage.getItem('analytics');
      return analyticsStr ? JSON.parse(analyticsStr) : {};
    }
  } catch (error) {
    console.error('❌ Error loading analytics:', error);
    return {};
  }
}

/**
 * Save questions (admin only)
 */
async function saveQuestionsBackend(questions) {
  try {
    if (useFirebase && db) {
      await db.ref('questions').set(questions);
      console.log('✅ Questions saved to Firebase');
      return { success: true };
    } else {
      localStorage.setItem('questions', JSON.stringify(questions));
      console.log('✅ Questions saved to LocalStorage');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Error saving questions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load questions
 */
async function loadQuestionsBackend() {
  try {
    if (useFirebase && db) {
      const snapshot = await db.ref('questions').once('value');
      const questions = snapshot.val() || {};
      console.log('✅ Questions loaded from Firebase');
      return questions;
    } else {
      const questionsStr = localStorage.getItem('questions');
      return questionsStr ? JSON.parse(questionsStr) : {};
    }
  } catch (error) {
    console.error('❌ Error loading questions:', error);
    return {};
  }
}

/**
 * Authenticate admin via Netlify Function
 */
async function authenticateAdminBackend(password) {
  try {
    // Try Netlify Function first
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        console.log('✅ Admin authenticated via Netlify Function');
        return { success: true, token: data.token };
      }
    }
  } catch (error) {
    console.warn('⚠️ Netlify Function unavailable, using local authentication');
  }
  
  // Fallback to local authentication
  const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
  if (password === adminPassword) {
    const token = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('adminToken', token);
    console.log('✅ Admin authenticated locally');
    return { success: true, token };
  }
  
  console.error('❌ Invalid admin password');
  return { success: false, error: 'Invalid password' };
}

/**
 * Get analytics summary
 */
async function getAnalyticsSummary() {
  try {
    if (useFirebase && db) {
      // Try to call Netlify Function for server-side analytics
      try {
        const response = await fetch('/.netlify/functions/analytics');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Analytics loaded from Netlify Function');
          return data;
        }
      } catch (error) {
        console.warn('⚠️ Netlify Function unavailable');
      }
      
      // Fallback to client-side calculation
      const snapshot = await db.ref('results').once('value');
      const results = snapshot.val() || {};
      return calculateAnalytics(Object.values(results));
    } else {
      const resultsStr = localStorage.getItem('results');
      const results = resultsStr ? JSON.parse(resultsStr) : [];
      return calculateAnalytics(Array.isArray(results) ? results : [results]);
    }
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    return { totalAttempts: 0, averageScore: 0 };
  }
}

/**
 * Calculate analytics from results array
 */
function calculateAnalytics(results) {
  if (!results || results.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      examStats: {}
    };
  }

  let totalScore = 0;
  const examStats = {};

  results.forEach(result => {
    totalScore += result.score || 0;
    
    const exam = result.examType;
    if (!examStats[exam]) {
      examStats[exam] = { count: 0, totalScore: 0, avgScore: 0 };
    }
    examStats[exam].count++;
    examStats[exam].totalScore += result.score || 0;
    examStats[exam].avgScore = (examStats[exam].totalScore / examStats[exam].count).toFixed(2);
  });

  return {
    totalAttempts: results.length,
    averageScore: (totalScore / results.length).toFixed(2),
    examStats
  };
}

/**
 * Export all data as JSON (admin feature)
 */
async function exportAllDataBackend() {
  try {
    const results = await loadResultsBackend();
    const analytics = await loadAnalyticsBackend();
    const questions = await loadQuestionsBackend();
    
    const allData = {
      exportDate: new Date().toISOString(),
      results,
      analytics,
      questions
    };
    
    return { success: true, data: allData };
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if Firebase is initialized and connected
 */
function isFirebaseConnected() {
  return useFirebase && db !== null;
}

/**
 * Get backend status
 */
function getBackendStatus() {
  return {
    firebase: useFirebase,
    storage: isFirebaseConnected() ? 'Firebase' : 'LocalStorage',
    timestamp: new Date().toISOString()
  };
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeFirebase,
    saveResultsBackend,
    loadResultsBackend,
    saveAnalyticsBackend,
    loadAnalyticsBackend,
    saveQuestionsBackend,
    loadQuestionsBackend,
    authenticateAdminBackend,
    getAnalyticsSummary,
    exportAllDataBackend,
    isFirebaseConnected,
    getBackendStatus
  };
}
