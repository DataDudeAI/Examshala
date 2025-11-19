// firebase-leaderboard-service.js
// Firebase Leaderboard Service for ExamPro Elite

import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  query, 
  orderBy,
  limit,
  startAfter
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { db } from './firebase-config.js';

/**
 * Firebase Leaderboard Service
 * Handles global rankings and user achievements
 */
class FirebaseLeaderboardService {
  constructor() {
    this.leaderboardCache = [];
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes
    this.lastCacheTime = 0;
  }

  /**
   * Get global leaderboard (paginated)
   */
  async getGlobalLeaderboard(pageSize = 50, pageNumber = 1, forceRefresh = false) {
    try {
      console.log("🔄 Fetching global leaderboard, page:", pageNumber);

      // Check cache
      if (!forceRefresh && this.leaderboardCache.length > 0 && 
          Date.now() - this.lastCacheTime < this.cacheExpiry && 
          pageNumber === 1) {
        console.log("📦 Using cached leaderboard");
        return this.leaderboardCache;
      }

      const leaderboardRef = collection(db, "leaderboard");
      const q = query(
        leaderboardRef,
        orderBy("totalScore", "desc"),
        limit(pageSize * pageNumber)
      );

      const snapshot = await getDocs(q);
      let leaderboard = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));

      // Pagination
      if (pageNumber > 1) {
        const startIndex = (pageNumber - 1) * pageSize;
        leaderboard = leaderboard.slice(startIndex, startIndex + pageSize);
        
        // Adjust ranks
        leaderboard = leaderboard.map((item, index) => ({
          ...item,
          rank: startIndex + index + 1
        }));
      }

      // Cache first page
      if (pageNumber === 1) {
        this.leaderboardCache = leaderboard;
        this.lastCacheTime = Date.now();
      }

      console.log(`✅ Loaded leaderboard page ${pageNumber}`);
      return leaderboard;
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
      return [];
    }
  }

  /**
   * Get top users (shortcut for top 10)
   */
  async getTopUsers(limit_count = 10) {
    try {
      console.log("🔄 Fetching top users");

      const leaderboardRef = collection(db, "leaderboard");
      const q = query(
        leaderboardRef,
        orderBy("totalScore", "desc"),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));

      console.log(`✅ Loaded top ${users.length} users`);
      return users;
    } catch (error) {
      console.error("❌ Error fetching top users:", error);
      return [];
    }
  }

  /**
   * Get user rank
   */
  async getUserRank(userId) {
    try {
      console.log("🔄 Fetching user rank:", userId);

      const userRef = doc(db, "leaderboard", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("✅ User rank found:", userData.globalRank);
        return {
          id: userDoc.id,
          ...userData
        };
      } else {
        console.warn("⚠️ User rank not found:", userId);
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching user rank:", error);
      return null;
    }
  }

  /**
   * Get leaderboard by category
   */
  async getCategoryLeaderboard(category, limit_count = 50) {
    try {
      console.log("🔄 Fetching leaderboard for category:", category);

      // For now, we'll filter from global leaderboard
      // In production, you'd want a separate collection per category
      const leaderboard = await this.getGlobalLeaderboard(limit_count, 1, true);
      
      // Filter by category rank (from categoryRanks)
      const filtered = leaderboard.filter(user => {
        return user.categoryRanks && user.categoryRanks[category];
      }).sort((a, b) => {
        return a.categoryRanks[category] - b.categoryRanks[category];
      });

      console.log(`✅ Loaded ${filtered.length} users in ${category} category`);
      return filtered;
    } catch (error) {
      console.error("❌ Error fetching category leaderboard:", error);
      return [];
    }
  }

  /**
   * Get nearby users (users around your rank)
   */
  async getNearbyUsers(userId, range = 5) {
    try {
      console.log("🔄 Fetching nearby users for:", userId);

      const userRank = await this.getUserRank(userId);
      if (!userRank) return [];

      const currentRank = userRank.globalRank;
      const leaderboard = await this.getGlobalLeaderboard(1000, 1, true);

      const nearby = leaderboard.filter(user => {
        return Math.abs(user.rank - currentRank) <= range;
      });

      console.log(`✅ Found ${nearby.length} nearby users`);
      return nearby;
    } catch (error) {
      console.error("❌ Error fetching nearby users:", error);
      return [];
    }
  }

  /**
   * Get trending users (recently active)
   */
  async getTrendingUsers(limit_count = 10) {
    try {
      console.log("🔄 Fetching trending users");

      const leaderboardRef = collection(db, "leaderboard");
      const q = query(
        leaderboardRef,
        orderBy("updatedAt", "desc"),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Loaded ${users.length} trending users`);
      return users;
    } catch (error) {
      console.error("❌ Error fetching trending users:", error);
      return [];
    }
  }

  /**
   * Check if user has badge
   */
  async checkBadges(userId) {
    try {
      const userRank = await this.getUserRank(userId);
      if (!userRank) return [];

      const badges = userRank.badges || [];
      
      // Award new badges based on achievements
      const newBadges = [];

      if (userRank.totalExams >= 1 && !badges.includes('first-exam')) {
        newBadges.push('first-exam');
      }
      if (userRank.totalExams >= 10 && !badges.includes('exam-master')) {
        newBadges.push('exam-master');
      }
      if (userRank.avgScore >= 90 && !badges.includes('perfect-scorer')) {
        newBadges.push('perfect-scorer');
      }
      if (userRank.globalRank <= 100 && !badges.includes('elite')) {
        newBadges.push('elite');
      }

      return {
        current: badges,
        new: newBadges
      };
    } catch (error) {
      console.error("❌ Error checking badges:", error);
      return { current: [], new: [] };
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats() {
    try {
      console.log("🔄 Fetching leaderboard statistics");

      const leaderboard = await this.getGlobalLeaderboard(1000, 1, true);

      if (leaderboard.length === 0) {
        return {
          totalUsers: 0,
          avgScore: 0,
          topScore: 0,
          avgExams: 0
        };
      }

      const totalUsers = leaderboard.length;
      const avgScore = Math.round(
        leaderboard.reduce((sum, u) => sum + (u.avgScore || 0), 0) / totalUsers
      );
      const topScore = leaderboard[0]?.totalScore || 0;
      const avgExams = Math.round(
        leaderboard.reduce((sum, u) => sum + (u.totalExams || 0), 0) / totalUsers
      );

      console.log("✅ Leaderboard stats calculated");
      return {
        totalUsers,
        avgScore,
        topScore,
        avgExams
      };
    } catch (error) {
      console.error("❌ Error calculating stats:", error);
      return {};
    }
  }

  /**
   * Format leaderboard for display
   */
  formatLeaderboardRow(user, index) {
    return {
      rank: index + 1,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`,
      displayName: user.displayName,
      score: user.totalScore,
      exams: user.totalExams,
      avgScore: user.avgScore || 0,
      badges: user.badges || []
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.leaderboardCache = [];
    this.lastCacheTime = 0;
    console.log("🗑️ Leaderboard cache cleared");
  }
}

// Export singleton instance
export const firebaseLeaderboardService = new FirebaseLeaderboardService();
