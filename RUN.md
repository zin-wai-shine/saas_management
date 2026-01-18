# 🚀 Running the Application

## ✅ Current Status

**Frontend is running!** 🎉

Open your browser and go to: **http://localhost:5173**

## ⚠️ Backend Setup Required

The backend needs PostgreSQL to be running. Here's how to set it up:

### Quick PostgreSQL Setup

**Option 1: Install PostgreSQL with Homebrew**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb sass_management
```

**Option 2: Use Docker (if installed)**
```bash
docker run -d --name postgres-saas -p 5432:5432 \
  -e POSTGRES_PASSWORD=takerisknow \
  -e POSTGRES_DB=sass_management \
  postgres:15-alpine
```

**Option 3: Download from postgresql.org**
- Download and install PostgreSQL 15+
- Create database: `createdb saas_management`

### Start Backend

Once PostgreSQL is running, start the backend:

```bash
cd backend
export DATABASE_URL="postgres://postgres:takerisknow@localhost:5432/sass_management?sslmode=disable"
export JWT_SECRET="your-secret-key-change-in-production"
export PORT="8080"
go run main.go
```

## 🎯 Access Points

- **Frontend UI**: http://localhost:5173 (✅ Running)
- **Backend API**: http://localhost:8080/api (⚠️ Needs PostgreSQL)

## 📝 What You Can Do Now

Even without the backend, you can:
1. ✅ View the UI at http://localhost:5173
2. ✅ See the landing page, navigation, and design
3. ⚠️ API calls will fail until backend is running

Once backend is running, you can:
- ✅ Register new users
- ✅ Login
- ✅ Access dashboard
- ✅ View businesses, websites, plans, etc.

## 🛑 To Stop Services

Press `Ctrl+C` in the terminal where services are running, or:

```bash
# Find and kill processes
pkill -f "go run main.go"
pkill -f "vite"
```

