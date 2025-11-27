#!/bin/bash

# Login and generate nudges for testing
echo "Logging in as guest@example.com..."

# Login to get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@example.com","password":"password"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login. Check credentials."
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:20}..."

# Generate nudges
echo ""
echo "Generating nudges..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/nudges/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $RESPONSE"

# Fetch generated nudges
echo ""
echo "Fetching generated nudges..."
curl -s http://localhost:8080/api/nudges \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Done! Check http://localhost:3000/nudges"
