import UserProgress from '../models/UserProgress.js';
import Attendance from '../models/Attendance.js';
import Curriculum from '../models/Curriculum.js';

/**
 * Unified Leaderboard Service
 * Provides consistent scoring algorithms across all parts of the system
 */
class LeaderboardService {
  
  /**
   * Calculate comprehensive leaderboard score for a student
   * @param {string} userId - Student ID
   * @param {string} careerTrack - Career track
   * @returns {Object} Score breakdown and total
   */
  static async calculateStudentScore(userId, careerTrack) {
    try {
      // Get student progress
      const progress = await UserProgress.findOne({ user: userId, careerTrack });
      if (!progress) {
        return {
          totalScore: 0,
          breakdown: {
            progressScore: 0,
            attendanceScore: 0,
            consistencyScore: 0,
            timeScore: 0
          },
          rank: null
        };
      }

      // Get total levels for this career track
      const totalLevels = await Curriculum.countDocuments({ 
        careerTrack, 
        type: 'syllabus' 
      }) || 10; // Fallback to 10 if no curriculum found

      // Calculate progress score (40% weight)
      let progressScore = 0;
      if (progress.completedLevels && progress.completedLevels.length > 0) {
        progressScore = Math.round((progress.completedLevels.length / totalLevels) * 100);
      } else if (progress.currentLevel && progress.currentLevel > 1) {
        progressScore = Math.round(((progress.currentLevel - 1) / totalLevels) * 100);
      }

      // Calculate attendance score (25% weight)
      let attendanceScore = 0;
      if (progress.attendanceStats?.presentDays && progress.attendanceStats?.totalDays) {
        attendanceScore = Math.round((progress.attendanceStats.presentDays / progress.attendanceStats.totalDays) * 100);
      }

      // Calculate consistency/streak score (20% weight)
      let consistencyScore = 0;
      if (progress.attendanceStats?.currentStreak >= 2) {
        consistencyScore = Math.min(100, progress.attendanceStats.currentStreak * 25);
      } else if (progress.attendanceStats?.longestStreak >= 2) {
        consistencyScore = Math.min(100, progress.attendanceStats.longestStreak * 20);
      }

      // Calculate time engagement score (15% weight)
      let timeScore = 0;
      const totalTimeSpent = (progress.attendanceStats?.totalLearningTime || 0) + 
                            (progress.attendanceStats?.totalTestTime || 0) + 
                            (progress.attendanceStats?.totalExerciseTime || 0);
      
      // Convert to hours and score based on engagement
      const totalHours = totalTimeSpent / 3600; // Convert seconds to hours
      if (totalHours >= 50) {
        timeScore = 100; // 50+ hours = 100%
      } else if (totalHours >= 25) {
        timeScore = 75; // 25+ hours = 75%
      } else if (totalHours >= 10) {
        timeScore = 50; // 10+ hours = 50%
      } else if (totalHours >= 5) {
        timeScore = 25; // 5+ hours = 25%
      }

      // Calculate weighted total score
      const totalScore = Math.round(
        (progressScore * 0.4) + 
        (attendanceScore * 0.25) + 
        (consistencyScore * 0.20) + 
        (timeScore * 0.15)
      );

      return {
        totalScore,
        breakdown: {
          progressScore,
          attendanceScore,
          consistencyScore,
          timeScore
        },
        rank: null
      };
    } catch (error) {
      console.error('LeaderboardService - Error calculating student score:', error);
      return {
        totalScore: 0,
        breakdown: {
          progressScore: 0,
          attendanceScore: 0,
          consistencyScore: 0,
          timeScore: 0
        },
        rank: null
      };
    }
  }

  /**
   * Get leaderboard for a specific career track
   * @param {string} careerTrack - Career track
   * @param {number} limit - Number of students to return
   * @returns {Array} Sorted leaderboard with scores and ranks
   */
  static async getLeaderboard(careerTrack, limit = 50) {
    try {
      // Get all students in the track
      const students = await UserProgress.find({ careerTrack })
        .populate('user', 'name email')
        .limit(limit);

      if (!students || students.length === 0) {
        return [];
      }

      // Calculate scores for all students
      const studentScores = await Promise.all(
        students.map(async (student) => {
          const scoreData = await this.calculateStudentScore(student.user._id, careerTrack);
          return {
            userId: student.user._id,
            name: student.user.name,
            email: student.user.email,
            ...scoreData
          };
        })
      );

      // Sort by total score (descending)
      studentScores.sort((a, b) => b.totalScore - a.totalScore);

      // Add ranks
      studentScores.forEach((student, index) => {
        student.rank = index + 1;
      });

      return studentScores;
    } catch (error) {
      console.error('LeaderboardService - Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get student's rank in their career track
   * @param {string} userId - Student ID
   * @param {string} careerTrack - Career track
   * @returns {number} Student's rank (1-based)
   */
  static async getStudentRank(userId, careerTrack) {
    try {
      const leaderboard = await this.getLeaderboard(careerTrack, 1000); // Get all students
      const studentEntry = leaderboard.find(student => student.userId.toString() === userId);
      return studentEntry ? studentEntry.rank : null;
    } catch (error) {
      console.error('LeaderboardService - Error getting student rank:', error);
      return null;
    }
  }

  /**
   * Update student's leaderboard score (for caching/performance)
   * @param {string} userId - Student ID
   * @param {string} careerTrack - Career track
   * @returns {Object} Updated score data
   */
  static async updateStudentScore(userId, careerTrack) {
    try {
      const scoreData = await this.calculateStudentScore(userId, careerTrack);
      const rank = await this.getStudentRank(userId, careerTrack);
      
      return {
        ...scoreData,
        rank
      };
    } catch (error) {
      console.error('LeaderboardService - Error updating student score:', error);
      return null;
    }
  }
}

export default LeaderboardService;
