#!/bin/bash

# Quick script to start the backend with correct database credentials

echo "Starting backend with database: sass_management"
echo "Password: takerisknow"
echo ""

cd backend

export DATABASE_URL="postgres://postgres:takerisknow@localhost:5432/sass_management?sslmode=disable"
export JWT_SECRET="your-secret-key-change-in-production"
export PORT="8080"

echo "Database URL: $DATABASE_URL"
echo ""
echo "Starting Go backend server..."
echo "Backend will be available at: http://localhost:8080"
echo ""

go run main.go

