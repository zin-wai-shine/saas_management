#!/bin/bash

# Script to properly remove Docker volumes

echo "🧹 Cleaning Docker Volumes..."
echo ""

cd "$(dirname "$0")"

# Step 1: Stop containers
echo "Step 1: Stopping containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null
echo "✅ Stopped"
echo ""

# Step 2: List volumes to see what exists
echo "Step 2: Checking existing volumes..."
docker volume ls | grep saas_management || echo "No saas_management volumes found"
echo ""

# Step 3: Remove the postgres volume
echo "Step 3: Removing PostgreSQL volume..."
VOLUME_NAME="saas_management_postgres_data"
if docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    docker volume rm "$VOLUME_NAME"
    echo "✅ Volume '$VOLUME_NAME' removed"
else
    echo "ℹ️  Volume '$VOLUME_NAME' doesn't exist (already removed or never created)"
fi
echo ""

# Step 4: Optional - remove all unused volumes
echo "Step 4: Removing all unused volumes (optional cleanup)..."
read -p "Remove all unused volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume prune -f
    echo "✅ Unused volumes removed"
else
    echo "⏭️  Skipped"
fi
echo ""

echo "✅ Volume cleanup complete!"
echo ""
echo "Now you can start containers with:"
echo "  docker compose up -d"

