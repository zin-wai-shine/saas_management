#!/bin/bash

# Quick script to fix websites table: Add URL column and remove Content column

echo "Fixing websites table..."
echo ""

# Run the fix script
cd backend

export DATABASE_URL="postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable"

go run cmd/fix_websites/main.go

echo ""
echo "Done! Check the output above to verify the changes."

