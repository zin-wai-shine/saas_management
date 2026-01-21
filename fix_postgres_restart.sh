#!/bin/bash

# Fix PostgreSQL restart loop issue

echo "🔧 Fixing PostgreSQL Restart Loop..."
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Step 1: Stop everything
echo "Step 1: Stopping all containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null
echo "✅ Stopped"
echo ""

# Step 2: Check PostgreSQL logs before removing volume
echo "Step 2: Checking PostgreSQL error logs..."
echo "========================================="
docker compose logs postgres 2>/dev/null | tail -30 || echo "No logs available"
echo ""

# Step 3: Remove the problematic volume
echo "Step 3: Removing PostgreSQL volume..."
docker volume rm saas_management_postgres_data 2>/dev/null || echo "Volume removed or doesn't exist"
echo "✅ Volume removed"
echo ""

# Step 4: Check for port conflicts
echo "Step 4: Checking for port conflicts..."
if lsof -ti:5433 > /dev/null 2>&1; then
    echo "⚠️  Port 5433 is in use. Killing process..."
    lsof -ti:5433 | xargs kill -9 2>/dev/null || echo "Could not kill process"
    sleep 2
fi
echo "✅ Port check complete"
echo ""

# Step 5: Start PostgreSQL only with verbose logging
echo "Step 5: Starting PostgreSQL with fresh volume..."
docker compose up -d postgres
echo "Waiting 10 seconds for initial startup..."
sleep 10
echo ""

# Step 6: Check status
echo "Step 6: Checking PostgreSQL status..."
docker compose ps postgres
echo ""

# Step 7: Show logs again
echo "Step 7: PostgreSQL logs (check for errors):"
echo "========================================="
docker compose logs postgres 2>/dev/null | tail -20
echo ""

# Step 8: If postgres is healthy, start other services
if docker compose ps postgres 2>/dev/null | grep -q "healthy\|Up.*healthy"; then
    echo "✅ PostgreSQL is healthy! Starting other services..."
    docker compose up -d
    echo ""
    echo "Waiting for all services to start..."
    sleep 15
    echo ""
    echo "========================================="
    echo "All Services Status:"
    echo "========================================="
    docker compose ps
else
    echo "⚠️  PostgreSQL is still not healthy."
    echo ""
    echo "Common fixes to try:"
    echo "1. Check Docker Desktop has enough resources (Settings > Resources)"
    echo "2. Try: docker system prune -a (removes unused images/containers)"
    echo "3. Restart Docker Desktop completely"
    echo ""
    echo "Full error logs:"
    docker compose logs postgres 2>/dev/null
fi

echo ""
echo "========================================="
echo "Fix script completed!"
echo "========================================="

