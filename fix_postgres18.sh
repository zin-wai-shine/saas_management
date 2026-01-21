#!/bin/bash

# Fix PostgreSQL 18+ data directory format issue

echo "🔧 Fixing PostgreSQL 18+ Data Directory Format..."
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Step 1: Stop everything
echo "Step 1: Stopping all containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null
echo "✅ Stopped"
echo ""

# Step 2: Remove old volume (has incompatible format)
echo "Step 2: Removing old PostgreSQL volume (incompatible format)..."
docker volume rm saas_management_postgres_data 2>/dev/null || echo "Volume removed or doesn't exist"
echo "✅ Old volume removed"
echo ""

# Step 3: Start PostgreSQL with new volume format
echo "Step 3: Starting PostgreSQL with new data directory format..."
echo "   (Using /var/lib/postgresql instead of /var/lib/postgresql/data)"
docker compose up -d postgres
echo ""

# Step 4: Wait for initialization
echo "Step 4: Waiting for PostgreSQL to initialize (30 seconds)..."
sleep 30
echo ""

# Step 5: Check status
echo "Step 5: Checking PostgreSQL status..."
docker compose ps postgres
echo ""

# Step 6: Show logs
echo "Step 6: PostgreSQL logs:"
echo "========================================="
docker compose logs postgres 2>/dev/null | tail -30
echo ""

# Step 7: If healthy, start all services
if docker compose ps postgres 2>/dev/null | grep -q "healthy\|Up.*healthy"; then
    echo "✅ PostgreSQL is healthy! Starting all services..."
    docker compose up -d
    echo ""
    sleep 15
    echo "========================================="
    echo "All Services Status:"
    echo "========================================="
    docker compose ps
    echo ""
    echo "✅ All services started!"
    echo ""
    echo "Access your application:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:8080/api"
else
    echo "⚠️  PostgreSQL is still not healthy. Check logs above for errors."
fi

echo ""
echo "========================================="
echo "Fix completed!"
echo "========================================="

