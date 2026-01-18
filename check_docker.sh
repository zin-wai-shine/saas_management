#!/bin/bash

# Script to check Docker installation and status

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 Docker Installation Checker${NC}\n"

# Check if Docker command exists
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
    docker --version
else
    echo -e "${RED}✗ Docker is NOT installed${NC}"
    echo -e "\n${YELLOW}To install Docker Desktop:${NC}"
    echo -e "  1. Visit: https://www.docker.com/products/docker-desktop/"
    echo -e "  2. Download Docker Desktop for Mac"
    echo -e "  3. Install and start Docker Desktop"
    echo -e "\n${YELLOW}Or use Homebrew:${NC}"
    echo -e "  brew install --cask docker"
    exit 1
fi

echo ""

# Check if Docker Compose exists
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
    if docker compose version &> /dev/null; then
        docker compose version
    else
        docker-compose --version
    fi
else
    echo -e "${RED}✗ Docker Compose is NOT available${NC}"
    exit 1
fi

echo ""

# Check if Docker daemon is running
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
    echo ""
    echo -e "${BLUE}Docker System Info:${NC}"
    docker info | grep -E "Server Version|Operating System|Architecture" | head -3
else
    echo -e "${RED}✗ Docker daemon is NOT running${NC}"
    echo -e "\n${YELLOW}Please:${NC}"
    echo -e "  1. Open Docker Desktop application"
    echo -e "  2. Wait for it to fully start"
    echo -e "  3. Look for the whale icon in your menu bar"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Docker is ready to use!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}You can now run:${NC}"
echo -e "  ${GREEN}./BUILD_AND_RUN.sh${NC}"
echo -e "  or"
echo -e "  ${GREEN}docker compose build${NC}"
echo -e "  ${GREEN}docker compose up -d${NC}"

