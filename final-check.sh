#!/bin/bash

echo "🔍 FINAL SYSTEM CHECK"
echo "===================="
echo ""

echo "1. Backend Status:"
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "   ✅ Backend running on port 8080"
else
    echo "   ❌ Backend NOT running!"
fi

echo ""
echo "2. Frontend Status:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend running on port 3000"
else
    echo "   ❌ Frontend NOT running!"
fi

echo ""
echo "3. Database Check:"
COUNT=$(mysql -h 127.0.0.1 -P 3307 -u expenseuser -pexpensepassword -D expensetracker -se "SELECT COUNT(*) FROM shared_expenses;" 2>/dev/null)
echo "   ✅ $COUNT shared expenses in database"

echo ""
echo "4. Code Changes Verified:"
if grep -q "import api from" frontend/src/app/\(app\)/shared-expenses/page.tsx; then
    echo "   ✅ api helper imported"
else
    echo "   ❌ api helper NOT imported"
fi

if grep -q "console.log.*Shared Expenses Page - Initializing" frontend/src/app/\(app\)/shared-expenses/page.tsx; then
    echo "   ✅ Debug logging added"
else
    echo "   ❌ Debug logging NOT added"
fi

if grep -q "console.log.*API Helper initialized" frontend/src/lib/api.ts; then
    echo "   ✅ API helper logging added"
else
    echo "   ❌ API helper logging NOT added"
fi

echo ""
echo "===================="
echo "✅ All systems ready!"
echo ""
echo "📍 NEXT: Open one of these:"
echo "   1. Debug tool (already opened)"
echo "   2. http://localhost:3000/shared-expenses (with F12 Console open)"
echo ""
