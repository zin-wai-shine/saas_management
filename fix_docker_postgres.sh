#!/bin/bash

# Script to fix PostgreSQL container startup issues

echo "🔧 Fixing PostgreSQL container issues..."
echo ""

cd "$(dirname "$0")"

# Step 1: Stop all containers
echo "Step 1: Stopping all containers..."
docker compose down -v 2>/dev/null || docker-compose down -v 2>/dev/null || echo "Containers stopped"

# Step 2: Remove the problematic postgres volume
echo ""
echo "Step 2: Removing old PostgreSQL volume..."
docker volume rm saas_management_postgres_data 2>/dev/null || echo "Volume removed or doesn't exist"

# Step 3: Clean up any orphaned containers
echo ""
echo "Step 3: Cleaning up orphaned containers..."
docker container prune -f 2>/dev/null || echo "Cleanup complete"

# Step 4: Start only postgres first to verify it works
echo ""
echo "Step 4: Starting PostgreSQL container..."
docker compose up -d postgres || docker-compose up -d postgres

# Step 5: Wait for postgres to initialize
echo ""
echo "Step 5: Waiting for PostgreSQL to initialize (this may take 30 seconds)..."
for i in {1..30}; do
  sleep 1
  STATUS=$(docker compose ps postgres 2>/dev/null | grep postgres | awk '{print $1}')
  if [ "$STATUS" = "running" ] || [ "$STATUS" = "Up" ]; then
    echo "✅ PostgreSQL is running!"
    break
  fi
  echo -n "."
done
echo ""

# Step 6: Check postgres status
echo ""
echo "Step 6: PostgreSQL container status:"
docker compose ps postgres || docker-compose ps postgres

# Step 7: View postgres logs
echo ""
echo "Step 7: PostgreSQL logs (last 20 lines):"
docker compose logs --tail=20 postgres || docker-compose logs --tail=20 postgres

# Step 8: If postgres is healthy, start all services
echo ""
if docker compose ps postgres 2>/dev/null | grep -q "healthy\|Up"; then
  echo "Step 8: PostgreSQL is healthy! Starting all services..."
  docker compose up -d || docker-compose up -d
  echo ""
  echo "✅ All containers started!"
  docker compose ps
else
  echo "⚠️  PostgreSQL container is not healthy. Please check the logs above."
  echo "   Common issues:"
  echo "   - Port 5433 already in use (run: lsof -ti:5433 | xargs kill -9)"
  echo "   - Volume permissions issue"
  echo "   - Docker Desktop not fully started"
fi

echo ""
echo "✅ Fix script completed!"
echo ""
echo "If PostgreSQL is still failing, run this to see detailed logs:"
echo "  docker compose logs postgres"

