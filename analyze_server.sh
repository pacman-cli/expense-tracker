#!/bin/bash

# Server Analysis & Diagnostics Script for TakaTrack
# Usage: ./analyze_server.sh
# Purpose: Check why the server might be going down (OOM, Disk, Crash)

LOG_FILE="server_analysis_$(date +%Y%m%d_%H%M%S).log"

log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log "=== TakaTrack Server Diagnostics ==="
log "Date: $(date)"
log "Uptime: $(uptime)"

log ""
log "--- 1. Memory Usage (Free) ---"
# Check RAM usage. If 'available' is very low, we have a memory issue.
free -h | tee -a "$LOG_FILE"

log ""
log "--- 2. Disk Usage ---"
# Check if disk is full
df -h / | tee -a "$LOG_FILE"

log ""
log "--- 3. Docker Containers Status ---"
# Check if containers are running or exited
docker ps -a | tee -a "$LOG_FILE"

log ""
log "--- 4. Checking for OOM (Out of Memory) Kills ---"
# Search system logs for OOM killer events in the last 1000 lines
# This is the #1 reason for "randomly goes down" on small droplets
if grep -i "Out of memory" /var/log/syslog | tail -n 20 > /tmp/oom_check.txt; then
    log "⚠️  CRITICAL: OOM Killer detected active in logs:"
    cat /tmp/oom_check.txt | tee -a "$LOG_FILE"
    log ">>> SOLUTION: Your server is running out of RAM. Reduce Java Heap (-Xmx) in Dockerfile or upgrade droplet."
else
    log "✅ No recent 'Out of memory' messages found in last 20 matches of syslog."
fi

log ""
log "--- 5. Recent Backend Log Errors ---"
# Check the last 50 lines of backend logs for crashes
docker compose logs --tail=50 backend > /tmp/backend_logs.txt 2>&1

if grep -q "OutOfMemoryError" /tmp/backend_logs.txt; then
    log "⚠️  CRITICAL: Java OutOfMemoryError detected in backend logs!"
elif grep -q "Exception" /tmp/backend_logs.txt; then
    log "⚠️  Exceptions found in backend logs:"
    grep -C 2 "Exception" /tmp/backend_logs.txt | tail -n 20 | tee -a "$LOG_FILE"
else
    log "✅ No obvious crash errors in last 50 lines of backend logs."
fi

log ""
log "--- 6. Java Process Limit Check ---"
# Remind user about the config
log "Current Backend Config (from Dockerfile logic):"
log "Max Heap (Xmx) might be set to 4096m (4GB). Check if your server has 4GB+ RAM."

log ""
log "=== Analysis Complete ==="
log "Report saved to: $LOG_FILE"
