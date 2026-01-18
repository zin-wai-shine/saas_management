# 🚀 Step-by-Step: Build Images and Run Containers

## Prerequisites Check

1. **Docker Desktop is installed** ✅ (I can see it in your screenshot)
2. **Docker Desktop is running** - Make sure the whale icon is in your menu bar
3. **Docker is accessible from terminal** - May need to restart terminal after installing

## Complete Process

### Step 1: Start Docker Desktop

1. Open **Docker Desktop** from Applications
2. Wait for it to fully start
3. Look for the whale icon 🐳 in your menu bar
4. Status should show "Docker Desktop is running"

### Step 2: Open Terminal

Open a new terminal window (or restart your current one) to ensure Docker commands are available.

### Step 3: Navigate to Project

```bash
cd ~/Desktop/saas_management
```

### Step 4: Build Images

This creates the Docker images (templates) for your application:

```bash
docker compose build
```

**What this does:**
- **Backend Image**: 
  - Uses `golang:1.21-alpine` base image
  - Downloads Go dependencies
  - Compiles your Go code into a binary
  - Creates lightweight image with just the binary

- **Frontend Image**:
  - Uses `node:20-alpine` base image
  - Installs npm packages (React, Tailwind, etc.)
  - Sets up Vite dev server
  - Creates image with all dependencies

- **PostgreSQL Image**:
  - Downloads official `postgres:15-alpine` image
  - No build needed (pre-built image)

**Expected output:**
```
[+] Building backend...
[+] Building frontend...
[+] Pulling postgres...
```

**Time:** 2-5 minutes (first time, faster after)

### Step 5: Start Containers

This creates and runs containers from the images:

```bash
docker compose up -d
```

**What this does:**
1. Creates a Docker network for containers to communicate
2. Starts PostgreSQL container (database)
3. Waits for database to be healthy
4. Starts backend container (Go API server)
5. Starts frontend container (React dev server)

**Expected output:**
```
[+] Running 3/3
 ✔ Container saas_postgres   Started
 ✔ Container saas_backend    Started  
 ✔ Container saas_frontend   Started
```

### Step 6: Verify Everything is Running

```bash
# Check container status
docker compose ps
```

**Expected output:**
```
NAME              STATUS          PORTS
saas_postgres     Up (healthy)    0.0.0.0:5432->5432/tcp
saas_backend      Up              0.0.0.0:8080->8080/tcp
saas_frontend     Up              0.0.0.0:5173->5173/tcp
```

### Step 7: View Logs (Optional)

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Step 8: Access Your Application

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432

## Visual Flow

```
┌─────────────────────────────────────────┐
│  Step 1: Build Images                   │
│  docker compose build                   │
│                                         │
│  backend/Dockerfile  →  Backend Image  │
│  frontend/Dockerfile →  Frontend Image │
│  postgres:15-alpine  →  Postgres Image │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Step 2: Create Containers              │
│  docker compose up -d                   │
│                                         │
│  Backend Image  →  saas_backend         │
│  Frontend Image →  saas_frontend        │
│  Postgres Image →  saas_postgres        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Step 3: Running Containers            │
│                                         │
│  Frontend:  http://localhost:5173      │
│  Backend:   http://localhost:8080/api │
│  Database:  localhost:5432             │
└─────────────────────────────────────────┘
```

## Quick Commands Reference

```bash
# Build images
docker compose build

# Start containers
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Rebuild and restart
docker compose up -d --build

# Restart specific service
docker compose restart backend
```

## Troubleshooting

### "command not found: docker"
- Docker Desktop is not running
- Restart terminal after installing Docker
- Check Docker Desktop is started

### "Cannot connect to Docker daemon"
- Docker Desktop is not running
- Start Docker Desktop application

### Port already in use
- Stop the service using the port
- Or change ports in `docker-compose.yml`

### Build fails
- Check logs: `docker compose logs`
- Rebuild: `docker compose build --no-cache`

## What Happens Behind the Scenes

### Backend Container (Go)
1. Container starts
2. Runs `./main` (compiled Go binary)
3. Connects to PostgreSQL
4. Runs database migrations
5. Starts HTTP server on port 8080

### Frontend Container (React)
1. Container starts
2. Runs `npm run dev -- --host 0.0.0.0`
3. Vite dev server starts
4. Serves React app on port 5173
5. Hot-reload enabled for development

### PostgreSQL Container
1. Container starts
2. Initializes database with credentials
3. Creates `sass_management` database
4. Starts PostgreSQL server on port 5432

