#!/bin/bash

# Script to build and run Docker containers

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🐳 Docker Build and Run Script${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo -e "${YELLOW}Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}\n"

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose down 2>/dev/null

# Build containers
echo -e "\n${YELLOW}Building Docker images...${NC}"
echo -e "${YELLOW}This may take a few minutes on first run...${NC}\n"

if docker compose build; then
    echo -e "\n${GREEN}✓ Images built successfully${NC}\n"
else
    echo -e "\n${RED}❌ Build failed!${NC}"
    exit 1
fi

# Start containers
echo -e "${YELLOW}Starting containers...${NC}\n"

if docker compose up -d; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ All containers are running!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo -e "${YELLOW}Access points:${NC}"
    echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
    echo -e "  Backend:  ${GREEN}http://localhost:8080/api${NC}"
    echo -e "  Database: ${GREEN}localhost:5432${NC}\n"
    
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "  View logs:    ${GREEN}docker compose logs -f${NC}"
    echo -e "  Stop:         ${GREEN}docker compose down${NC}"
    echo -e "  Status:       ${GREEN}docker compose ps${NC}\n"
    
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 5
    
    # Check service health
    echo -e "\n${YELLOW}Service Status:${NC}"
    docker compose ps
    
else
    echo -e "\n${RED}❌ Failed to start containers!${NC}"
    echo -e "${YELLOW}Check logs with: docker compose logs${NC}"
    exit 1
fi

