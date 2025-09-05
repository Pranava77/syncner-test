import apiService from './api';

export interface CurriculumLevel {
  id: string;
  title: string;
  description: string;
  order: number;
  careerTrack: string;
  learn: any[];
  test: any[];
  exercise: any[];
}

export interface CombinedTimelineLevel {
  levelOrder: number;
  levelTitle: string;
  levelDescription: string;
  overallStatus: 'not-started' | 'accessible' | 'in-progress' | 'completed';
  sections: {
    learn: {
      status: 'not-started' | 'in-progress' | 'completed';
      details: {
        startDate: string | null;
        endDate: string | null;
        timeSpent: number;
        isCompleted: boolean;
      };
      title: string;
    };
    test: {
      status: 'not-started' | 'in-progress' | 'completed';
      details: {
        startDate: string | null;
        endDate: string | null;
        score: number;
        attempts: number;
        isCompleted: boolean;
      };
      title: string;
    };
    exercise: {
      status: 'not-started' | 'in-progress' | 'completed';
      details: {
        startDate: string | null;
        endDate: string | null;
        timeSpent: number;
        isCompleted: boolean;
      };
      title: string;
    };
  };
}

export class StudentTimelineService {
  /**
   * Step 1: Fetch student portfolio data (contains progress and career track)
   */
  static async fetchStudentPortfolio(studentId: string) {
    try {
      const response = await apiService.getStudentPortfolio(studentId);
      const studentData = response.data.student;
      return studentData;
    } catch (error) {
      throw new Error('Failed to fetch student portfolio data');
    }
  }

  /**
   * Step 2: Fetch curriculum levels for the student's career track
   */
  static async fetchCurriculumLevels(careerTrack: string) {
    try {
      const response = await apiService.getCurriculumLevels(careerTrack);
      const curriculumLevels = response.data;
      
      
      return curriculumLevels;
    } catch (error) {
      throw new Error('Failed to fetch curriculum levels');
    }
  }

  /**
   * Step 3: Combine student progress with curriculum data
   */
  static combineData(
    studentData: any, 
    curriculumLevels: CurriculumLevel[]
  ): CombinedTimelineLevel[] {
    const combinedTimeline: CombinedTimelineLevel[] = [];
    
    curriculumLevels.forEach((level) => {
      // Find student's progress for this level
      const levelProgress = studentData.learningLevels?.find(
        (l: any) => l.level === level.order
      );
      
      // Determine section statuses and details
      const learnDetails = this.extractLearnDetails(levelProgress);
      const testDetails = this.extractTestDetails(levelProgress);
      const exerciseDetails = this.extractExerciseDetails(levelProgress);
      
      // Determine overall level status
      const overallStatus = this.determineOverallStatus(
        level.order, 
        learnDetails.isCompleted, 
        testDetails.isCompleted, 
        exerciseDetails.isCompleted
      );
      
      const timelineLevel: CombinedTimelineLevel = {
        levelOrder: level.order,
        levelTitle: level.title,
        levelDescription: level.description,
        overallStatus,
        sections: {
          learn: {
            status: learnDetails.isCompleted ? 'completed' : 'in-progress',
            details: learnDetails,
            title: 'Learn'
          },
          test: {
            status: testDetails.isCompleted ? 'completed' : 'in-progress',
            details: testDetails,
            title: 'Test'
          },
          exercise: {
            status: exerciseDetails.isCompleted ? 'completed' : 'in-progress',
            details: exerciseDetails,
            title: 'Exercise'
          }
        }
      };
      
      combinedTimeline.push(timelineLevel);
    });
    
    return combinedTimeline;
  }

  /**
   * Step 4: Extract learn section details from student progress
   */
  private static extractLearnDetails(levelProgress: any) {
    if (!levelProgress?.learn) {
      return {
        startDate: null,
        endDate: null,
        timeSpent: 0,
        isCompleted: false
      };
    }
    
    return {
      startDate: levelProgress.learn.startTime || null,
      endDate: levelProgress.learn.endTime || null,
      timeSpent: levelProgress.learn.timeSpent || 0,
      isCompleted: levelProgress.learn.completed || false
    };
  }

