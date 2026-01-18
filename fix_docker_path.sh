#!/bin/bash

# Script to fix Docker PATH issue on macOS

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Docker PATH Issue${NC}\n"

# Check if Docker Desktop is installed
DOCKER_APP="/Applications/Docker.app"
if [ -d "$DOCKER_APP" ]; then
    echo -e "${GREEN}✓ Docker Desktop is installed${NC}"
else
    echo -e "${RED}✗ Docker Desktop not found in Applications${NC}"
    exit 1
fi

# Find Docker binary
DOCKER_BIN=""
if [ -f "/usr/local/bin/docker" ]; then
    DOCKER_BIN="/usr/local/bin/docker"
elif [ -f "$DOCKER_APP/Contents/Resources/bin/docker" ]; then
    DOCKER_BIN="$DOCKER_APP/Contents/Resources/bin/docker"
elif [ -f "/usr/local/lib/docker/cli-plugins/docker-compose" ]; then
    DOCKER_BIN="/usr/local/bin/docker"
fi

if [ -n "$DOCKER_BIN" ]; then
    echo -e "${GREEN}✓ Found Docker at: $DOCKER_BIN${NC}"
else
    echo -e "${YELLOW}⚠ Docker binary not found in standard locations${NC}"
fi

# Check if Docker Desktop is running
if pgrep -f "Docker Desktop" > /dev/null; then
    echo -e "${GREEN}✓ Docker Desktop is running${NC}"
else
    echo -e "${RED}✗ Docker Desktop is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop from Applications${NC}"
    exit 1
fi

# Add Docker to PATH for current session
export PATH="/usr/local/bin:$PATH"
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

# Test Docker command
if command -v docker &> /dev/null; then
    echo -e "\n${GREEN}✅ Docker is now accessible!${NC}"
    docker --version
    echo ""
    echo -e "${YELLOW}To make this permanent, add to your ~/.zshrc:${NC}"
    echo -e "export PATH=\"/usr/local/bin:\$PATH\""
    echo ""
    echo -e "${GREEN}You can now run:${NC}"
    echo -e "  docker compose build"
    echo -e "  docker compose up -d"
else
    echo -e "\n${YELLOW}⚠ Docker still not accessible${NC}"
    echo -e "${YELLOW}Try these solutions:${NC}"
    echo -e "1. Restart your terminal"
    echo -e "2. Restart Docker Desktop"
    echo -e "3. Add to ~/.zshrc:"
    echo -e "   export PATH=\"/usr/local/bin:\$PATH\""
    echo -e "   source ~/.zshrc"
fi

