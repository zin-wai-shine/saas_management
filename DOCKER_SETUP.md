# Docker Setup Instructions

## Prerequisites

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Verify installation: `docker --version`

## Database Configuration

- **Database Name**: `sass_management`
- **Password**: `takerisknow`
- **User**: `postgres`
- **Port**: `5432`

## Building and Running with Docker

### Step 1: Build all containers

```bash
docker compose build
```

Or to rebuild from scratch:

```bash
docker compose build --no-cache
```

### Step 2: Start all services

```bash
docker compose up -d
```

Or to see logs in real-time:

```bash
docker compose up
```

### Step 3: View running containers

```bash
docker compose ps
```

### Step 4: View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## Access the Application

Once containers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5432

## Useful Docker Commands

### Stop all services
```bash
docker compose down
```

### Stop and remove volumes (clears database)
```bash
docker compose down -v
```

### Restart a specific service
```bash
docker compose restart backend
docker compose restart frontend
```

### Rebuild and restart
```bash
docker compose up -d --build
```

### View container status
```bash
docker compose ps
```

### Execute commands in container
```bash
# Backend container
docker compose exec backend sh

# Frontend container
docker compose exec frontend sh

# PostgreSQL container
docker compose exec postgres psql -U postgres -d sass_management
```

## Troubleshooting

### Port already in use
If ports 5173, 8080, or 5432 are already in use:
- Stop the conflicting service
- Or change ports in `docker-compose.yml`

### Container won't start
```bash
# Check logs
docker compose logs [service-name]

# Rebuild
docker compose build --no-cache [service-name]
docker compose up -d [service-name]
```

### Database connection issues
```bash
# Check if PostgreSQL is healthy
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres pg_isready -U postgres
```

### Frontend build errors
```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

## Production Build

For production, you may want to:

1. **Build frontend for production:**
   ```bash
   docker compose exec frontend npm run build
   ```

2. **Use production Dockerfile** (create separate production Dockerfiles)

3. **Set environment variables** in `.env` file or docker-compose.yml

## Clean Up

### Remove all containers, networks, and volumes
```bash
docker compose down -v
```

### Remove images
```bash
docker compose down --rmi all
```

### Complete cleanup (containers, images, volumes)
```bash
docker compose down -v --rmi all
```

