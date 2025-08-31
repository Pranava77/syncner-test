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
    console.log('🔄 Step 1: Fetching student portfolio data...');
    try {
      const response = await apiService.getStudentPortfolio(studentId);
      const studentData = response.data.student;
      
      console.log('✅ Step 1 Complete - Portfolio data received:', {
        careerTrack: studentData.careerTrack,
        progressExists: !!studentData.progress,
        learningLevelsCount: studentData.learningLevels?.length || 0
      });
      
      return studentData;
    } catch (error) {
      console.error('❌ Step 1 Failed - Portfolio fetch error:', error);
      throw new Error('Failed to fetch student portfolio data');
    }
  }

  /**
   * Step 2: Fetch curriculum levels for the student's career track
   */
  static async fetchCurriculumLevels(careerTrack: string) {
    console.log('🔄 Step 2: Fetching curriculum levels for track:', careerTrack);
    try {
      const response = await apiService.getCurriculumLevels(careerTrack);
      const curriculumLevels = response.data;
      
      console.log('✅ Step 2 Complete - Curriculum levels received:', {
        track: careerTrack,
        levelsCount: curriculumLevels.length,
        levels: curriculumLevels.map((l: any) => ({ 
          order: l.order, 
          title: l.title 
        }))
      });
      
      return curriculumLevels;
    } catch (error) {
      console.error('❌ Step 2 Failed - Curriculum fetch error:', error);
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
    console.log('🔄 Step 3: Combining student progress with curriculum data...');
    
    const combinedTimeline: CombinedTimelineLevel[] = [];
    
    curriculumLevels.forEach((level) => {
      console.log(`🔍 Processing curriculum level ${level.order}: ${level.title}`);
      
      // Find student's progress for this level
      const levelProgress = studentData.learningLevels?.find(
        (l: any) => l.level === level.order
      );
      
      console.log(`📊 Level ${level.order} progress found:`, !!levelProgress);
      
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
    
    console.log('✅ Step 3 Complete - Combined timeline created:', {
      levelsCount: combinedTimeline.length,
      levels: combinedTimeline.map(l => ({ 
        order: l.levelOrder, 
        title: l.levelTitle, 
        status: l.overallStatus 
      }))
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
    console.log('🚀 Starting Two-API Timeline Generation Process...');
    
    try {
      // Step 1: Get student data
      const studentData = await this.fetchStudentPortfolio(studentId);
      
      if (!studentData.careerTrack) {
        console.warn('⚠️ Student has no career track, using fallback');
        return this.generateFallbackTimeline();
      }
      
      // Step 2: Get curriculum data
      const curriculumLevels = await this.fetchCurriculumLevels(studentData.careerTrack);
      
      if (!curriculumLevels || curriculumLevels.length === 0) {
        console.warn('⚠️ No curriculum levels found, using fallback');
        return this.generateFallbackTimeline();
      }
      
      // Step 3: Combine the data
      const combinedTimeline = this.combineData(studentData, curriculumLevels);
      
      console.log('🎉 Two-API Timeline Generation Complete!');
      return combinedTimeline;
      
    } catch (error) {
      console.error('❌ Timeline generation failed, using fallback:', error);
      return this.generateFallbackTimeline();
    }
  }

  /**
   * Fallback timeline generation when APIs fail
   */
  private static generateFallbackTimeline(): CombinedTimelineLevel[] {
    console.log('🔄 Generating fallback timeline...');
    
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
    
    console.log('✅ Fallback timeline generated with', fallbackLevels.length, 'levels');
    return fallbackLevels;
  }
}
