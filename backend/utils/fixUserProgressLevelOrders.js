import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress.js';
import Curriculum from '../models/Curriculum.js';

/**
 * Utility function to fix UserProgress records that have levelOrder: 0
 * This will look up the correct levelOrder from the Curriculum collection
 */
export const fixUserProgressLevelOrders = async () => {
  console.log('🔧 Starting UserProgress levelOrder fix...');
  
  try {
    // Find all UserProgress records with levels that have levelOrder: 0
    const progressRecords = await UserProgress.find({
      'completedLevels.levelOrder': 0
    });

    console.log(`Found ${progressRecords.length} UserProgress records with levelOrder: 0`);

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
              console.log(`Fixing levelOrder for user ${progress.user}: levelId ${level.levelId} -> order ${curriculumItem.order}`);
              level.levelOrder = curriculumItem.order;
              modified = true;
            } else {
              console.log(`⚠️ Could not find curriculum item for levelId: ${level.levelId}`);
            }
          }
        }
        
        if (modified) {
          // Sort completedLevels by order for consistent access
          progress.completedLevels.sort((a, b) => a.levelOrder - b.levelOrder);
          await progress.save();
          fixedCount++;
          console.log(`✅ Fixed UserProgress for user: ${progress.user}`);
        }
        
      } catch (error) {
        console.error(`❌ Error fixing UserProgress for user ${progress.user}:`, error);
        errorCount++;
      }
    }

    console.log(`🎉 UserProgress levelOrder fix complete:`);
    console.log(`   Fixed: ${fixedCount} records`);
    console.log(`   Errors: ${errorCount} records`);
    console.log(`   Total processed: ${progressRecords.length} records`);
    
    return { fixedCount, errorCount, totalProcessed: progressRecords.length };
    
  } catch (error) {
    console.error('❌ Error in fixUserProgressLevelOrders:', error);
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
    
    console.log(`📊 UserProgress levelOrder status:`);
    console.log(`   Total UserProgress records: ${totalRecords}`);
    console.log(`   Records needing fix: ${recordsNeedingFix}`);
    console.log(`   Records already fixed: ${totalRecords - recordsNeedingFix}`);
    
    return {
      total: totalRecords,
      needingFix: recordsNeedingFix,
      alreadyFixed: totalRecords - recordsNeedingFix
    };
    
  } catch (error) {
    console.error('❌ Error in checkUserProgressLevelOrders:', error);
    throw error;
  }
};

export default { fixUserProgressLevelOrders, checkUserProgressLevelOrders };
