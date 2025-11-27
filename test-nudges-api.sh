#!/bin/bash

echo "🔐 Logging in as guest@example.com..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Trying other passwords..."
    
    # Try password without 123
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"guest@example.com","password":"password"}')
    
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Still failed. Response:"
    echo $LOGIN_RESPONSE
    exit 1
fi

echo "✅ Login successful!"

echo ""
echo "📥 Fetching nudges..."
NUDGES=$(curl -s http://localhost:8080/api/nudges \
  -H "Authorization: Bearer $TOKEN")

echo "$NUDGES" | python3 -m json.tool 2>/dev/null || echo "$NUDGES"

echo ""
echo "📊 Fetching stats..."
curl -s http://localhost:8080/api/nudges/stats \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool 2>/dev/null
