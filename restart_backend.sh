#!/bin/bash

echo "🔄 Restarting Backend Server..."

# Find and kill the backend process
echo "Stopping existing backend..."
pkill -f "go run main.go" 2>/dev/null || pkill -f "saas-management-api" 2>/dev/null || echo "No backend process found"

# Wait a moment
sleep 2

# Start backend
echo "Starting backend..."
cd backend

export DATABASE_URL="postgres://postgres:takerisknow@localhost:5432/sass_management?sslmode=disable"
export JWT_SECRET="your-secret-key-change-in-production"
export PORT="8080"

echo "Backend will be available at: http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

go run main.go

