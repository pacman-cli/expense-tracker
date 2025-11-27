#!/bin/bash

echo "🧪 SHARED EXPENSES API TEST"
echo "============================"
echo ""

# Get backend health
echo "1️⃣ Backend Health Check..."
curl -s http://localhost:8080/actuator/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Backend is running on port 8080"
else
    echo "   ❌ Backend is NOT running!"
    exit 1
fi

echo ""
echo "2️⃣ Database Check..."
DB_COUNT=$(mysql -h 127.0.0.1 -P 3307 -u expenseuser -pexpensepassword -D expensetracker -se "SELECT COUNT(*) FROM shared_expenses;" 2>/dev/null)
echo "   ✅ Found $DB_COUNT shared expenses in database"

echo ""
echo "3️⃣ Testing API with authentication..."
echo "   (You need to be logged in on the website first)"
echo ""
echo "   Go to http://localhost:3000/shared-expenses"
echo "   Open DevTools (F12) and run this in Console:"
echo ""
echo "   fetch('http://localhost:8080/api/shared-expenses', {"
echo "     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') }"
echo "   }).then(r => r.json()).then(console.log)"
echo ""

echo "============================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you're logged in at http://localhost:3000/login"
echo "2. Go to http://localhost:3000/shared-expenses"
echo "3. You should see 3 expenses without network errors"
echo ""
echo "If you see errors, check:"
echo "  - Browser Console (F12)"
echo "  - Network tab for failed requests"
echo "  - backend.log for server errors"
echo ""
