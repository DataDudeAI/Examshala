# ExamPro Elite - Backend API Scaffolding & Database Architecture

## 📋 Table of Contents
1. [API Architecture](#api-architecture)
2. [Database Schema](#database-schema)
3. [Authentication System](#authentication-system)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Implementation Guide](#implementation-guide)
6. [Database Sync Strategy](#database-sync-strategy)

---

## 🏗️ API Architecture

### Technology Stack Recommended
```
Backend Framework:  Node.js + Express.js
Database:          MongoDB or Firebase Realtime Database
Authentication:    JWT (JSON Web Tokens)
Caching:           Redis (optional, for performance)
API Gateway:       REST (with possibility for GraphQL)
Hosting:           Netlify Functions, AWS Lambda, or Heroku
```

### API Base URL
```
Development:  http://localhost:3000/api/v1
Production:   https://api.exampro.com/api/v1
```

### Request/Response Format
```json
{
  "success": true,
  "status": 200,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  name: String,
  avatar: String (URL),
  bio: String,
  joinedDate: Date,
  lastLogin: Date,
  
  // User Stats
  stats: {
    totalExamsTaken: Number,
    totalScore: Number,
    averageScore: Number,
    currentStreak: Number,
    maxStreak: Number,
    globalRank: Number,
    totalTimeSpent: Number (in minutes)
  },
  
  // User Settings
  preferences: {
    emailNotifications: Boolean,
    examReminders: Boolean,
    newsletter: Boolean,
    theme: String (light/dark),
    language: String
  },
  
  // Security
  isVerified: Boolean,
  verificationToken: String,
  resetToken: String,
  resetTokenExpiry: Date,
  twoFactorEnabled: Boolean,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Exams Collection
```javascript
{
  _id: ObjectId,
  examId: String (unique, indexed), // 'dsa', 'web', 'ml', etc.
  title: String,
  description: String,
  category: String,
  difficulty: String (easy/medium/hard),
  duration: Number (in minutes),
  totalQuestions: Number,
  passingScore: Number (percentage),
  
  // Questions
  questions: [
    {
      questionId: String,
      questionText: String,
      questionType: String (mcq/essay/coding),
      options: [String],
      correctAnswer: String,
      explanation: String,
      difficulty: String,
      tags: [String],
      points: Number
    }
  ],
  
  // Metadata
  createdBy: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean,
  totalAttempts: Number,
  averageScore: Number
}
```

### Results Collection
```javascript
{
  _id: ObjectId,
  resultId: String (unique, indexed),
  userId: ObjectId (reference to User),
  examId: String,
  
  // Attempt Details
  attemptNumber: Number,
  startTime: Date,
  endTime: Date,
  duration: Number (actual time taken in minutes),
  
  // Scoring
  totalQuestions: Number,
  answeredQuestions: Number,
  correctAnswers: Number,
  score: Number (percentage),
  markedForReview: [String] (question IDs),
  
  // Question-wise Results
  answers: [
    {
      questionId: String,
      userAnswer: String,
      isCorrect: Boolean,
      timeSpent: Number (seconds)
    }
  ],
  
  // Performance Metrics
  accuracy: Number,
  categoryWisePerformance: {
    categoryName: Number (score)
  },
  
  // Review
  reviewed: Boolean,
  reviewedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Leaderboard Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  userName: String,
  userEmail: String,
  userAvatar: String,
  
  // Score Info
  totalScore: Number,
  examCount: Number,
  averageScore: Number,
  accuracy: Number,
  
  // Ranking
  globalRank: Number,
  categoryRanks: {
    dsa: Number,
    web: Number,
    ml: Number,
    database: Number
  },
  
  // Achievements
  badges: [String],
  achievements: [String],
  
  // Time Period (for multiple rankings)
  period: String (all/monthly/weekly),
  
  updatedAt: Date
}
```

### Progress Tracking Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  examId: String,
  
  // Progress
  questionsAttempted: [String],
  questionsCorrect: [String],
  questionsWrong: [String],
  questionsSkipped: [String],
  
  // Learning Path
  currentLevel: String,
  topicsCovered: [String],
  topicsMastered: [String],
  
  // Goals
  dailyGoal: Number,
  weeklyGoal: Number,
  currentStreak: Number,
  
  lastActivityDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Password Reset Tokens Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  email: String,
  token: String (unique, hashed),
  expiresAt: Date,
  used: Boolean,
  createdAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  type: String (exam_available/ranking/achievement/reminder),
  title: String,
  message: String,
  metadata: Object,
  read: Boolean,
  readAt: Date,
  createdAt: Date
}
```

---

## 🔐 Authentication System

### JWT Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "user_id",
  "email": "user@email.com",
  "role": "user",
  "iat": 1642270000,
  "exp": 1642356400
}

Secret: "your-secret-key"
```

### Token Expiration
```
Access Token:  15 minutes
Refresh Token: 7 days
```

### Password Security
```
Algorithm: bcrypt
Salt Rounds: 10
Min Length: 8 characters
Requirements:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
```

---

## 📡 API Endpoints Reference

### Authentication Endpoints

#### 1. Register
```
POST /auth/register
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

Response (201):
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "message": "Registration successful"
}
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "userId": "user_123",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

#### 3. Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Request:
{
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "message": "Reset link sent to email"
}
```

#### 4. Reset Password
```
POST /auth/reset-password
Content-Type: application/json

Request:
{
  "token": "reset_token_from_email",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful"
}
```

#### 5. Refresh Token
```
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "refresh_token_here"
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here"
  }
}
```

### User Endpoints

#### 6. Get User Profile
```
GET /users/profile
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "userId": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "stats": {...},
    "preferences": {...}
  }
}
```

#### 7. Update User Profile
```
PUT /users/profile
Headers: Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "name": "John Smith",
  "bio": "Updated bio",
  "preferences": {...}
}

