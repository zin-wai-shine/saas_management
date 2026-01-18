# 🚀 Quick Start with Docker

## Step 1: Install Docker Desktop

**Download and Install:**
1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac
3. Install the `.dmg` file
4. Open Docker Desktop from Applications
5. Wait for Docker to start (whale icon in menu bar)

**Or use Homebrew:**
```bash
brew install --cask docker
open -a Docker
```

## Step 2: Verify Installation

Run the check script:
```bash
./check_docker.sh
```

Or manually:
```bash
docker --version
docker compose version
docker info
```

## Step 3: Build and Run

**Easy way (recommended):**
```bash
./BUILD_AND_RUN.sh
```

**Manual way:**
```bash
# Build images
docker compose build

# Start containers
docker compose up -d

# View logs
docker compose logs -f
```

## Step 4: Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api

## Common Commands

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Restart
docker compose restart

# Rebuild
docker compose up -d --build
```

## Troubleshooting

**"command not found: docker"**
→ Docker is not installed. Install Docker Desktop first.

**"Cannot connect to Docker daemon"**
→ Docker Desktop is not running. Open Docker Desktop app.

**Port already in use**
→ Stop the service using the port, or change ports in docker-compose.yml

