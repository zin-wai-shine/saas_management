#!/bin/bash
echo "Stopping any running backend processes..."
# Kill processes by name
pkill -f "go run main.go" || true
pkill -f "saas-management-api" || true
# Kill anything on port 8080
lsof -ti:8080 | xargs kill -9 || true

sleep 2
echo "Starting backend server in background..."
export DATABASE_URL="postgres://postgres:takerisknow@localhost:5432/sass_management?sslmode=disable"
export JWT_SECRET="your-secret-key-change-in-production"
export PORT="8080"
export GIN_MODE=debug

# Run in background and redirect output to /tmp/backend.log
go run main.go > /tmp/backend.log 2>&1 &

echo "Backend server started in background (PID: $!)."
echo "Logs are being written to /tmp/backend.log"
echo "You can check logs with: tail -f /tmp/backend.log"
