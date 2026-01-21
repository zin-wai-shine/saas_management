#!/bin/bash

# Script to start Docker containers for SaaS Management project

echo "🐳 Starting Docker containers..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Stop any existing containers first
echo "Step 1: Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || echo "No containers to stop"

# Build and start containers
echo ""
echo "Step 2: Building and starting containers..."
docker compose up --build -d

# Check status
echo ""
echo "Step 3: Checking container status..."
docker compose ps

echo ""
echo "✅ Containers started!"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080/api"
echo ""
echo "To view logs, run: docker compose logs -f"
echo "To stop containers, run: docker compose down"

