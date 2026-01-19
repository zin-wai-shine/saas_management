# Database Setup Guide

## Database Configuration

The application is configured to use the following PostgreSQL database:

- **Username:** `zinwaishine`
- **Database Name:** `saas_management`
- **Password:** `takerisknow`
- **Host:** `localhost`
- **Port:** `5432`

## Step 1: Create Database and User

First, you need to create the database and user. Run this as a PostgreSQL superuser:

```bash
# Connect as PostgreSQL superuser (usually 'postgres')
psql -U postgres

# Then run these SQL commands:
CREATE USER zinwaishine WITH PASSWORD 'takerisknow';
CREATE DATABASE saas_management OWNER zinwaishine;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE saas_management TO zinwaishine;

# Connect to the new database
\c saas_management

# Grant schema privileges
GRANT ALL ON SCHEMA public TO zinwaishine;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zinwaishine;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO zinwaishine;

# Exit
\q
```

Or use the provided setup script:

```bash
psql -U postgres -f setup_database.sql
```

## Step 2: Start the Backend Server

The backend will automatically run migrations when it starts:

```bash
# Using the start script
./START_BACKEND.sh

# Or manually:
cd backend
export DATABASE_URL="postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable"
go run main.go
```

The migrations will automatically:
- Create all required tables (users, businesses, websites, plans, subscriptions, domains, invoices, payments)
- Add the URL column to the websites table if it doesn't exist
- Set up all necessary relationships and constraints

## Step 3: Verify Database Setup

You can verify the database was created correctly:

```bash
psql -U zinwaishine -d saas_management -c "\dt"
```

This should list all the tables:
- users
- businesses
- websites
- plans
- subscriptions
- domains
- invoices
- payments

## Database Connection String

The connection string format is:
```
postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable
```

## Environment Variable

You can also set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable"
```

## Troubleshooting

### Connection Error
If you get a connection error, make sure:
1. PostgreSQL is running: `sudo service postgresql status` (Linux) or check via system preferences (Mac)
2. The user and database exist
3. The password is correct
4. PostgreSQL is listening on port 5432

### Permission Errors
If you get permission errors, make sure the user has the necessary privileges:
```sql
GRANT ALL ON SCHEMA public TO zinwaishine;
GRANT ALL ON ALL TABLES IN SCHEMA public TO zinwaishine;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO zinwaishine;
```

### Migration Errors
If migrations fail:
1. Check the backend logs for specific error messages
2. Ensure the user has CREATE TABLE privileges
3. Try connecting manually to verify credentials: `psql -U zinwaishine -d saas_management`