  /**
   * Step 5: Extract test section details from student progress
   */
  private static extractTestDetails(levelProgress: any) {
    if (!levelProgress?.test) {
      return {
        startDate: null,
        endDate: null,
        score: 0,
        attempts: 0,
        isCompleted: false
      };
    }
    
    return {
      startDate: levelProgress.test.startTime || null,
      endDate: levelProgress.test.endTime || null,
      score: levelProgress.test.score || 0,
      attempts: levelProgress.test.attempts || 0,
      isCompleted: levelProgress.test.completed || false
    };
  }

  /**
   * Step 6: Extract exercise section details from student progress
   */
  private static extractExerciseDetails(levelProgress: any) {
    if (!levelProgress?.exercise) {
      return {
        startDate: null,
        endDate: null,
        timeSpent: 0,
        isCompleted: false
      };
    }
    
    return {
      startDate: levelProgress.exercise.startTime || null,
      endDate: levelProgress.exercise.endTime || null,
      timeSpent: levelProgress.exercise.timeSpent || 0,
      isCompleted: levelProgress.exercise.completed || false
    };
  }

  /**
   * Step 7: Determine overall level status based on section completion
   */
  private static determineOverallStatus(
    levelOrder: number,
    learnCompleted: boolean,
    testCompleted: boolean,
    exerciseCompleted: boolean
  ): 'not-started' | 'accessible' | 'in-progress' | 'completed' {
    const completedSections = [learnCompleted, testCompleted, exerciseCompleted]
      .filter(Boolean).length;
    
    if (completedSections === 3) {
      return 'completed';
    } else if (completedSections > 0) {
      return 'in-progress';
    } else if (levelOrder === 1) {
      return 'accessible';
    } else {
      return 'not-started';
    }
  }

  /**
   * Main method: Orchestrate the entire two-API process
   */
  static async generateStudentTimeline(studentId: string): Promise<CombinedTimelineLevel[]> {
    try {
      // Step 1: Get student data
      const studentData = await this.fetchStudentPortfolio(studentId);
      
      if (!studentData.careerTrack) {
        return this.generateFallbackTimeline();
      }
      
      // Step 2: Get curriculum data
      const curriculumLevels = await this.fetchCurriculumLevels(studentData.careerTrack);
      
      if (!curriculumLevels || curriculumLevels.length === 0) {
        return this.generateFallbackTimeline();
      }
      
      // Step 3: Combine the data
      const combinedTimeline = this.combineData(studentData, curriculumLevels);
      
      return combinedTimeline;
      
    } catch (error) {
      return this.generateFallbackTimeline();
    }
  }

  /**
   * Fallback timeline generation when APIs fail
   */
  private static generateFallbackTimeline(): CombinedTimelineLevel[] {
    const fallbackLevels = [
      {
        levelOrder: 1,
        levelTitle: 'Introduction to Programming',
        levelDescription: 'Basic programming concepts and fundamentals',
        overallStatus: 'accessible' as const,
        sections: {
          learn: {
            status: 'not-started' as const,
            details: { startDate: null, endDate: null, timeSpent: 0, isCompleted: false },
            title: 'Learn'
          },
          test: {
            status: 'not-started' as const,
            details: { startDate: null, endDate: null, score: 0, attempts: 0, isCompleted: false },
            title: 'Test'
          },
          exercise: {
            status: 'not-started' as const,
            details: { startDate: null, endDate: null, timeSpent: 0, isCompleted: false },
            title: 'Exercise'
          }
        }
      },
      {
        levelOrder: 2,
        levelTitle: 'Core Concepts',
        levelDescription: 'Essential programming principles and practices',
        overallStatus: 'not-started' as const,
        sections: {
          learn: {
            status: 'not-started' as const,
            details: { startDate: null, endDate: null, timeSpent: 0, isCompleted: false },
            title: 'Learn'
          },
          test: {
            status: 'not-started' as const,
            details: { startDate: null, endDate: null, score: 0, attempts: 0, isCompleted: false },
            title: 'Test'
          },
          exercise: {
            status: 'not-started' as const,
            details: { startDate: null, endDate: null, timeSpent: 0, isCompleted: false },
            title: 'Exercise'
          }
        }
      }
    ];
    
    return fallbackLevels;
  }
}
