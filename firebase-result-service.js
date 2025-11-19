// firebase-result-service.js
// Firebase Result Service for ExamPro Elite

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { db } from './firebase-config.js';

/**
 * Firebase Result Service
 * Handles exam results, scoring, and user statistics
 */
class FirebaseResultService {
  
  /**
   * Submit exam result
   */
  async submitResult(userId, examId, answers, totalQuestions) {
    try {
      console.log("🔄 Submitting exam result:", examId);
      
      // Calculate score
      let correctCount = 0;
      const processedAnswers = answers.map(answer => {
        if (answer.correct) {
          correctCount++;
        }
        return {
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          correct: answer.correct,
          timeSpent: answer.timeSpent || 0
        };
      });

      const score = correctCount;
      const percentage = Math.round((correctCount / totalQuestions) * 100);
      const accuracy = (correctCount / totalQuestions).toFixed(4);

      // Get exam details for metadata
      const examRef = doc(db, "exams", examId);
      const examSnap = await getDoc(examRef);
      const examData = examSnap.exists() ? examSnap.data() : {};

      // Create result document
      const resultsRef = collection(db, "results");
      const resultData = {
        userId: userId,
        examId: examId,
        answers: processedAnswers,
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        accuracy: parseFloat(accuracy),
        totalTime: answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
        avgTimePerQuestion: Math.round(
          answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / answers.length
        ),
        
        // Category performance
        categoryPerformance: this.calculateCategoryPerformance(answers, examData),
        
        // Status
        status: "submitted",
        
        // Timestamps
        startedAt: Date.now() - (answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) * 1000),
        submittedAt: Date.now(),
        duration: answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) * 1000
      };

      const resultRef = await addDoc(resultsRef, resultData);
      console.log("✅ Result submitted:", resultRef.id);

      // Update user statistics
      await this.updateUserStats(userId, examId, score, totalQuestions, accuracy);

      // Update leaderboard
      await this.updateLeaderboard(userId, score);

      return {
        resultId: resultRef.id,
        score: score,
        percentage: percentage,
        accuracy: accuracy
      };
    } catch (error) {
      console.error("❌ Error submitting result:", error);
      throw error;
    }
  }

  /**
   * Calculate category performance
   */
  calculateCategoryPerformance(answers, examData) {
    const performance = {};
    
    // Get categories from exam data (if available)
    if (examData.topics) {
      examData.topics.forEach(topic => {
        performance[topic] = {
          correct: 0,
          total: 0
        };
      });
    }

    // Count correct answers per category
    answers.forEach(answer => {
      const category = answer.category || "General";
      if (!performance[category]) {
        performance[category] = { correct: 0, total: 0 };
      }
      performance[category].total++;
      if (answer.correct) {
        performance[category].correct++;
      }
    });

    return performance;
  }

  /**
   * Update user statistics after exam submission
   */
  async updateUserStats(userId, examId, score, totalQuestions, accuracy) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn("⚠️ User document not found:", userId);
        return;
      }

      const userData = userSnap.data();
      const currentStats = userData.stats || {};

      const newStats = {
        totalExamsTaken: (currentStats.totalExamsTaken || 0) + 1,
        totalScore: (currentStats.totalScore || 0) + score,
        avgScore: Math.round(
          ((currentStats.totalScore || 0) + score) / 
          ((currentStats.totalExamsTaken || 0) + 1)
        ),
        streak: (currentStats.streak || 0) + 1,
        longestStreak: Math.max(
          currentStats.longestStreak || 0,
          (currentStats.streak || 0) + 1
        )
      };

      await updateDoc(userRef, {
        stats: { ...currentStats, ...newStats },
        updatedAt: Date.now()
      });

      console.log("✅ User stats updated");
    } catch (error) {
      console.error("❌ Error updating user stats:", error);
    }
  }

  /**
   * Update leaderboard entry
   */
  async updateLeaderboard(userId, score) {
    try {
      const leaderboardRef = doc(db, "leaderboard", userId);
      const leaderboardSnap = await getDoc(leaderboardRef);

      if (leaderboardSnap.exists()) {
        const data = leaderboardSnap.data();
        const newData = {
          totalScore: (data.totalScore || 0) + score,
          totalExams: (data.totalExams || 0) + 1,
          avgScore: Math.round(
            ((data.totalScore || 0) + score) / 
            ((data.totalExams || 0) + 1)
          ),
          updatedAt: Date.now()
        };

        await updateDoc(leaderboardRef, newData);
        console.log("✅ Leaderboard updated");
      }
    } catch (error) {
      console.error("❌ Error updating leaderboard:", error);
    }
  }

  /**
   * Get user results
   */
  async getUserResults(userId, limit_count = 10) {
    try {
      console.log("🔄 Fetching user results:", userId);

      const resultsRef = collection(db, "results");
      const q = query(
        resultsRef,
        where("userId", "==", userId),
        orderBy("submittedAt", "desc"),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        resultId: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Loaded ${results.length} results for user`);
      return results;
    } catch (error) {
      console.error("❌ Error fetching results:", error);
      return [];
    }
  }

  /**
   * Get result details
   */
  async getResultDetails(resultId) {
    try {
      console.log("🔄 Fetching result details:", resultId);

      const resultRef = doc(db, "results", resultId);
      const resultSnap = await getDoc(resultRef);

      if (resultSnap.exists()) {
        console.log("✅ Result found");
        return {
          id: resultSnap.id,
          ...resultSnap.data()
        };
      } else {
        console.warn("⚠️ Result not found:", resultId);
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching result:", error);
      return null;
    }
  }

  /**
   * Get user exam history
   */
  async getExamHistory(userId, examId) {
    try {
      console.log("🔄 Fetching exam history:", examId);

      const resultsRef = collection(db, "results");
      const q = query(
        resultsRef,
        where("userId", "==", userId),
        where("examId", "==", examId),
        orderBy("submittedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Loaded ${results.length} attempts for exam`);
      return results;
    } catch (error) {
      console.error("❌ Error fetching exam history:", error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().stats || {};
      }
      return {};
    } catch (error) {
      console.error("❌ Error fetching user stats:", error);
      return {};
    }
  }

  /**
   * Calculate performance trends
   */
  async getPerformanceTrends(userId, examId = null) {
    try {
      let results = [];

      if (examId) {
        results = await this.getExamHistory(userId, examId);
      } else {
        results = await this.getUserResults(userId, 50);
      }

      // Calculate trend
      if (results.length < 2) {
        return { trend: 0, improvement: 0 };
      }

      const oldScore = results[results.length - 1].percentage;
      const newScore = results[0].percentage;
      const improvement = Math.round(newScore - oldScore);

      return {
        trend: improvement > 0 ? 'up' : 'down',
        improvement: Math.abs(improvement),
        oldScore: oldScore,
        newScore: newScore
      };
    } catch (error) {
      console.error("❌ Error calculating trends:", error);
      return { trend: 'neutral', improvement: 0 };
    }
  }
}

// Export singleton instance
export const firebaseResultService = new FirebaseResultService();
