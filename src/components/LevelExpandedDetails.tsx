import React from 'react';
import { motion } from 'framer-motion';

interface LevelExpandedDetailsProps {
  level: any;
  index: number;
  formatTimeSpent: (seconds: number) => string;
  formatDate: (dateString: string | null) => string;
}

const LevelExpandedDetails: React.FC<LevelExpandedDetailsProps> = ({
  level,
  index,
  formatTimeSpent,
  formatDate
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={{ backgroundColor: 'var(--color-tertiary-bg)' }}
      className="expanded-details"
    >
      <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {/* Learning Section Details */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                📚
              </div>
              Learning Materials
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              level.learn?.completed 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {level.learn?.completed ? '✅ Completed' : '⏳ In Progress'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {level.learn?.status || 'Not started'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Time Spent:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {level.learn?.timeSpent ? formatTimeSpent(level.learn.timeSpent) : '0h 0m'}
                </span>
              </div>
              {level.learn?.startTime && (
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(level.learn.startTime)}
                  </span>
                </div>
              )}
              {level.learn?.endTime && (
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(level.learn.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Section Details */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                📝
              </div>
              Assessment
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              level.test?.completed 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {level.test?.completed ? '✅ Completed' : '⏳ Not Attempted'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Score:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {level.test?.score || 0}/100
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Attempts:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {level.test?.attempts || 0}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {level.test?.status || 'Not started'}
                </span>
              </div>
              {level.test?.startTime && (
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(level.test.startTime)}
                  </span>
                </div>
              )}
              {level.test?.endTime && (
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                  <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(level.test.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Section Details */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            💻 Practice Exercise
            <span className={`px-2 py-1 rounded-full text-xs ${
              level.exercise?.completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {level.exercise?.completed ? 'Completed' : 'Not Started'}
            </span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
              <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                {level.exercise?.status || 'Not started'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Time Spent:</span>
              <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                {level.exercise?.timeSpent ? formatTimeSpent(level.exercise.timeSpent) : '0h 0m'}
              </span>
            </div>
            {level.exercise?.startTime && (
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Started:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {formatDate(level.exercise.startTime)}
                </span>
              </div>
            )}
            {level.exercise?.endTime && (
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                <span className="ml-2" style={{ color: 'var(--color-text-primary)' }}>
                  {formatDate(level.exercise.endTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Tasks */}
        {level.exercise && level.exercise.tasks && level.exercise.tasks.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              📋 Exercise Tasks
            </h4>
            <div className="space-y-3">
              {level.exercise.tasks.map((task: any, taskIndex: number) => (
                <div
                  key={task.id || `task-${index}-${taskIndex}`}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <div>
                    <h5 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {task.title || `Task ${taskIndex + 1}`}
                    </h5>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {task.description || task.content || 'Complete the assigned task'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.completed ? (
                      <span className="text-green-500">✅</span>
                    ) : (
                      <span className="text-gray-400">⏳</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Tasks Message */}
        {(!level.exercise || !level.exercise.tasks || level.exercise.tasks.length === 0) && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No specific tasks available for this level</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LevelExpandedDetails;
