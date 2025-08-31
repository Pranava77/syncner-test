# Time Tracking Implementation

## Overview
This document explains the implementation of time tracking for learning, test, and exercise sections in the application. The system now properly tracks start time, end time, and time spent for each section.

## Problem Identified
The original system had the following issues:
1. **Missing Schema Fields**: The `UserProgress` model was missing `startTime`, `endTime`, and `timeSpent` fields for test and exercise sections
2. **Incomplete Data**: The portfolio API was returning `null` or `0` for time-related fields
3. **Frontend Mismatch**: The frontend expected time tracking data that wasn't being captured

## Solution Implemented

### 1. Enhanced UserProgress Schema
Added missing time tracking fields to the `backend/models/UserProgress.js`:

```javascript
// Learn section
learnProgress: {
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 }, // in seconds
  // ... existing fields
}

// Test section  
testProgress: {
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 }, // in seconds
  // ... existing fields
}

// Exercise section
exerciseSubmissions: [{
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 }, // in seconds
  // ... existing fields
}]
```

### 2. Enhanced Model Methods
Updated the following methods to handle time tracking:

- `updateLearnProgress(levelId, timeSpent, linksAccessed, startTime, endTime)`
- `submitTestAttempt(levelId, score, answers, startTime, endTime, timeSpent)`
- `submitExercise(levelId, exerciseTitle, links, startTime, endTime, timeSpent)`

### 3. New Time Tracking API
Created dedicated endpoints for time tracking operations:

#### Endpoints
- `POST /api/time-tracking/start` - Start tracking time for a section
- `POST /api/time-tracking/stop` - Stop tracking and calculate time spent
- `POST /api/time-tracking/pause` - Pause time tracking (future enhancement)

#### Request Format
```json
{
  "levelId": "level_id_string",
  "section": "learn|test|exercise"
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Time tracking started for learn section",
  "startTime": "2025-01-27T10:30:00.000Z"
}
```

### 4. Frontend Integration
Added time tracking methods to the API service:

```typescript
// src/services/api.ts
async startTimeTracking(levelId: string, section: 'learn' | 'test' | 'exercise')
async stopTimeTracking(levelId: string, section: 'learn' | 'test' | 'exercise')
async pauseTimeTracking(levelId: string, section: 'learn' | 'test' | 'exercise')
```

### 5. Custom Hook
Created `useTimeTracking` hook for easy integration:

```typescript
// src/hooks/useTimeTracking.ts
const {
  isTracking,
  startTime,
  currentSection,
  currentLevelId,
  startTracking,
  stopTracking,
  pauseTracking,
  getCurrentSessionDuration
} = useTimeTracking();
```

## Usage Examples

### Starting Time Tracking
```typescript
const { startTracking } = useTimeTracking();

const handleStartLearning = async (levelId: string) => {
  const result = await startTracking(levelId, 'learn');
  if (result.success) {
    console.log('Started tracking learning time');
  }
};
```

### Stopping Time Tracking
```typescript
const { stopTracking } = useTimeTracking();

const handleStopLearning = async () => {
  const result = await stopTracking();
  if (result.success) {
    console.log(`Time spent: ${result.timeSpent} seconds`);
  }
};
```

### Displaying Current Session Duration
```typescript
const { getCurrentSessionDuration } = useTimeTracking();

// In your component
const duration = getCurrentSessionDuration();
const minutes = Math.floor(duration / 60);
const seconds = duration % 60;

return <div>Session: {minutes}:{seconds.toString().padStart(2, '0')}</div>;
```

## Data Flow

1. **User starts a section** → Frontend calls `startTimeTracking()`
2. **Backend creates/updates** → Sets `startTime` in UserProgress
3. **User completes section** → Frontend calls `stopTimeTracking()`
4. **Backend calculates** → Sets `endTime` and calculates `timeSpent`
5. **Portfolio API** → Returns complete time tracking data
6. **Frontend displays** → Shows accurate time information

## Benefits

1. **Accurate Time Tracking**: Real-time tracking of user engagement
2. **Complete Data**: All time-related fields now properly populated
3. **Consistent API**: Unified time tracking across all sections
4. **Easy Integration**: Simple hook-based implementation
5. **Future Ready**: Extensible for pause/resume functionality

## Next Steps

1. **Frontend Integration**: Integrate time tracking into learning, test, and exercise components
2. **User Experience**: Add visual indicators for active tracking sessions
3. **Analytics**: Use time data for better progress insights
4. **Pause/Resume**: Implement pause functionality for better user control

## Testing

To test the implementation:

1. **Start a learning session**: Call `startTimeTracking(levelId, 'learn')`
2. **Complete some activity**: Navigate through learning content
3. **Stop tracking**: Call `stopTimeTracking()`
4. **Check portfolio**: Verify time data appears in student portfolio
5. **Verify frontend**: Ensure time data displays correctly

## Files Modified

- `backend/models/UserProgress.js` - Enhanced schema and methods
- `backend/controllers/portfolioController.js` - Fixed data mapping
- `backend/controllers/timeTrackingController.js` - New time tracking controller
- `backend/routes/timeTrackingRoutes.js` - New time tracking routes
- `backend/app.js` - Registered new routes
- `src/services/api.ts` - Added time tracking API methods
- `src/hooks/useTimeTracking.ts` - New custom hook for time tracking
