# 🚀 Nudge Engine - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Start Backend
```bash
cd backend
mvn spring-boot:run
```

Wait for: `Started ExpenseTrackerApplication`

### Step 2: Add Test Data
```bash
# Find your user ID first
mysql -u expenseuser -p -h localhost -P 3307 expensetracker -e "SELECT id, email FROM users;"

# Edit the SQL file and change @user_id = 1 to your actual user ID
nano test-data-for-nudges.sql

# Run the script
mysql -u expenseuser -p -h localhost -P 3307 expensetracker < test-data-for-nudges.sql
```

### Step 3: Generate Nudges
```bash
# Get your JWT token (login first at http://localhost:3000/login)
# Then replace YOUR_TOKEN below

curl -X POST http://localhost:8080/api/nudges/generate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: View Nudges
Open browser: `http://localhost:3000/nudges`

---

## ✅ What You Should See

### In Frontend:
- ✨ Beautiful nudge cards with icons
- 🎨 Color-coded by type (red=budget, orange=unusual, blue=bills, etc.)
- 🏷️ Priority badges (LOW, MEDIUM, HIGH, URGENT)
- 📊 Stats showing unread/total counts
- ✓ Mark as read button
- ✕ Dismiss button

### Expected Nudges (6-8 total):
1. **Budget Alert** - "High Spending Alert" (Food >₹10,000)
2. **Unusual Spending** - "Unusual Spending Detected" (Shopping spike)
3. **Bill Reminders** - 4 upcoming bills (Internet, Netflix, etc.)
4. **Savings Opportunity** - "Savings Opportunity" (Entertainment)
5. **Spending Insight** - "Monthly Spending Summary"

---

## 🔧 Troubleshooting

### Problem: "Failed to generate nudges"

**Solution 1:** Check backend logs
```bash
# Look for errors in terminal where mvn spring-boot:run is running
```

**Solution 2:** Verify table exists
```bash
mysql -u expenseuser -p -h localhost -P 3307 expensetracker -e "SHOW TABLES;"
# Should see 'nudges' in the list
```

**Solution 3:** Check if you have data
```bash
mysql -u expenseuser -p -h localhost -P 3307 expensetracker -e "
SELECT COUNT(*) as expense_count FROM expenses WHERE user_id = 1;
"
# Should have at least 10-15 expenses
```

### Problem: Empty nudge list

**Reason:** Not enough data to trigger nudges

**Solution:** Run the test data script again:
```bash
mysql -u expenseuser -p -h localhost -P 3307 expensetracker < test-data-for-nudges.sql
```

### Problem: "Table 'nudges' doesn't exist"

**Solution:** Restart backend
```bash
# Stop backend (Ctrl+C)
cd backend
mvn spring-boot:run
# Table will be auto-created
```

### Problem: 401 Unauthorized

**Solution:** Log in again
1. Go to `http://localhost:3000/login`
2. Log in with your credentials
3. Try generating nudges again

---

## 📊 API Quick Reference

### Generate Nudges
```bash
POST /api/nudges/generate
Authorization: Bearer {token}
```

### Get All Nudges
```bash
GET /api/nudges
Authorization: Bearer {token}
```

### Get Stats
```bash
GET /api/nudges/stats
Authorization: Bearer {token}
```

### Mark as Read
```bash
PUT /api/nudges/{id}/read
Authorization: Bearer {token}
```

### Dismiss Nudge
```bash
DELETE /api/nudges/{id}
Authorization: Bearer {token}
```

---

## 💡 Tips for Best Results

1. **Generate regularly** - Click "Generate Nudges" after adding new expenses
2. **Add variety** - Use different categories for richer insights
3. **Create recurring expenses** - Get bill reminders
4. **Track weekly** - Unusual spending alerts work better with regular data
5. **Review insights** - Monthly summaries help understand spending patterns

---

## 🎯 Nudge Types Explained

| Type | Trigger | Priority | Example |
|------|---------|----------|---------|
| **Budget Alert** | Spending >₹10k in category | HIGH/URGENT | "You spent ₹12,500 on Food" |
| **Unusual Spending** | 50%+ increase this week | HIGH | "Spending up 75% this week" |
| **Bill Reminder** | Recurring bill due in 7 days | HIGH/MEDIUM | "Netflix due in 3 days" |
| **Savings Opportunity** | High spending in category | LOW | "Consider budgeting for Entertainment" |
| **Spending Insight** | Monthly summary | LOW | "Top category: Food (45% of total)" |

---

## 🧪 Test Commands (All-in-One)

```bash
# Complete test sequence
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.accessToken')

curl -X POST http://localhost:8080/api/nudges/generate \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:8080/api/nudges \
  -H "Authorization: Bearer $TOKEN" | jq .

curl -X GET http://localhost:8080/api/nudges/stats \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## ✅ Success Checklist

- [ ] Backend running without errors
- [ ] `nudges` table exists in database
- [ ] Test data script executed successfully
- [ ] Can generate nudges via API (200 response)
- [ ] Frontend shows nudge cards
- [ ] Can mark nudges as read
- [ ] Can dismiss nudges
- [ ] Stats show correct counts

---

## 📚 Need More Help?

- **Full Documentation:** See `NUDGE_ENGINE_FIX.md`
- **Status Report:** See `AI_PREDICTIONS_NUDGES_STATUS.md`
- **Test Data Script:** See `test-data-for-nudges.sql`

---

**Time to Complete:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** ✅ Fully Working - No Code Changes Needed!