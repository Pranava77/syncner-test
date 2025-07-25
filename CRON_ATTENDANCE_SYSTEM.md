# Cron-Based Attendance System

## Overview

The attendance system uses automated cron jobs to mark absences automatically. This ensures that absences are marked every day without requiring manual action.

## How It Works

### Automatic Present Marking
- Students are automatically marked as "present" when they are active for at least 2 minutes in a day
- This happens through the `trackActivity` middleware in `backend/middleware/trackActivity.js`

### Automatic Absence Marking
- **Cron Job**: Runs daily at 1:00 AM UTC
- **Function**: Marks all students as "absent" for yesterday if they didn't log in
- **Location**: `backend/services/cronService.js`

## Cron Job Details

### Schedule
- **Time**: Every day at 1:00 AM UTC
- **Pattern**: `0 1 * * *`
- **Timezone**: UTC

### What It Does
1. Gets all students from the database
2. Checks if each student has an attendance record for yesterday
3. If no record exists, marks them as "absent"
4. Logs the results for monitoring

### Environment Behavior
- **Production**: Cron jobs are automatically started
- **Development**: Cron jobs are disabled (to avoid interference during development)

## Manual Testing

### Admin Endpoints (for testing)
- **POST** `/api/attendance/trigger-marking` - Manually trigger absence marking
- **GET** `/api/attendance/cron-status` - Check cron job status

## Monitoring

### Logs to Watch
- `[CRON SERVICE]` - Cron job operations
- `[ATTENDANCE DEBUG]` - Attendance marking operations
- `[ATTENDANCE ERROR]` - Error messages

### Example Logs
```
[CRON SERVICE] Initializing cron jobs...
[CRON SERVICE] Daily attendance marking scheduled for 1:00 AM UTC
[CRON SERVICE] Running daily attendance marking job...
[CRON SERVICE] Marking absences for date: 2024-01-14T00:00:00.000Z
[CRON SERVICE] Found 25 students
[CRON SERVICE] Marked absent for student John Doe on 2024-01-14T00:00:00.000Z
[CRON SERVICE] Attendance marking completed: 15 absences marked, 10 skipped
```

## Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' to enable cron jobs
- `MONGODB_URI`: Required for database operations
- `JWT_SECRET`: Required for authentication

### Timezone
- All operations use UTC timezone
- Cron job runs at 1:00 AM UTC
- Dates are normalized to UTC midnight

## Troubleshooting

### Common Issues

1. **Cron jobs not running**:
   - Check if `NODE_ENV` is set to 'production'
   - Verify server logs for cron initialization messages
   - Check if the server has proper timezone settings

2. **No absences being marked**:
   - Students might already have attendance records for the target date
   - Check if there are any students in the database
   - Verify the date calculation logic

3. **Performance issues**:
   - The system processes students one by one to avoid memory issues
   - For large student populations, consider optimizing the batch size

### Debug Commands
```bash
# Check cron status via API (admin only)
curl -X GET /api/attendance/cron-status

# Manually trigger attendance marking (admin only)
curl -X POST /api/attendance/trigger-marking

# Check server logs for cron messages
tail -f logs/server.log | grep "CRON SERVICE"
```

## Deployment Considerations

### Production Setup
1. Ensure `NODE_ENV=production` is set
2. Verify server timezone is set to UTC
3. Monitor logs for cron job execution
4. Set up log rotation for cron-related logs

### Backup Considerations
- Attendance data is critical - ensure regular backups
- Consider backing up before major attendance operations
- Monitor attendance data integrity

## Future Enhancements

Potential improvements:
1. **Multiple cron schedules**: Different schedules for different user types
2. **Email notifications**: Alert admins about attendance marking results
3. **Retry logic**: Automatic retry for failed attendance marking
4. **Metrics**: Track attendance marking performance and success rates
5. **Configuration**: Make cron schedule configurable via environment variables 