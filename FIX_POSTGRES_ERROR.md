# Fix PostgreSQL Container Startup Error

## Problem
PostgreSQL container (`saas_postgres`) is failing to start with exit code 1.

## Solution

### Quick Fix (Recommended)

Run the fix script I created:

```bash
cd /Users/zinwaishine/Desktop/saas_management
bash fix_docker_postgres.sh
```

This script will:
1. Stop all containers and remove volumes
2. Clean up orphaned containers
3. Start PostgreSQL with fresh volumes
4. Check status and show logs

### Manual Fix Steps

If the script doesn't work, try these steps manually:

#### Step 1: Stop and Remove Everything
```bash
cd /Users/zinwaishine/Desktop/saas_management
docker compose down -v
```

#### Step 2: Remove the Postgres Volume
```bash
docker volume rm saas_management_postgres_data
```

#### Step 3: Check for Port Conflict
```bash
# Check if port 5433 is in use
lsof -ti:5433

# If something is using it, kill it
lsof -ti:5433 | xargs kill -9
```

#### Step 4: Start PostgreSQL Only
```bash
docker compose up -d postgres
```

#### Step 5: Check Logs
```bash
docker compose logs postgres
```

#### Step 6: If Postgres is Healthy, Start All Services
```bash
docker compose up -d
```

## Common Causes

1. **Corrupted Volume Data**: Old volume might have corrupted data
   - **Fix**: Remove volume and recreate (script does this)

2. **Port Already in Use**: Port 5433 might be occupied
   - **Fix**: Kill the process using port 5433

3. **Permission Issues**: Docker volume permissions
   - **Fix**: Remove volume and let Docker recreate with correct permissions

4. **Docker Desktop Not Ready**: Docker Desktop might not be fully started
   - **Fix**: Wait a few seconds after starting Docker Desktop, then try again

## What I Fixed

1. ✅ Updated `docker-compose.yml` with better healthcheck settings
   - Increased retries from 5 to 10
   - Added 30 second start period
   - Added restart policy

2. ✅ Created `fix_docker_postgres.sh` script for automated fix

3. ✅ Updated backend Dockerfile to include migrations and uploads folders

## After Fixing

Once PostgreSQL is running, verify everything works:

```bash
# Check all containers are running
docker compose ps

# View logs
docker compose logs -f

# Test database connection (optional)
docker compose exec postgres psql -U postgres -d sass_management -c "SELECT version();"
```

## Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Gallery: http://localhost:5173/gallery

