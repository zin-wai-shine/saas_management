# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Go 1.21+ (optional, for local development)
- Node.js 20+ (optional, for local development)

## Running the Application

### Option 1: Using Docker (Recommended)

1. **Start all services:**
   ```bash
   docker compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Go backend API on port 8080
   - React frontend on port 5173

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api

3. **Stop services:**
   ```bash
   docker compose down
   ```

### Option 2: Local Development

#### Backend (Go)

1. **Set up PostgreSQL:**
   - Install PostgreSQL
   - Create database: `createdb saas_management`
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine`

2. **Run backend:**
   ```bash
   cd backend
   go mod download
   export DATABASE_URL="postgres://postgres:postgres@localhost:5432/saas_management?sslmode=disable"
   export JWT_SECRET="your-secret-key"
   go run main.go
   ```

#### Frontend (React)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL=http://localhost:8080/api
   ```

3. **Run frontend:**
   ```bash
   npm run dev
   ```

## First Steps

1. **Register a new user:**
   - Go to http://localhost:5173/register
   - Create an account (default role is "owner")

2. **Create an admin user (via API or database):**
   ```sql
   INSERT INTO users (name, email, password, role) 
   VALUES ('Admin', 'admin@example.com', '$2a$10$...', 'admin');
   ```
   (Use bcrypt to hash the password)

3. **Login and explore:**
   - Login with your credentials
   - Navigate to dashboard based on your role

## API Testing

You can test the API using curl or Postman:

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (use token from login)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL environment variable
- Verify database exists

### Port Conflicts
- Change ports in docker-compose.yml if needed
- Update VITE_API_URL in frontend/.env

### Build Errors
- For backend: Run `go mod tidy`
- For frontend: Delete node_modules and run `npm install` again

## Project Structure

```
saas_management/
├── backend/              # Go API server
│   ├── internal/
│   │   ├── auth/         # JWT authentication
│   │   ├── config/       # Configuration
│   │   ├── database/     # Database connection & migrations
│   │   ├── handlers/     # HTTP handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Data models
│   │   └── router/       # Route setup
│   └── main.go
├── frontend/             # React application
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml    # Docker configuration
```

## Next Steps

- Customize the UI in `frontend/src/pages/`
- Add more API endpoints in `backend/internal/handlers/`
- Configure production settings
- Set up CI/CD pipeline
- Add tests

