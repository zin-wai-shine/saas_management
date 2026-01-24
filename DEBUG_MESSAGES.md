# Debugging Messages Error - Step by Step Guide

## Issue
Frontend shows "Failed to load conversations" error

## Step 1: Check Browser Console
1. Open your browser
2. Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools
3. Go to the **Console** tab
4. Look for error messages that start with "Failed to fetch conversations"
5. Check what the actual error message says - it should show:
   - Error status code (e.g., 500, 404, 401)
   - Error message
   - Full error details

## Step 2: Restart Backend Server

### If running with Docker:
```bash
cd /Users/zinwaishine/Desktop/saas_management
docker compose restart backend
# Or rebuild and restart:
docker compose up -d --build backend
```

### If running directly with Go:
```bash
# Stop the current backend (Ctrl+C if running in terminal)
# Then restart:
cd /Users/zinwaishine/Desktop/saas_management/backend
go run main.go
```

## Step 3: Check Backend Logs

### Docker:
```bash
docker compose logs -f backend | grep -i error
```

### Direct Go:
Check the terminal where you're running `go run main.go`

Look for errors like:
- Database connection errors
- SQL syntax errors
- "Error fetching conversations"
- Any other error messages

## Step 4: Verify Database Connection

```bash
# Test database connection
psql -h localhost -p 5433 -U postgres -d sass_management -c "SELECT COUNT(*) FROM conversations;"
psql -h localhost -p 5433 -U postgres -d sass_management -c "SELECT COUNT(*) FROM messages;"
```

## Step 5: Test API Endpoint Directly

Replace `YOUR_TOKEN` with your actual JWT token from localStorage:

```bash
# Get your token from browser console:
# localStorage.getItem('token')

# Then test:
curl -X GET http://localhost:8080/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

## Step 6: Common Errors and Solutions

### Error: "Unauthorized" or 401
- **Cause**: Token expired or invalid
- **Solution**: Log out and log back in to get a new token

### Error: "Failed to fetch conversations" with 500
- **Cause**: Backend database error or SQL error
- **Solution**: 
  1. Check backend logs for the actual SQL error
  2. Verify database tables exist: `conversations` and `messages`
  3. Restart backend

### Error: Network Error or CORS
- **Cause**: Backend not running or CORS misconfiguration
- **Solution**: 
  1. Verify backend is running on port 8080
  2. Check backend logs for CORS errors

### Error: "conversations table does not exist"
- **Cause**: Database migrations not run
- **Solution**: 
  ```bash
  cd backend
  go run cmd/migrate/main.go
  ```

## Step 7: Verify Tables Exist

```sql
-- Connect to database
psql -h localhost -p 5433 -U postgres -d sass_management

-- Check if tables exist
\dt conversations
\dt messages

-- Check data
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
```

## Step 8: Clear Browser Cache

1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or clear localStorage:
   ```javascript
   localStorage.clear()
   ```

## Still Having Issues?

1. **Share the exact error message** from browser console
2. **Share backend logs** showing the error
3. **Check if you're logged in** - verify token exists:
   ```javascript
   localStorage.getItem('token')
   ```










