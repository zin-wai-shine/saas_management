# 🐳 Docker Process Explained

## Understanding Docker Concepts

### 1. **Dockerfile** → Creates **Image** → Runs **Container**

```
Dockerfile (instructions)
    ↓
docker build (creates)
    ↓
Image (template/blueprint)
    ↓
docker run (starts)
    ↓
Container (running instance)
```

## Our Project Structure

### Backend (Go)
- **Dockerfile**: `backend/Dockerfile`
- **Process**: 
  1. Uses `golang:1.21-alpine` as base image
  2. Downloads Go dependencies (`go mod download`)
  3. Builds the Go application (`go build`)
  4. Creates a lightweight image with just the binary
  5. Runs the binary when container starts

### Frontend (React)
- **Dockerfile**: `frontend/Dockerfile`
- **Process**:
  1. Uses `node:20-alpine` as base image
  2. Installs npm dependencies (`npm install`)
  3. Copies source code
  4. Runs Vite dev server when container starts

### Database (PostgreSQL)
- **No Dockerfile needed** - uses official `postgres:15-alpine` image
- **Process**:
  1. Downloads official PostgreSQL image
  2. Creates database with our credentials
  3. Runs PostgreSQL server

## Docker Compose Orchestration

`docker-compose.yml` manages all three services:

```yaml
services:
  postgres:    # Database service
  backend:     # Go API service  
  frontend:    # React UI service
```

**Benefits:**
- All services start together
- Automatic networking between containers
- Shared environment variables
- Dependency management (backend waits for database)

## Step-by-Step Process

### Step 1: Build Images
```bash
docker compose build
```

**What happens:**
- Reads `backend/Dockerfile` → Builds Go image
- Reads `frontend/Dockerfile` → Builds React image
- Downloads `postgres:15-alpine` image (if not cached)

**Result:** Three Docker images created

### Step 2: Create and Start Containers
```bash
docker compose up -d
```

**What happens:**
- Creates network for containers to communicate
- Creates PostgreSQL container → Starts database
- Waits for database to be healthy
- Creates backend container → Starts Go API
- Creates frontend container → Starts React dev server

**Result:** Three running containers

### Step 3: Verify Everything Works
```bash
docker compose ps        # See running containers
docker compose logs -f  # See logs from all services
```

## Container Communication

```
┌─────────────┐
│  Frontend   │  http://localhost:5173
│  (React)    │
└──────┬──────┘
       │ HTTP requests
       ↓
┌─────────────┐
│  Backend    │  http://localhost:8080
│  (Go API)   │
└──────┬──────┘
       │ SQL queries
       ↓
┌─────────────┐
│  PostgreSQL │  localhost:5432
│  (Database) │
└─────────────┘
```

## Image vs Container

**Image:**
- Template/blueprint
- Immutable (read-only)
- Created once with `docker build`
- Can be reused to create multiple containers

**Container:**
- Running instance of an image
- Mutable (can be started/stopped)
- Created from image with `docker run`
- Each container is isolated

## Common Commands

### Build
```bash
# Build all images
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend

# Rebuild from scratch (no cache)
docker compose build --no-cache
```

### Run
```bash
# Start all containers (detached mode)
docker compose up -d

# Start and see logs
docker compose up

# Start specific service
docker compose up backend
```

### Manage
```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs backend
docker compose logs frontend

# Stop containers
docker compose stop

# Stop and remove containers
docker compose down

# Restart
docker compose restart
```

### Inspect
```bash
# List images
docker images

# List containers
docker ps -a

# Inspect container
docker inspect saas_backend

# Execute command in container
docker compose exec backend sh
docker compose exec frontend sh
```

## What Gets Created

### Images (after build)
- `saas-management-backend` - Go application image
- `saas-management-frontend` - React application image
- `postgres:15-alpine` - PostgreSQL image (downloaded)

### Containers (after up)
- `saas_postgres` - Database container
- `saas_backend` - API server container
- `saas_frontend` - Web server container

### Network
- `saas_management_default` - Internal network for containers

### Volume
- `postgres_data` - Persistent database storage

## File Flow

### Backend Build Process
```
backend/
├── Dockerfile          → Instructions for building
├── go.mod              → Dependencies list
├── main.go             → Application code
└── internal/           → Source code
    ↓ (docker build)
Image: saas-management-backend
    ↓ (docker run)
Container: saas_backend (running Go server)
```

### Frontend Build Process
```
frontend/
├── Dockerfile          → Instructions for building
├── package.json        → Dependencies list
└── src/                → Source code
    ↓ (docker build)
Image: saas-management-frontend
    ↓ (docker run)
Container: saas_frontend (running Vite dev server)
```

## Environment Variables

Each container gets environment variables:

**Backend:**
- `DATABASE_URL` - Connection string to PostgreSQL
- `JWT_SECRET` - Secret for authentication
- `PORT` - Server port (8080)

**Frontend:**
- `VITE_API_URL` - Backend API URL

**PostgreSQL:**
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name

## Port Mapping

Containers expose ports to your host machine:

- `5173:5173` - Frontend (React)
- `8080:8080` - Backend (Go API)
- `5432:5432` - PostgreSQL

Format: `host_port:container_port`

## Data Persistence

PostgreSQL data is stored in a Docker volume:
- Volume name: `postgres_data`
- Survives container restarts
- Persists even if containers are removed
- To clear: `docker compose down -v`

