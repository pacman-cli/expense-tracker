#!/bin/bash
echo "=== Backend Crash Debugger ==="

# 1. Capture logs searching for Exception or Error
echo "Searching for 'Exception' in logs:"
docker compose logs backend | grep -i "Exception" | tail -n 20

echo "------------------------------------------------"

echo "Searching for 'Caused by' in logs:"
docker compose logs backend | grep -i "Caused by" | tail -n 20

echo "------------------------------------------------"

echo "Dumping last 100 lines of log to find the start of the crash:"
docker compose logs --tail 100 backend

echo "=== End Debug Log ==="
