import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress.js';
import Curriculum from '../models/Curriculum.js';

/**
 * Utility function to fix UserProgress records that have levelOrder: 0
 * This will look up the correct levelOrder from the Curriculum collection
 */
export const fixUserProgressLevelOrders = async () => {
  
  try {
    // Find all UserProgress records with levels that have levelOrder: 0
    const progressRecords = await UserProgress.find({
      'completedLevels.levelOrder': 0
    });


    let fixedCount = 0;
    let errorCount = 0;

    for (const progress of progressRecords) {
      try {
        let modified = false;
        
        for (const level of progress.completedLevels) {
          if (level.levelOrder === 0 || !level.levelOrder) {
            // Look up the correct levelOrder from curriculum
            const curriculumItem = await Curriculum.findById(level.levelId);
            
            if (curriculumItem && curriculumItem.order) {
              level.levelOrder = curriculumItem.order;
              modified = true;
            } else {
            }
          }
        }
        
        if (modified) {
          // Sort completedLevels by order for consistent access
          progress.completedLevels.sort((a, b) => a.levelOrder - b.levelOrder);
          await progress.save();
          fixedCount++;
        }
        
      } catch (error) {
        errorCount++;
      }
    }

    
    return { fixedCount, errorCount, totalProcessed: progressRecords.length };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Function to check for UserProgress records that need fixing
 */
export const checkUserProgressLevelOrders = async () => {
  try {
    const recordsNeedingFix = await UserProgress.countDocuments({
      'completedLevels.levelOrder': 0
    });
    
    const totalRecords = await UserProgress.countDocuments({});
    
    
    return {
      total: totalRecords,
      needingFix: recordsNeedingFix,
      alreadyFixed: totalRecords - recordsNeedingFix
    };
    
  } catch (error) {
    throw error;
  }
};

export default { fixUserProgressLevelOrders, checkUserProgressLevelOrders };
