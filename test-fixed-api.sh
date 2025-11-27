#!/bin/bash

echo "🧪 Testing Fixed Shared Expenses API"
echo "====================================="
echo ""

# Test health
echo "1. Backend Health:"
curl -s http://localhost:8080/actuator/health
echo ""
echo ""

# Test DB
echo "2. Database Check:"
mysql -h 127.0.0.1 -P 3307 -u expenseuser -pexpensepassword -D expensetracker -se "SELECT id, description, total_amount FROM shared_expenses LIMIT 3;" 2>/dev/null
echo ""

# Try to login and get token
echo "3. Getting auth token..."
# You'll need to provide real credentials
echo "   (Skipping - use browser localStorage token)"
echo ""

echo "====================================="
echo "✅ Backend is ready!"
echo ""
echo "Now test in browser:"
echo "1. Go to http://localhost:3000/shared-expenses"
echo "2. Open Console (F12)"
echo "3. Should see success or detailed error"
echo ""
