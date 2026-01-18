#!/bin/bash

# Script to drop all tables, run fresh migrations and seed the database
# WARNING: This will DELETE ALL DATA in the database!

set -e

echo "========================================="
echo "FRESH Database Migration & Seeding"
echo "========================================="
echo ""
echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Set database URL
export DATABASE_URL="postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable"
export SEED_DB="true"

echo ""
echo "Database URL: $DATABASE_URL"
echo ""

cd "$(dirname "$0")"

echo "Step 1: Dropping all tables..."
psql "$DATABASE_URL" <<EOF
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS websites CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;
EOF

echo "✅ Tables dropped"
echo ""

echo "Step 2: Running migrations..."
export DATABASE_URL
export SEED_DB
go run cmd/migrate/main.go

echo ""
echo "✅ Fresh database migrated and seeded successfully!"

