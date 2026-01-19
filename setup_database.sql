-- Database Setup Script for saas_management
-- Run this script as a PostgreSQL superuser to create the database and user

-- Create database (if it doesn't exist)
-- Note: You need to run this as a PostgreSQL superuser (usually 'postgres')
-- Run: psql -U postgres -f setup_database.sql

-- Create user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'zinwaishine') THEN
        CREATE USER zinwaishine WITH PASSWORD 'takerisknow';
    END IF;
END
$$;

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE saas_management OWNER zinwaishine'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'saas_management')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE saas_management TO zinwaishine;

-- Connect to the database and set up schema
\c saas_management

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO zinwaishine;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zinwaishine;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO zinwaishine;

