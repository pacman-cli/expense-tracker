#!/bin/bash

echo "Testing Shared Expenses API..."
echo ""

# Test without auth
echo "1. Testing without authentication:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080/api/shared-expenses

echo ""
echo "2. Testing with dummy token:"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer dummy" \
  http://localhost:8080/api/shared-expenses | head -5

echo ""
echo "3. Checking backend logs for SharedExpense errors:"
tail -50 backend.log 2>/dev/null | grep -i "sharedexpense\|shared-expense" | tail -10

echo ""
echo "4. Checking if SharedExpenseService exists:"
find backend/src -name "SharedExpenseService.java" -exec echo "✅ Found: {}" \;

echo ""
