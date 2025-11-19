# 🔥 Firebase Integration Guide - Quick Start

**Complete Firebase integration for your ExamPro Elite exam portal with working examples.**

---

## 📋 Quick Setup (5 Minutes)

### Step 1: Update firebase-config.js

Get your Firebase credentials from [Firebase Console](https://console.firebase.google.com):

```javascript
// firebase-config.js - Replace these values:
const firebaseConfig = {
  apiKey: "AIza...",                    // Get from console
  authDomain: "exampro-elite.firebaseapp.com",
  projectId: "exampro-elite",           // Your project ID
  storageBucket: "exampro-elite.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:...",
  databaseURL: "https://exampro-elite.firebaseio.com"
};
```

### Step 2: Include Firebase in Your HTML

#### For `auth.html`:

```html
<!-- Before closing </body> tag -->

<!-- Firebase Configuration -->
<script type="module">
  import { auth, db } from './firebase-config.js';
  window.firebase = { auth, db };
  console.log("✅ Firebase ready for auth");
</script>

<!-- Updated Auth Handler -->
<script type="module">
  import { firebaseAuthService } from './firebase-auth-service.js';
  window.authService = firebaseAuthService;
  
  // Initialize auth state listener
  firebaseAuthService.initAuthStateListener((user) => {
    if (user) {
      console.log("✅ User logged in:", user.email);
      // Redirect to portal
      window.location.href = 'portal.html';
    }
  });
</script>

<!-- Load your existing auth.js (updated to use firebase services) -->
<script src="auth-firebase.js"></script>
```

#### For `portal.html`:

```html
<!-- Before closing </body> tag -->

<!-- Firebase Configuration -->
<script type="module">
  import { auth, db, rtdb } from './firebase-config.js';
  window.firebase = { auth, db, rtdb };
  console.log("✅ Firebase ready for portal");
</script>

<!-- Load Firebase Services -->
<script type="module">
  import { firebaseAuthService } from './firebase-auth-service.js';
  import { firebaseExamService } from './firebase-exam-service.js';
  import { firebaseResultService } from './firebase-result-service.js';
  import { firebaseLeaderboardService } from './firebase-leaderboard-service.js';
  
  window.authService = firebaseAuthService;
  window.examService = firebaseExamService;
  window.resultService = firebaseResultService;
  window.leaderboardService = firebaseLeaderboardService;
  
  console.log("✅ All Firebase services loaded");
</script>

<!-- Updated Portal Handler -->
<script src="portal-firebase.js"></script>
```

---

## 🔐 Authentication Usage Examples

### Register New User

```javascript
import { firebaseAuthService } from './firebase-auth-service.js';

async function handleRegister(email, password, displayName) {
  try {
    const user = await firebaseAuthService.register(email, password, displayName);
    console.log("✅ User registered:", user.uid);
    
    // User document automatically created in Firestore
    // Redirect to portal
    window.location.href = 'portal.html';
  } catch (error) {
    console.error("❌ Registration failed:", error.message);
    showError(error.message);
  }
}
```

### Login User

```javascript
async function handleLogin(email, password, rememberMe = false) {
  try {
    const user = await firebaseAuthService.login(email, password, rememberMe);
    console.log("✅ User logged in:", user.uid);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to portal
    window.location.href = 'portal.html';
  } catch (error) {
    console.error("❌ Login failed:", error.message);
    showError(error.message);
  }
}
```

### Forgot Password

```javascript
async function handleForgotPassword(email) {
  try {
    await firebaseAuthService.forgotPassword(email);
    console.log("✅ Password reset email sent to:", email);
    showSuccess("Check your email for password reset link");
  } catch (error) {
    console.error("❌ Forgot password failed:", error.message);
    showError(error.message);
  }
}
```

### Logout

```javascript
async function handleLogout() {
  try {
    await firebaseAuthService.logout();
    console.log("✅ User logged out");
    
    localStorage.removeItem('user');
    window.location.href = 'landing.html';
  } catch (error) {
    console.error("❌ Logout failed:", error.message);
  }
}
```

### Check Authentication State

```javascript
import { firebaseAuthService } from './firebase-auth-service.js';

// Setup auth listener (do this on page load)
firebaseAuthService.initAuthStateListener((user) => {
  if (user) {
    console.log("✅ User is logged in:", user.email);
    // Show portal UI
    document.getElementById('portalUI').style.display = 'block';
  } else {
    console.log("❌ User is not logged in");
    // Redirect to login
    window.location.href = 'auth.html';
  }
});
```

---

## 📚 Exam Usage Examples

### Load All Exams

```javascript
import { firebaseExamService } from './firebase-exam-service.js';

async function loadExams() {
  try {
    const exams = await firebaseExamService.getAllExams();
    console.log(`✅ Loaded ${exams.length} exams`);
    
    // Display exams
    exams.forEach(exam => {
      console.log(`- ${exam.title} (${exam.difficulty})`);
    });
    
    return exams;
  } catch (error) {
    console.error("❌ Error loading exams:", error);
  }
}
```

### Get Exam by ID

```javascript
const exam = await firebaseExamService.getExamById('exam001');
console.log("Exam:", exam.title);
console.log("Duration:", exam.duration, "minutes");
console.log("Questions:", exam.metadata.totalQuestions);
```

### Get Exam Questions

```javascript
const questions = await firebaseExamService.getExamQuestions('exam001');
console.log(`Loaded ${questions.length} questions`);

questions.forEach((q, index) => {
  console.log(`Q${index + 1}: ${q.text}`);
  console.log(`Options: ${q.options.map(o => o.text).join(', ')}`);
});
```

### Filter Exams

```javascript
const allExams = await firebaseExamService.getAllExams();

// Filter by difficulty
const hardExams = firebaseExamService.filterExams(allExams, {
  difficulty: 'hard'
});

// Filter by category
const dsaExams = firebaseExamService.filterExams(allExams, {
  category: 'DSA'
});

// Multiple filters
const filtered = firebaseExamService.filterExams(allExams, {
  category: 'DSA',
  difficulty: 'medium',
  maxDuration: 60,
  sortBy: 'title'
});
```

### Search Exams

```javascript
const results = await firebaseExamService.searchExams('algorithm');
console.log(`Found ${results.length} exams`);
```

---

## 📊 Results Usage Examples

### Submit Exam Result

```javascript
import { firebaseResultService } from './firebase-result-service.js';

async function submitExamResult() {
  const userId = firebaseAuthService.getCurrentUser().uid;
  const examId = 'exam001';
  
  const answers = [
    { questionId: 'q001', userAnswer: 'b', correct: true, timeSpent: 45 },
    { questionId: 'q002', userAnswer: 'a', correct: false, timeSpent: 120 },
    { questionId: 'q003', userAnswer: 'c', correct: true, timeSpent: 60 }
    // ... more answers
  ];
  
  try {
    const result = await firebaseResultService.submitResult(
      userId,
      examId,
      answers,
      30 // total questions
    );
    
    console.log("✅ Result submitted");
    console.log(`Score: ${result.score}/30`);
    console.log(`Percentage: ${result.percentage}%`);
    console.log(`Accuracy: ${result.accuracy}`);
    
    // Show results page
    displayResults(result);
  } catch (error) {
    console.error("❌ Error submitting result:", error);
  }
}
```

### Get User Results

```javascript
const userId = firebaseAuthService.getCurrentUser().uid;
const results = await firebaseResultService.getUserResults(userId, 10);

console.log(`User has ${results.length} results`);
results.forEach(result => {
  console.log(`- ${result.examId}: ${result.percentage}% (${result.submittedAt})`);
});
```

### Get User Statistics

```javascript
const userId = firebaseAuthService.getCurrentUser().uid;
const stats = await firebaseResultService.getUserStats(userId);

console.log("📊 User Statistics:");
console.log(`Total Exams: ${stats.totalExamsTaken}`);
console.log(`Avg Score: ${stats.avgScore}%`);
console.log(`Global Rank: ${stats.globalRank}`);
console.log(`Current Streak: ${stats.streak}`);
```

---

## 🏆 Leaderboard Usage Examples

### Get Global Leaderboard

```javascript
import { firebaseLeaderboardService } from './firebase-leaderboard-service.js';

// Get top 50 users
const leaderboard = await firebaseLeaderboardService.getGlobalLeaderboard(50);

console.log("🏆 Global Leaderboard:");
leaderboard.forEach(user => {
  console.log(`${user.rank}. ${user.displayName} - ${user.totalScore} points`);
});
```

### Get Top 10 Users

```javascript
const topUsers = await firebaseLeaderboardService.getTopUsers(10);
topUsers.forEach(user => {
  console.log(`🥇 ${user.displayName}: ${user.totalScore} points`);
});
```

### Get User Rank

```javascript
const userId = firebaseAuthService.getCurrentUser().uid;
const userRank = await firebaseLeaderboardService.getUserRank(userId);

console.log(`Your Rank: #${userRank.globalRank}`);
console.log(`Total Score: ${userRank.totalScore}`);
console.log(`Exams Completed: ${userRank.totalExams}`);
console.log(`Badges: ${userRank.badges.join(', ')}`);
```

### Get Nearby Users

```javascript
const userId = firebaseAuthService.getCurrentUser().uid;
const nearby = await firebaseLeaderboardService.getNearbyUsers(userId, 5);

console.log("Users near you:");
nearby.forEach(user => {
  console.log(`${user.rank}. ${user.displayName}`);
});
```

### Get Category Leaderboard

```javascript
const categoryLeaderboard = await firebaseLeaderboardService.getCategoryLeaderboard('DSA', 50);

console.log("🏆 DSA Leaderboard:");
categoryLeaderboard.forEach(user => {
  console.log(`${user.displayName}: Rank #${user.categoryRanks['DSA']}`);
});
```

---

## 🔄 Complete Example: Exam Flow

### Full Exam-Taking Flow

```javascript
import { firebaseAuthService } from './firebase-auth-service.js';
import { firebaseExamService } from './firebase-exam-service.js';
import { firebaseResultService } from './firebase-result-service.js';

// 1. Check if user is logged in
firebaseAuthService.initAuthStateListener((user) => {
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }

  // 2. Load exams
  loadAndDisplayExams();
});

