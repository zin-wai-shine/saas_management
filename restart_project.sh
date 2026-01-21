#!/bin/bash

# Complete restart script - stops everything, cleans up, and starts fresh

echo "🔄 Complete Project Restart"
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Step 1: Stop everything
echo "Step 1: Stopping all containers..."
docker compose down -v 2>/dev/null || docker-compose down -v 2>/dev/null
echo "✅ Stopped"
echo ""

# Step 2: Remove volumes (optional - comment out if you want to keep data)
echo "Step 2: Removing old volumes..."
docker volume rm saas_management_postgres_data 2>/dev/null || echo "Volume removed or doesn't exist"
echo "✅ Cleaned"
echo ""

# Step 3: Build and start all services
echo "Step 3: Building and starting all services..."
echo "This may take a few minutes on first run..."
docker compose up --build -d
echo ""

# Step 4: Wait for services to start
echo "Step 4: Waiting for services to initialize..."
echo "PostgreSQL: 30 seconds..."
sleep 30
echo "Backend: 15 seconds..."
sleep 15
echo "Frontend: 15 seconds..."
sleep 15
echo ""

# Step 5: Show status
echo "========================================="
echo "Container Status:"
echo "========================================="
docker compose ps
echo ""

# Step 6: Show recent logs
echo "========================================="
echo "Recent Logs (check for errors):"
echo "========================================="
echo ""
echo "--- PostgreSQL ---"
docker compose logs --tail=5 postgres 2>/dev/null
echo ""
echo "--- Backend ---"
docker compose logs --tail=5 backend 2>/dev/null
echo ""
echo "--- Frontend ---"
docker compose logs --tail=5 frontend 2>/dev/null
echo ""

# Step 7: Final check
echo "========================================="
echo "✅ Restart Complete!"
echo "========================================="
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080/api"
echo ""
echo "To view live logs:"
echo "  docker compose logs -f"
echo ""
echo "If services failed to start, check logs above or run:"
echo "  docker compose logs [service_name]"

