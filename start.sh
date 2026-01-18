#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting SaaS Management Platform...${NC}\n"

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -d sass_management -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        echo -e "${RED}✗ PostgreSQL is not accessible. Please start PostgreSQL first.${NC}"
        echo -e "${YELLOW}You can start PostgreSQL with:${NC}"
        echo -e "  brew services start postgresql@15  (macOS with Homebrew)"
        echo -e "  or install Docker and run: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=takerisknow -e POSTGRES_DB=sass_management postgres:15-alpine"
        exit 1
    fi
else
    echo -e "${YELLOW}PostgreSQL client not found. Assuming PostgreSQL is running on localhost:5432${NC}"
fi

# Set environment variables
export DATABASE_URL="postgres://postgres:takerisknow@localhost:5432/sass_management?sslmode=disable"
export JWT_SECRET="your-secret-key-change-in-production"
export PORT="8080"

# Start backend
echo -e "\n${YELLOW}Starting Go backend...${NC}"
cd backend
if [ ! -f go.sum ]; then
    echo "Running go mod tidy..."
    go mod tidy
fi
go run main.go &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8080/api/plans > /dev/null; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:8080${NC}"
else
    echo -e "${YELLOW}Backend is starting...${NC}"
fi

# Start frontend
echo -e "\n${YELLOW}Starting React frontend...${NC}"
cd frontend
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:8080/api" > .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Application is starting!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Frontend:${NC} http://localhost:5173"
echo -e "${YELLOW}Backend API:${NC} http://localhost:8080/api"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait

