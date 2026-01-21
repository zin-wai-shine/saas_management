#!/bin/bash

# Comprehensive script to check status and start the project

echo "🔍 Checking Docker and Container Status..."
echo ""

cd "$(dirname "$0")"

# Check if Docker is running
echo "Step 1: Checking Docker status..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running or not accessible!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check container status
echo "Step 2: Checking container status..."
docker compose ps
echo ""

# Check if containers are running
POSTGRES_STATUS=$(docker compose ps postgres 2>/dev/null | grep -v "NAME" | awk '{print $1}')
BACKEND_STATUS=$(docker compose ps backend 2>/dev/null | grep -v "NAME" | awk '{print $1}')
FRONTEND_STATUS=$(docker compose ps frontend 2>/dev/null | grep -v "NAME" | awk '{print $1}')

# Function to check if container is running
is_running() {
    [ "$1" = "saas_postgres" ] || [ "$1" = "saas_backend" ] || [ "$1" = "saas_frontend" ]
}

# Start containers if not running
if ! is_running "$POSTGRES_STATUS"; then
    echo "⚠️  PostgreSQL is not running"
    echo "Step 3: Starting PostgreSQL..."
    docker compose up -d postgres
    echo "Waiting for PostgreSQL to initialize (30 seconds)..."
    sleep 30
fi

if ! is_running "$BACKEND_STATUS"; then
    echo "⚠️  Backend is not running"
    echo "Step 4: Starting Backend..."
    docker compose up -d backend
    echo "Waiting for Backend to start (10 seconds)..."
    sleep 10
fi

if ! is_running "$FRONTEND_STATUS"; then
    echo "⚠️  Frontend is not running"
    echo "Step 5: Starting Frontend..."
    docker compose up -d frontend
    echo "Waiting for Frontend to start (15 seconds)..."
    sleep 15
fi

# Final status check
echo ""
echo "========================================="
echo "Final Container Status:"
echo "========================================="
docker compose ps
echo ""

# Check logs for errors
echo "========================================="
echo "Recent Logs (check for errors):"
echo "========================================="
echo ""
echo "--- PostgreSQL Logs (last 10 lines) ---"
docker compose logs --tail=10 postgres 2>/dev/null || echo "No logs available"
echo ""
echo "--- Backend Logs (last 10 lines) ---"
docker compose logs --tail=10 backend 2>/dev/null || echo "No logs available"
echo ""
echo "--- Frontend Logs (last 10 lines) ---"
docker compose logs --tail=10 frontend 2>/dev/null || echo "No logs available"
echo ""

# Check port availability
echo "========================================="
echo "Port Status:"
echo "========================================="
echo "Checking ports..."
if lsof -ti:5433 > /dev/null 2>&1; then
    echo "✅ Port 5433 (PostgreSQL) is in use"
else
    echo "❌ Port 5433 (PostgreSQL) is not in use"
fi

if lsof -ti:8080 > /dev/null 2>&1; then
    echo "✅ Port 8080 (Backend) is in use"
else
    echo "❌ Port 8080 (Backend) is not in use"
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo "✅ Port 5173 (Frontend) is in use"
else
    echo "❌ Port 5173 (Frontend) is not in use"
fi
echo ""

# Final instructions
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "If containers are running but you still can't access:"
echo "  1. Wait a bit longer (first startup takes time)"
echo "  2. Check logs: docker compose logs -f"
echo "  3. Try accessing:"
echo "     - Frontend: http://localhost:5173"
echo "     - Backend:  http://localhost:8080/api"
echo ""
echo "If containers failed to start:"
echo "  1. Run: bash fix_docker_postgres.sh"
echo "  2. Or restart everything: docker compose down && docker compose up --build -d"
echo ""

