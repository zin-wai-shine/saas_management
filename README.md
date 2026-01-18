# SaaS Management Platform

A full-stack SaaS management platform built with Go (backend), React (frontend), and PostgreSQL (database).

## Tech Stack

- **Backend**: Go (Golang) with Gin framework
- **Frontend**: React with Vite, React Router, Tailwind CSS, React Icons
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Project Structure

```
saas_management/
├── backend/          # Go API server
├── frontend/         # React application
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Go 1.21+ (for local development)
- Node.js 20+ (for local development)

### Running with Docker

1. Clone the repository
2. Navigate to the project directory
3. Run Docker Compose:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432 (database: sass_management, password: takerisknow)
- Go backend API on port 8080
- React frontend on port 5173

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api

### Default Credentials

After running migrations, you can create a user via the registration endpoint or manually insert into the database.

## Development

### Backend (Go)

```bash
cd backend
go mod download
go run main.go
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Businesses
- `GET /api/businesses` - List all businesses
- `GET /api/businesses/:id` - Get business by ID
- `POST /api/businesses` - Create business (protected)
- `PUT /api/businesses/:id` - Update business (protected)
- `DELETE /api/businesses/:id` - Delete business (protected)

### Websites
- `GET /api/websites` - List all websites
- `GET /api/websites/:id` - Get website by ID
- `POST /api/websites` - Create website (protected)
- `PUT /api/websites/:id` - Update website (protected)
- `DELETE /api/websites/:id` - Delete website (protected)

### Plans
- `GET /api/plans` - List all plans (public)
- `GET /api/admin/plans/:id` - Get plan by ID
- `POST /api/admin/plans` - Create plan (admin only)
- `PUT /api/admin/plans/:id` - Update plan (admin only)
- `DELETE /api/admin/plans/:id` - Delete plan (admin only)

### Subscriptions
- `GET /api/subscriptions` - List subscriptions (protected)
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create subscription (protected)
- `PUT /api/subscriptions/:id` - Update subscription (protected)
- `DELETE /api/subscriptions/:id` - Delete subscription (protected)

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 8080)

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080/api)

## License

MIT
