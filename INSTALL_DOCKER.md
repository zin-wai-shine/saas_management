# Installing Docker on macOS

## Quick Installation

### Option 1: Docker Desktop (Recommended)

1. **Download Docker Desktop for Mac**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download the version for your Mac (Intel or Apple Silicon/M1/M2)

2. **Install Docker Desktop**
   - Open the downloaded `.dmg` file
   - Drag Docker to Applications folder
   - Open Docker from Applications
   - Follow the setup wizard

3. **Start Docker Desktop**
   - Launch Docker Desktop from Applications
   - Wait for it to start (whale icon in menu bar)
   - You'll see "Docker Desktop is running" when ready

4. **Verify Installation**
   ```bash
   docker --version
   docker compose version
   ```

### Option 2: Using Homebrew

```bash
# Install Docker Desktop via Homebrew
brew install --cask docker

# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then verify
docker --version
```

## After Installation

Once Docker is installed and running:

1. **Verify Docker is running**
   ```bash
   docker info
   ```

2. **Build and run the application**
   ```bash
   ./BUILD_AND_RUN.sh
   ```

   Or manually:
   ```bash
   docker compose build
   docker compose up -d
   ```

## Troubleshooting

### Docker Desktop won't start
- Make sure you have enough disk space (at least 4GB free)
- Check System Preferences > Security & Privacy for permissions
- Restart your Mac if needed

### "Docker daemon is not running"
- Open Docker Desktop application
- Wait for the whale icon to appear in menu bar
- Check Docker Desktop status

### Permission denied errors
- Make sure Docker Desktop is running
- You may need to add your user to docker group (usually automatic on macOS)

## System Requirements

- macOS 10.15 or newer
- 4GB RAM minimum (8GB recommended)
- VirtualBox prior to version 4.3.30 must NOT be installed (it is incompatible with Docker Desktop)

## Alternative: Use Colima (Lightweight Docker)

If you prefer a lighter alternative:

```bash
# Install Colima
brew install colima docker docker-compose

# Start Colima
colima start

# Verify
docker --version
```

Then use the same docker compose commands.

