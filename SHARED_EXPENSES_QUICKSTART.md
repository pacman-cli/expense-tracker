# Shared Expenses - Quick Start Guide

Get the Shared Expenses feature up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
**Verify**: Backend should be running on `http://localhost:8080`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
**Verify**: Frontend should be running on `http://localhost:3000`

### 3. Login
Navigate to `http://localhost:3000` and login with your credentials.

---

## 🎯 Testing the Feature

### Step 1: Create a Regular Expense (Required First!)
1. Go to `http://localhost:3000/expenses`
2. Click **"Add Expense"**
3. Fill in:
   - **Amount**: 100
   - **Description**: "Team Lunch"
   - **Category**: Food
   - **Date**: Today
4. Click **"Save"**
5. **Note the expense ID** from the URL or list

### Step 2: Create a Shared Expense via API

**Get Your Auth Token** (check browser DevTools → Network → Any API call → Headers → Authorization)

**Create a shared expense** using curl or Postman:

```bash
curl -X POST http://localhost:8080/api/shared-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "expenseId": 1,
    "description": "Team lunch at the office",
    "groupName": "Office Lunch",
    "splitType": "EQUAL",
    "participants": [
      {
        "userId": 2,
        "shareAmount": 0
      },
      {
        "externalName": "John External",
        "externalEmail": "john@example.com",
        "shareAmount": 0
      }
    ]
  }'
```

**Notes:**
- Replace `YOUR_TOKEN_HERE` with your actual token
- Replace `expenseId: 1` with your actual expense ID
- Replace `userId: 2` with an actual user ID from your database
- `shareAmount: 0` is ignored for EQUAL split (automatically calculated)

### Step 3: View in Frontend
1. Go to `http://localhost:3000/shared-expenses`
2. You should see:
   - ✅ Summary cards with your balance
   - ✅ The expense you just created
   - ✅ Participant list with payment status

### Step 4: Test Actions

#### As a Participant:
1. Find your expense in the "You Owe" tab
2. Click **"Pay My Share"**
3. ✅ Status should update to "Paid"

#### As the Payer:
1. Go to the "Owed to You" tab
2. Click **"Settle All"**
3. ✅ All participants marked as paid
4. ✅ Expense moved to settled

---

## 🧪 Test Different Split Types

### EQUAL Split (Already tested above)
Everyone pays the same amount.

### PERCENTAGE Split
```bash
curl -X POST http://localhost:8080/api/shared-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "expenseId": 2,
    "description": "Trip costs - unequal share",
    "groupName": "Weekend Trip",
    "splitType": "PERCENTAGE",
    "participants": [
      {
        "userId": 2,
        "sharePercentage": 60
      },
      {
        "userId": 3,
        "sharePercentage": 40
      }
    ]
  }'
```

### EXACT_AMOUNT Split
```bash
curl -X POST http://localhost:8080/api/shared-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "expenseId": 3,
    "description": "Custom amounts",
    "groupName": "Dinner",
    "splitType": "EXACT_AMOUNT",
    "participants": [
      {
        "userId": 2,
        "shareAmount": 45.50
      },
      {
        "userId": 3,
        "shareAmount": 54.50
      }
    ]
  }'
```

### SHARES Split
```bash
curl -X POST http://localhost:8080/api/shared-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "expenseId": 4,
    "description": "Pizza - by slice",
    "groupName": "Office",
    "splitType": "SHARES",
    "participants": [
      {
        "userId": 2,
        "shareUnits": 3
      },
      {
        "userId": 3,
        "shareUnits": 5
      }
    ]
  }'
```

---

## 🎮 Feature Testing Checklist

- [ ] View all expenses
- [ ] View "You Owe" tab
- [ ] View "Owed to You" tab
- [ ] Search for an expense
- [ ] Filter by group
- [ ] Pay your share as participant
- [ ] Settle all as payer
- [ ] Delete an expense (no payments made)
- [ ] View summary dashboard
- [ ] Check payment progress bars
- [ ] View participant payment status

---

## 🔍 Verify Everything Works

### Check Summary Endpoint
```bash
curl -X GET http://localhost:8080/api/shared-expenses/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "totalYouOwe": 25.00,
  "totalOwedToYou": 50.00,
  "netBalance": 25.00,
  "unsettledExpensesCount": 2
}
```

### Check All Expenses
```bash
curl -X GET http://localhost:8080/api/shared-expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Should return an array of all your shared expenses.

---

## ❓ Common Issues

### "User not found"
**Solution**: Replace `userId` values with actual user IDs from your database
```sql
SELECT id, email FROM users LIMIT 5;
```

### "Expense not found"
**Solution**: Replace `expenseId` with actual expense ID from your database
```sql
SELECT id, description, amount FROM expenses WHERE user_id = YOUR_USER_ID;
```

### "Failed to fetch shared expenses"
**Solution**: 
1. Check backend is running: `http://localhost:8080/actuator/health`
2. Check you're logged in
3. Check browser console for errors

### "Percentages must add up to 100"
**Solution**: For PERCENTAGE split, ensure all `sharePercentage` values sum to exactly 100

### "Frontend shows no data"
**Solution**:
1. Open browser DevTools → Network tab
2. Look for `/api/shared-expenses` call
3. Check if response has data
4. Verify no JavaScript errors in Console

---

## 🎯 Quick Test Script

Run this to test all major features:

```bash
#!/bin/bash
TOKEN="YOUR_TOKEN_HERE"
BASE_URL="http://localhost:8080/api"

# 1. Get summary
echo "=== Testing Summary ==="
curl -X GET "$BASE_URL/shared-expenses/summary" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get all expenses
echo -e "\n\n=== Testing Get All ==="
curl -X GET "$BASE_URL/shared-expenses" \
  -H "Authorization: Bearer $TOKEN"

# 3. Create a shared expense
echo -e "\n\n=== Testing Create ==="
curl -X POST "$BASE_URL/shared-expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "expenseId": 1,
    "description": "Test expense",
    "groupName": "Test Group",
    "splitType": "EQUAL",
    "participants": [
      {"userId": 2, "shareAmount": 0}
    ]
  }'

echo -e "\n\n✅ All tests completed!"
```

---

## 📚 Next Steps

1. ✅ **Feature is working?** Great! Check out `SHARED_EXPENSES_GUIDE.md` for detailed documentation
2. 🎨 **Want to customize?** See the Developer Notes section in the guide
3. 🚀 **Ready for production?** Review the Security & Permissions section
4. 🐛 **Found a bug?** Check `SHARED_EXPENSES_IMPROVEMENTS.md` for known limitations

---

## 🎉 Success!

If you can:
- ✅ Create a shared expense via API
- ✅ See it in the frontend
- ✅ Mark payments
- ✅ Settle expenses
- ✅ View correct summaries

**The feature is working perfectly!** 🚀

For more details, see:
- `SHARED_EXPENSES_GUIDE.md` - Complete documentation
- `SHARED_EXPENSES_IMPROVEMENTS.md` - All improvements made

---

## 💡 Pro Tips

1. **Use descriptive group names** like "Vegas Trip 2024" instead of just "Trip"
2. **Settle expenses regularly** to keep accurate balances
3. **Check the summary dashboard** before asking who owes what
4. **Use EQUAL split** for simple scenarios - it's the easiest
5. **Test with small amounts first** before real expenses

**Happy splitting!** 💰✨