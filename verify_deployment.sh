#!/bin/bash
echo "=== TakaTrack Deployment Verifier ==="

# 1. Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file is missing!"
else
    echo "✅ .env file exists."
fi

# 2. Check for critical Env Vars
if grep -q "GOOGLE_CLIENT_ID" .env; then
    echo "✅ GOOGLE_CLIENT_ID found."
else
    echo "❌ ERROR: GOOGLE_CLIENT_ID missing in .env!"
fi

if grep -q "FRONTEND_URL" .env; then
    echo "✅ FRONTEND_URL found."
else
    echo "❌ ERROR: FRONTEND_URL missing in .env!"
fi

# 3. Check Docker Containers
echo "--- Docker Status ---"
docker ps

# 4. Check Backend Logs for Crash
echo "--- Backend Logs (Last 20 lines) ---"
docker compose logs --tail 20 backend

echo "====================================="
echo "If backend is restarting or exited, it's likely due to missing Env Vars."