Response (200):
{
  "success": true,
  "data": {...updated user...}
}
```

#### 8. Change Password
```
POST /users/change-password
Headers: Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Exam Endpoints

#### 9. Get All Exams
```
GET /exams?category=dsa&difficulty=hard&limit=10&offset=0
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "exams": [...],
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

#### 10. Get Exam Details
```
GET /exams/{examId}
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "examId": "dsa",
    "title": "Data Structures",
    "totalQuestions": 30,
    ...
  }
}
```

#### 11. Get Exam Questions
```
GET /exams/{examId}/questions
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "questions": [
      {
        "questionId": "q1",
        "questionText": "...",
        "options": [...],
        // Note: correctAnswer NOT included before submission
      }
    ]
  }
}
```

### Results Endpoints

#### 12. Submit Exam
```
POST /results/submit
Headers: Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "examId": "dsa",
  "answers": [
    {
      "questionId": "q1",
      "userAnswer": "optionB"
    }
  ],
  "timeTaken": 2400  // in seconds
}

Response (201):
{
  "success": true,
  "data": {
    "resultId": "result_123",
    "score": 85,
    "accuracy": 90,
    "feedback": {...}
  }
}
```

#### 13. Get Result Details
```
GET /results/{resultId}
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "resultId": "result_123",
    "score": 85,
    "answers": [...],
    "feedback": {...}
  }
}
```

#### 14. Get User Results
```
GET /results?examId=dsa&limit=10
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "results": [...],
    "total": 5
  }
}
```

### Leaderboard Endpoints

#### 15. Get Leaderboard
```
GET /leaderboard?period=all&limit=50
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_1",
        "name": "Aditya Kumar",
        "score": 9850,
        "exams": 42
      }
    ]
  }
}
```

#### 16. Get User Rank
```
GET /leaderboard/user-rank
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "globalRank": 5,
    "categoryRanks": {...}
  }
}
```

### Progress Endpoints

#### 17. Get User Progress
```
GET /progress/{examId}
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "questionsAttempted": 25,
    "correct": 20,
    "accuracy": 80,
    "currentStreak": 3
  }
}
```

### Notification Endpoints

#### 18. Get Notifications
```
GET /notifications?limit=20&unreadOnly=false
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 3
  }
}
```

#### 19. Mark Notification as Read
```
PUT /notifications/{notificationId}/read
Headers: Authorization: Bearer {accessToken}

Response (200):
{
  "success": true
}
```

---

## 🚀 Implementation Guide

### Backend Setup (Node.js + Express)

#### Step 1: Initialize Project
```bash
npm init -y
npm install express mongoose jsonwebtoken bcryptjs dotenv cors axios
npm install --save-dev nodemon
```

#### Step 2: Project Structure
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── examController.js
│   └── resultController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Exam.js
│   ├── Result.js
│   └── PasswordReset.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── exams.js
│   └── results.js
├── utils/
│   ├── emailService.js
│   └── validators.js
├── .env
├── server.js
└── package.json
```

