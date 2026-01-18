# 🔧 Fix Docker Command Not Found Issue

## Problem
Docker Desktop is running, but terminal shows: `zsh: command not found: docker`

## Solutions (Try in Order)

### Solution 1: Restart Terminal (Easiest)

1. **Close your current terminal window**
2. **Open a new terminal window**
3. **Try again:**
   ```bash
   docker --version
   ```

This usually fixes it because Docker Desktop adds itself to PATH when it starts.

### Solution 2: Add Docker to PATH Manually

Add this to your `~/.zshrc` file:

```bash
# Open zshrc
nano ~/.zshrc

# Add these lines at the end:
export PATH="/usr/local/bin:$PATH"
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

# Save and exit (Ctrl+X, then Y, then Enter)

# Reload shell
source ~/.zshrc
```

### Solution 3: Use Full Path

Temporarily use the full path to Docker:

```bash
/usr/local/bin/docker compose build
```

Or:

```bash
/Applications/Docker.app/Contents/Resources/bin/docker compose build
```

### Solution 4: Restart Docker Desktop

1. **Quit Docker Desktop** (right-click whale icon → Quit)
2. **Wait 10 seconds**
3. **Start Docker Desktop again**
4. **Open new terminal**
5. **Try:**
   ```bash
   docker --version
   ```

### Solution 5: Create Symlink (Advanced)

```bash
# Create symlink if Docker exists but not linked
sudo ln -s /Applications/Docker.app/Contents/Resources/bin/docker /usr/local/bin/docker
sudo ln -s /Applications/Docker.app/Contents/Resources/bin/docker-compose /usr/local/bin/docker-compose
```

## Quick Test

After trying any solution, test with:

```bash
docker --version
docker compose version
```

If both work, you're ready to build:

```bash
cd ~/Desktop/saas_management
docker compose build
docker compose up -d
```

## Verify Docker Desktop is Running

Check if Docker Desktop process is running:

```bash
pgrep -f "Docker Desktop"
```

If it returns a number, Docker Desktop is running.

## Still Not Working?

1. **Check Docker Desktop Settings:**
   - Open Docker Desktop
   - Go to Settings → General
   - Make sure "Use Docker Compose V2" is enabled

2. **Reinstall Docker Desktop:**
   - Download fresh from: https://www.docker.com/products/docker-desktop/
   - Install again

3. **Check System Requirements:**
   - macOS 10.15 or newer
   - Enough disk space

