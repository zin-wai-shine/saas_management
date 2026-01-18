#!/bin/bash

# Script to run migrations and seed the database

set -e

echo "========================================="
echo "Database Migration & Seeding Script"
echo "========================================="
echo ""

# Set database URL
export DATABASE_URL="postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable"
export SEED_DB="true"

echo "Database URL: $DATABASE_URL"
echo "SEED_DB: $SEED_DB"
echo ""

cd "$(dirname "$0")"

echo "Building migration tool..."
go build -o /tmp/migrate_seed ./cmd/migrate/main.go

echo ""
echo "Running migrations and seeding..."
/tmp/migrate_seed

echo ""
echo "✅ Done! Database migrated and seeded."
echo ""
echo "You can now start the backend server with:"
echo "  cd backend"
echo "  go run main.go"