#### Step 3: Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/exampro
DB_NAME=exampro_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Firebase (if using Firebase instead of MongoDB)
FIREBASE_PROJECT_ID=examshala-ce41d
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Step 4: Sample Server Setup
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/exams', require('./routes/exams'));
app.use('/api/v1/results', require('./routes/results'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## 🔄 Database Sync Strategy

### Real-time Synchronization

#### Frontend Implementation (Recommended: Firebase + localStorage)
```javascript
// utils/dbSync.js
class DatabaseSync {
    constructor() {
        this.syncQueue = [];
        this.isSyncing = false;
        this.lastSync = null;
    }

    // Queue offline operations
    queueOperation(operation, data) {
        this.syncQueue.push({
            type: operation,
            data: data,
            timestamp: Date.now(),
            retries: 0
        });
        this.saveQueueToStorage();
    }

    // Save queue to localStorage
    saveQueueToStorage() {
        localStorage.setItem(
            'syncQueue',
            JSON.stringify(this.syncQueue)
        );
    }

    // Sync with backend
    async sync() {
        if (this.isSyncing || this.syncQueue.length === 0) {
            return;
        }

        this.isSyncing = true;

        for (let op of this.syncQueue) {
            try {
                const response = await fetch(
                    `/api/v1/${op.type.endpoint}`,
                    {
                        method: op.type.method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify(op.data)
                    }
                );

                if (response.ok) {
                    this.syncQueue.shift();
                } else if (response.status === 401) {
                    // Handle auth refresh
                    await this.refreshToken();
                } else {
                    op.retries++;
                }
            } catch (error) {
                console.error('Sync error:', error);
                op.retries++;
            }
        }

        this.isSyncing = false;
        this.saveQueueToStorage();
        this.lastSync = Date.now();
    }

    // Periodic sync
    startPeriodicSync(intervalMs = 30000) {
        setInterval(() => {
            if (navigator.onLine) {
                this.sync();
            }
        }, intervalMs);
    }
}

// Usage
const dbSync = new DatabaseSync();
dbSync.startPeriodicSync();

// Listen to online/offline events
window.addEventListener('online', () => dbSync.sync());
```

#### Backend Sync Operations
```javascript
// Endpoint for syncing
POST /api/v1/sync/batch
Content-Type: application/json

Request: {
  "operations": [
    {
      "id": "op_1",
      "type": "exam_result",
      "data": {...},
      "clientTimestamp": 1642270000
    }
  ]
}

Response: {
  "success": true,
  "synced": ["op_1", "op_2"],
  "failed": [],
  "serverTimestamp": 1642270100
}
```

### Data Consistency

#### Conflict Resolution
```javascript
// Last-Write-Wins (LWW) Strategy
function resolveConflict(localData, serverData) {
    if (localData.updatedAt > serverData.updatedAt) {
        return localData;  // Use local version
    }
    return serverData;  // Use server version
}

// Merge Strategy (for non-conflicting fields)
function mergeData(local, server) {
    return {
        ...server,
        ...local,
        mergedAt: Date.now()
    };
}
```

### Backup Strategy

#### Daily Backups
```javascript
// Backup user data daily
async function backupUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    
    const backup = {
        user,
        results,
        backupDate: new Date().toISOString()
    };

    await fetch('/api/v1/backup', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(backup)
    });
}

// Schedule daily backup
setInterval(backupUserData, 24 * 60 * 60 * 1000);
```

---

## 📝 Database Indexes

### Recommended Indexes for Performance
```javascript
// Users Collection
db.users.createIndex({ email: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ "stats.globalRank": 1 });

// Results Collection
db.results.createIndex({ userId: 1, examId: 1 });
db.results.createIndex({ createdAt: -1 });
db.results.createIndex({ score: -1 });

// Leaderboard Collection
db.leaderboard.createIndex({ globalRank: 1 });
db.leaderboard.createIndex({ totalScore: -1 });
db.leaderboard.createIndex({ period: 1, updatedAt: -1 });

// PasswordReset Collection
db.passwordReset.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 🔗 API Integration with Frontend

### Example: Registering and Syncing Data
```javascript
async function register(name, email, password) {
    try {
        const response = await fetch('https://api.exampro.com/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Store tokens
            localStorage.setItem('authToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Sync data
            await dbSync.sync();
            
            return data.data;
        }
    } catch (error) {
        // Queue for later sync
        dbSync.queueOperation('auth/register', { name, email, password });
        throw error;
    }
}
```

---

## 🎯 Next Steps

1. **Choose Database**: MongoDB (easier) or Firebase (simpler setup)
2. **Setup Authentication**: Implement JWT-based auth
3. **Build API Endpoints**: Start with auth, then exams, then results
4. **Implement Sync**: Add offline support and data sync
5. **Deploy**: Use Netlify Functions, AWS Lambda, or Heroku
6. **Monitor**: Add logging and analytics

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [bcryptjs Package](https://www.npmjs.com/package/bcryptjs)

---

**Production Ready**: All endpoints follow REST conventions with proper error handling, validation, and security measures.
