# MongoDB to Supabase Migration Guide

## Overview
This guide will help you migrate your InTrack application from MongoDB to Supabase.

## Prerequisites
1. A Supabase account (free tier available)
2. Node.js and npm installed
3. Your existing MongoDB application

## Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `intrack-db`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
6. Click "Create new project"

### 1.2 Get Project Credentials
1. Go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service Role (secret) key

## Step 2: Set Up Environment Variables

Create a `.env` file in your backend directory:

```env
# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Other configurations remain the same
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
PORT=5000
# ... other variables
```

## Step 3: Create Database Schema

### 3.1 Run SQL Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL commands
4. Verify tables are created in Table Editor

### 3.2 Verify Tables
You should see these tables:
- `users`
- `industrial_visits`
- `attendance`
- `feedback`

## Step 4: Test Connection

### 4.1 Start Your Backend
```bash
cd backend
npm start
```

### 4.2 Check Logs
Look for:
```
✅ Supabase Connected Successfully
```

## Step 5: Update Frontend (if needed)

If your frontend makes direct database calls, update them to use the new API endpoints.

## Step 6: Data Migration (Optional)

### 6.1 Export MongoDB Data
```bash
# Export collections
mongoexport --db intrack --collection users --out users.json
mongoexport --db intrack --collection industrial_visits --out visits.json
mongoexport --db intrack --collection attendance --out attendance.json
mongoexport --db intrack --collection feedback --out feedback.json
```

### 6.2 Transform and Import to Supabase
1. Convert JSON files to CSV format
2. Use Supabase Table Editor to import CSV files
3. Or write a migration script using the Supabase client

## Step 7: Verify Functionality

### 7.1 Test API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile

### 7.2 Test Database Operations
- Create users
- Create industrial visits
- Mark attendance
- Submit feedback

## Troubleshooting

### Common Issues

#### 1. Connection Failed
- Check environment variables
- Verify Supabase project is active
- Check network connectivity

#### 2. Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure RLS policies are correct

#### 3. Permission Denied
- Check Row Level Security policies
- Verify user roles and permissions
- Check table access policies

### Debug Commands

```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
supabase.from('users').select('count').then(console.log).catch(console.error);
"
```

## Performance Considerations

### 1. Indexes
- All necessary indexes are created in the schema
- Monitor query performance in Supabase Dashboard

### 2. Connection Pooling
- Supabase handles connection pooling automatically
- No additional configuration needed

### 3. Caching
- Consider implementing Redis for session caching
- Use Supabase's built-in caching where possible

## Security Best Practices

### 1. Row Level Security
- RLS is enabled by default
- Policies restrict access based on user roles
- Test all policies thoroughly

### 2. API Keys
- Never expose service role key in frontend
- Use anon key for public operations
- Rotate keys regularly

### 3. JWT Tokens
- Set appropriate expiration times
- Validate tokens on all protected routes
- Implement token refresh mechanism

## Monitoring and Maintenance

### 1. Supabase Dashboard
- Monitor database performance
- Check API usage and limits
- Review error logs

### 2. Application Logs
- Monitor your application logs
- Set up alerts for connection failures
- Track API response times

## Rollback Plan

If you need to rollback to MongoDB:

1. Keep your old MongoDB models
2. Maintain the old database connection
3. Use feature flags to switch between databases
4. Keep backup of MongoDB data

## Support

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Supabase Community: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- InTrack Issues: Create an issue in your project repository

## Next Steps

After successful migration:

1. Remove old MongoDB code
2. Update documentation
3. Train team on Supabase
4. Set up monitoring and alerts
5. Plan for scaling and optimization
