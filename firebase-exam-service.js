// firebase-exam-service.js
// Firebase Exam Service for ExamPro Elite

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { db } from './firebase-config.js';

/**
 * Firebase Exam Service
 * Handles all exam-related operations
 */
class FirebaseExamService {
  constructor() {
    this.examsCache = [];
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastCacheTime = 0;
  }

  /**
   * Get all exams (with caching)
   */
  async getAllExams(forceRefresh = false) {
    try {
      // Return cache if valid
      if (!forceRefresh && this.examsCache.length > 0 && 
          Date.now() - this.lastCacheTime < this.cacheExpiry) {
        console.log("📦 Using cached exams");
        return this.examsCache;
      }

      console.log("🔄 Fetching exams from Firestore");
      
      const examsRef = collection(db, "exams");
      const q = query(examsRef, where("isPublished", "==", true));
      const snapshot = await getDocs(q);
      
      this.examsCache = snapshot.docs.map(doc => ({
        id: doc.id,
        examId: doc.id,
        ...doc.data()
      }));
      
      this.lastCacheTime = Date.now();
      
      console.log(`✅ Loaded ${this.examsCache.length} exams`);
      return this.examsCache;
    } catch (error) {
      console.error("❌ Error fetching exams:", error);
      return [];
    }
  }

  /**
   * Get exam by ID
   */
  async getExamById(examId) {
    try {
      console.log("🔄 Fetching exam:", examId);
      
      const examRef = doc(db, "exams", examId);
      const examDoc = await getDoc(examRef);
      
      if (examDoc.exists()) {
        const examData = {
          id: examDoc.id,
          examId: examDoc.id,
          ...examDoc.data()
        };
        console.log("✅ Exam found:", examId);
        return examData;
      } else {
        console.warn("⚠️ Exam not found:", examId);
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching exam:", error);
      return null;
    }
  }

  /**
   * Get exam questions
   */
  async getExamQuestions(examId) {
    try {
      console.log("🔄 Fetching questions for exam:", examId);
      
      const questionsRef = collection(db, "exams", examId, "questions");
      const q = query(questionsRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      
      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        questionId: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Loaded ${questions.length} questions for exam ${examId}`);
      return questions;
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
      return [];
    }
  }

  /**
   * Get exams by category
   */
  async getExamsByCategory(category) {
    try {
      console.log("🔄 Fetching exams for category:", category);
      
      const examsRef = collection(db, "exams");
      const q = query(
        examsRef,
        where("category", "==", category),
        where("isPublished", "==", true)
      );
      const snapshot = await getDocs(q);
      
      const exams = snapshot.docs.map(doc => ({
        id: doc.id,
        examId: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Found ${exams.length} exams in category: ${category}`);
      return exams;
    } catch (error) {
      console.error("❌ Error fetching exams by category:", error);
      return [];
    }
  }

  /**
   * Get exams by difficulty
   */
  async getExamsByDifficulty(difficulty) {
    try {
      console.log("🔄 Fetching exams with difficulty:", difficulty);
      
      const examsRef = collection(db, "exams");
      const q = query(
        examsRef,
        where("difficulty", "==", difficulty),
        where("isPublished", "==", true)
      );
      const snapshot = await getDocs(q);
      
      const exams = snapshot.docs.map(doc => ({
        id: doc.id,
        examId: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Found ${exams.length} exams with difficulty: ${difficulty}`);
      return exams;
    } catch (error) {
      console.error("❌ Error fetching exams by difficulty:", error);
      return [];
    }
  }

  /**
   * Get featured exams (top viewed)
   */
  async getFeaturedExams(limit_count = 6) {
    try {
      console.log("🔄 Fetching featured exams");
      
      const examsRef = collection(db, "exams");
      const q = query(
        examsRef,
        where("isPublished", "==", true),
        orderBy("metadata.totalAttempts", "desc"),
        limit(limit_count)
      );
      const snapshot = await getDocs(q);
      
      const exams = snapshot.docs.map(doc => ({
        id: doc.id,
        examId: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Loaded ${exams.length} featured exams`);
      return exams;
    } catch (error) {
      console.error("❌ Error fetching featured exams:", error);
      return [];
    }
  }

  /**
   * Search exams by title or description
   */
  async searchExams(searchTerm) {
    try {
      console.log("🔄 Searching exams:", searchTerm);
      
      const allExams = await this.getAllExams();
      const term = searchTerm.toLowerCase();
      
      const results = allExams.filter(exam => 
        exam.title.toLowerCase().includes(term) ||
        exam.description.toLowerCase().includes(term) ||
        exam.tags?.some(tag => tag.toLowerCase().includes(term))
      );
      
      console.log(`✅ Found ${results.length} matching exams`);
      return results;
    } catch (error) {
      console.error("❌ Error searching exams:", error);
      return [];
    }
  }

  /**
   * Get exam statistics
   */
  async getExamStats(examId) {
    try {
      const exam = await this.getExamById(examId);
      
      if (!exam) return null;
      
      return {
        title: exam.title,
        totalAttempts: exam.metadata.totalAttempts || 0,
        avgScore: exam.metadata.avgScore || 0,
        totalQuestions: exam.metadata.totalQuestions || 0,
        difficulty: exam.difficulty,
        duration: exam.duration
      };
    } catch (error) {
      console.error("❌ Error getting exam stats:", error);
      return null;
    }
  }

  /**
   * Filter exams
   */
  filterExams(exams, filters = {}) {
    let filtered = [...exams];

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(e => e.difficulty === filters.difficulty);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    // Filter by duration
    if (filters.maxDuration) {
      filtered = filtered.filter(e => e.duration <= filters.maxDuration);
    }

    // Sort by field
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (filters.sortBy === 'difficulty') {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        } else if (filters.sortBy === 'duration') {
          return a.duration - b.duration;
        }
        return 0;
      });
    }

    return filtered;
  }

  /**
   * Get total exam count
   */
  async getExamCount() {
    const exams = await this.getAllExams();
    return exams.length;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.examsCache = [];
    this.lastCacheTime = 0;
    console.log("🗑️ Exams cache cleared");
  }
}

// Export singleton instance
export const firebaseExamService = new FirebaseExamService();
