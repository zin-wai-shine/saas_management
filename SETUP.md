# Setup Instructions

## Prerequisites

1. **PostgreSQL Database** - You need PostgreSQL running. Options:

   **Option A: Using Homebrew (macOS)**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   createdb sass_management
   ```

   **Option B: Using Docker (if you install Docker)**
   ```bash
   docker run -d --name postgres-saas -p 5432:5432 \
     -e POSTGRES_PASSWORD=takerisknow \
     -e POSTGRES_DB=sass_management \
     postgres:15-alpine
   ```

   **Option C: Install PostgreSQL from postgresql.org**

2. **Go** (already installed ✓)
3. **Node.js** (already installed ✓)

## Quick Start

### Method 1: Using the start script

```bash
./start.sh
```

This will start both backend and frontend automatically.

### Method 2: Manual start

**Terminal 1 - Backend:**
```bash
cd backend
export DATABASE_URL="postgres://postgres:takerisknow@localhost:5432/sass_management?sslmode=disable"
export JWT_SECRET="your-secret-key-change-in-production"
export PORT="8080"
go run main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8080/api

## First Steps

1. Open http://localhost:5173 in your browser
2. Register a new account
3. Explore the dashboard!

## Troubleshooting

### Database Connection Error

If you see "Failed to connect to database":
- Make sure PostgreSQL is running
- Check if database `sass_management` exists
- Verify connection string matches your PostgreSQL setup

### Port Already in Use

If port 8080 or 5173 is already in use:
- Change PORT in backend: `export PORT="8081"`
- Change port in frontend: Edit `vite.config.js` and update `server.port`

### Backend Not Starting

- Check Go dependencies: `cd backend && go mod tidy`
- Verify PostgreSQL is accessible
- Check logs for specific error messages