async function loadAndDisplayExams() {
  const exams = await firebaseExamService.getAllExams();
  displayExamGrid(exams);
}

async function startExam(examId) {
  // 3. Get exam details
  const exam = await firebaseExamService.getExamById(examId);
  console.log("Starting:", exam.title);

  // 4. Get questions
  const questions = await firebaseExamService.getExamQuestions(examId);
  displayExamQuestions(exam, questions);
}

async function submitExam(examId, userAnswers) {
  const user = firebaseAuthService.getCurrentUser();
  
  // 5. Get total questions to calculate score
  const questions = await firebaseExamService.getExamQuestions(examId);
  const totalQuestions = questions.length;

  // 6. Submit result
  const result = await firebaseResultService.submitResult(
    user.uid,
    examId,
    userAnswers,
    totalQuestions
  );

  // 7. Display results
  displayExamResults(result);

  // 8. Refresh leaderboard
  const leaderboard = await firebaseLeaderboardService.getTopUsers(10);
  displayLeaderboard(leaderboard);
}
```

---

## 🧪 Testing Checklist

- [ ] Firebase config updated with your credentials
- [ ] Can register new user
- [ ] User document created in Firestore
- [ ] Can login with email/password
- [ ] Can logout
- [ ] Forgot password sends email
- [ ] Can load exams from Firestore
- [ ] Can get exam questions
- [ ] Can submit exam result
- [ ] Result saved to Firestore
- [ ] User stats updated
- [ ] Leaderboard updates
- [ ] Can view global leaderboard
- [ ] Can view user rank
- [ ] Offline functionality works (IndexedDB)
- [ ] Sync works when back online

---

## 🚀 Next Steps

1. **Populate Test Data**: Add sample exams and questions to Firestore
2. **Create Admin Panel**: Build admin UI for managing exams
3. **Add Email Verification**: Verify user emails before access
4. **Enable Social Login**: Set up Google OAuth
5. **Deploy to Firebase Hosting**: Use Firebase CLI to deploy

---

## 📞 Support

For issues or questions:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)
- Check browser console for error messages
- Verify Firestore Security Rules allow your operations

---

**Firebase Integration Ready!** 🎉

Your exam portal is now fully integrated with Firebase. All data will be stored in Firestore, users authenticated with Firebase Auth, and stats tracked in real-time.
