#!/bin/bash

# Deployment Script for TakaTrack
# Author: Puspo
# Description: Pulls latest code, rebuilds containers, and restarts services.

echo "=========================================="
echo "🚀 Starting TakaTrack Deployment"
echo "=========================================="

# 1. Pull the latest code
echo "⬇️  Pulling latest changes from git..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ git pull failed! Aborting."
    exit 1
fi

# 2. Build and Start Containers
echo "🏗️  Building and starting containers..."
# We use --build to ensure any changes in Dockerfiles/context are picked up
# -d runs in detached mode
docker compose up -d --build --remove-orphans

if [ $? -ne 0 ]; then
    echo "❌ docker compose failed! Aborting."
    exit 1
fi

# 3. Clean up unused images (optional but recommended for servers)
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "=========================================="
echo "✅ Deployment Complete! Services are up."
echo "=========================================="
docker compose ps
