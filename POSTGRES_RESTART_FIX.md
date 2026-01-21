# Fix PostgreSQL Restart Loop

## Problem
PostgreSQL container (`saas_postgres`) is restarting continuously with exit code 1.

## Quick Fix

Run this script:
```bash
cd /Users/zinwaishine/Desktop/saas_management
bash fix_postgres_restart.sh
```

## What I Fixed

1. ✅ **Removed obsolete `version` field** from `docker-compose.yml` (this was causing the warning)
2. ✅ **Created fix script** that will:
   - Show PostgreSQL error logs
   - Remove corrupted volume
   - Check for port conflicts
   - Restart PostgreSQL with fresh volume
   - Start all services if PostgreSQL is healthy

## Manual Steps (if script doesn't work)

### Step 1: Check the actual error
```bash
docker compose logs postgres
```

### Step 2: Stop and remove everything
```bash
docker compose down
docker volume rm saas_management_postgres_data
```

### Step 3: Check port conflict
```bash
lsof -ti:5433
# If something is using it:
lsof -ti:5433 | xargs kill -9
```

### Step 4: Start PostgreSQL only
```bash
docker compose up -d postgres
```

### Step 5: Watch logs in real-time
```bash
docker compose logs -f postgres
```

## Common Causes & Solutions

### 1. Corrupted Volume Data
**Symptom**: Container starts then immediately exits
**Fix**: Remove volume (script does this)
```bash
docker volume rm saas_management_postgres_data
```

### 2. Permission Issues
**Symptom**: Permission denied errors in logs
**Fix**: Remove volume and let Docker recreate with correct permissions

### 3. Port Already in Use
**Symptom**: Bind address already in use
**Fix**: Kill process using port 5433
```bash
lsof -ti:5433 | xargs kill -9
```

### 4. Insufficient Docker Resources
**Symptom**: Container starts but crashes
**Fix**: Increase Docker Desktop resources (Settings > Resources > Advanced)

### 5. Database Name Issue
**Symptom**: Database creation fails
**Fix**: Check if database name `sass_management` has any issues (it's correct in config)

## After Fixing

Once PostgreSQL shows as "healthy" or "Up", start all services:

```bash
docker compose up -d
```

Check status:
```bash
docker compose ps
```

## Expected Output

After running the fix script, you should see:
```
saas_postgres   postgres:18-alpine   ...   Up (healthy)   5433->5432/tcp
```

If you see "Restarting" or "Exited", check the logs for the specific error.

