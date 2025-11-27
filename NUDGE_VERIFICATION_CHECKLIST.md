# ✅ Nudge Engine Verification Checklist

**Use this checklist to verify the nudge engine is working correctly**

---

## 🔍 Pre-Flight Checks

### 1. Backend Status
- [ ] Backend compiles successfully (`mvn compile`)
- [ ] Backend starts without errors (`mvn spring-boot:run`)
- [ ] Server listening on port 8080
- [ ] No stack traces in console

**Command to verify:**
```bash
cd backend
mvn clean compile
# Should show: BUILD SUCCESS
```

### 2. Database Setup
- [ ] MySQL running on port 3307
- [ ] Database `expensetracker` exists
- [ ] Can connect with credentials
- [ ] `nudges` table exists

**Commands to verify:**
```bash
mysql -u expenseuser -p -h localhost -P 3307 expensetracker -e "SHOW TABLES;"
# Should see 'nudges' in the list

mysql -u expenseuser -p -h localhost -P 3307 expensetracker -e "DESC nudges;"
# Should show table structure
```

### 3. User Account
- [ ] User account created
- [ ] Can log in successfully
- [ ] JWT token generated
- [ ] Token stored in localStorage

**Frontend check:**
```
Open browser console:
localStorage.getItem('accessToken')
// Should return a JWT token string
```

### 4. Test Data
- [ ] User has at least 10 expenses
- [ ] Multiple categories exist
- [ ] Expenses span multiple weeks
- [ ] (Optional) Recurring expenses created

**SQL verification:**
```sql
SELECT COUNT(*) FROM expenses WHERE user_id = YOUR_USER_ID;
-- Should be >= 10

SELECT COUNT(*) FROM categories WHERE user_id = YOUR_USER_ID;
-- Should be >= 2

SELECT COUNT(*) FROM recurring_expenses WHERE user_id = YOUR_USER_ID AND active = TRUE;
-- Optional, but helps trigger bill reminders
```

---

## 🧪 API Testing

### 5. Authentication
- [ ] POST `/api/auth/signin` returns 200
- [ ] Response includes `accessToken`
- [ ] Token can be used for authenticated requests

**Test command:**
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
# Should return JSON with accessToken
```

### 6. Generate Nudges Endpoint
- [ ] POST `/api/nudges/generate` returns 200
- [ ] Response: "Nudges generated successfully"
- [ ] No errors in backend logs

**Test command:**
```bash
curl -X POST http://localhost:8080/api/nudges/generate \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: "Nudges generated successfully"
```

### 7. Get Nudges Endpoint
- [ ] GET `/api/nudges` returns 200
- [ ] Response is JSON array
- [ ] Array contains nudge objects
- [ ] Each nudge has required fields

**Test command:**
```bash
curl -X GET http://localhost:8080/api/nudges \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return array of nudges
```

**Expected nudge structure:**
```json
{
  "id": 1,
  "type": "BUDGET_ALERT",
  "title": "High Spending Alert",
  "message": "You've spent ৳12,500...",
  "priority": "HIGH",
  "isRead": false,
  "createdAt": "2024-01-26T10:30:00",
  "actionUrl": "/expenses"
}
```

### 8. Get Stats Endpoint
- [ ] GET `/api/nudges/stats` returns 200
- [ ] Response includes unreadCount
- [ ] Response includes totalCount
- [ ] Response includes readCount

**Test command:**
```bash
curl -X GET http://localhost:8080/api/nudges/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: {"unreadCount":5,"totalCount":8,"readCount":3}
```

### 9. Mark as Read Endpoint
- [ ] PUT `/api/nudges/{id}/read` returns 200
- [ ] Response includes updated nudge
- [ ] `isRead` field is now true

**Test command:**
```bash
curl -X PUT http://localhost:8080/api/nudges/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return nudge with isRead: true
```

### 10. Dismiss Nudge Endpoint
- [ ] DELETE `/api/nudges/{id}` returns 200
- [ ] Response confirms deletion
- [ ] Nudge removed from database

**Test command:**
```bash
curl -X DELETE http://localhost:8080/api/nudges/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: {"message":"Nudge dismissed successfully"}
```

---

## 🎨 Frontend Testing

### 11. Nudges Page Loads
- [ ] Navigate to `/nudges` (http://localhost:3000/nudges)
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Header shows "Smart Nudges"

### 12. UI Elements Present
- [ ] "Generate Nudges" button visible
- [ ] Stats cards visible (Total, Unread, Read)
- [ ] Filter dropdown/tabs visible
- [ ] Proper styling and colors

### 13. Generate Nudges Button
- [ ] Click "Generate Nudges" button
- [ ] Loading state shows (spinner/disabled)
- [ ] Success toast appears
- [ ] Nudge cards appear after generation

### 14. Nudge Cards Display
- [ ] Cards render with proper styling
- [ ] Each card shows icon for type
- [ ] Priority badge visible
- [ ] Title and message visible
- [ ] Action button visible
- [ ] Mark as read icon visible
- [ ] Dismiss (X) icon visible

### 15. Card Interactions
- [ ] Click mark as read icon
- [ ] Card visual state changes
- [ ] Unread count decreases
- [ ] Click dismiss icon
- [ ] Card animates out
- [ ] Card removed from list
- [ ] Total count decreases

### 16. Filter Functionality
- [ ] Can filter by "All"
- [ ] Can filter by specific type
- [ ] Only matching nudges show
- [ ] Count updates correctly

### 17. Stats Accuracy
- [ ] Total count matches database
- [ ] Unread count matches unread nudges
- [ ] Read count = Total - Unread
- [ ] Updates in real-time after actions

---

## 🎯 Nudge Type Verification

### 18. Budget Alert Nudge
- [ ] Appears when category spending >₹10,000
- [ ] Priority is HIGH or URGENT
- [ ] Icon is dollar sign (💰)
- [ ] Red/orange color scheme
- [ ] Message mentions category and amount

**Trigger:** Add expenses totaling >₹10,000 in one category this month

### 19. Unusual Spending Nudge
- [ ] Appears when weekly spending increases 50%+
- [ ] Priority is HIGH
- [ ] Icon is trending up (📈)
- [ ] Orange/yellow color scheme
- [ ] Message mentions percentage increase

**Trigger:** Add high expenses this week, low expenses previous week

### 20. Bill Reminder Nudge
- [ ] Appears for recurring expenses due in 7 days
- [ ] Priority is HIGH or MEDIUM
- [ ] Icon is calendar (📅)
- [ ] Blue color scheme
- [ ] Message mentions bill name and due date

**Trigger:** Create recurring expense with next_due_date within 7 days

### 21. Savings Opportunity Nudge
- [ ] Appears for categories with 5+ expenses >₹5,000
- [ ] Priority is LOW
- [ ] Icon is lightbulb (💡)
- [ ] Green color scheme
- [ ] Message suggests budgeting

**Trigger:** Add 5+ expenses in one category totaling >₹5,000

### 22. Spending Insight Nudge
- [ ] Appears with monthly summary
- [ ] Priority is LOW
- [ ] Icon is chart (📊)
- [ ] Yellow/amber color scheme
- [ ] Message includes transaction count and top category

**Trigger:** Automatically generated when expenses exist

---

## 📊 Database Verification

### 23. Nudges Table
- [ ] Table created successfully
- [ ] Has all required columns
- [ ] Foreign key to users table exists
- [ ] Indexes created properly

**SQL check:**
```sql
DESC nudges;
SHOW CREATE TABLE nudges;
```

### 24. Nudge Records
- [ ] Records inserted after generation
- [ ] user_id matches current user
- [ ] type is valid enum value
- [ ] priority is valid enum value
- [ ] created_at is populated
- [ ] is_read defaults to 0 (false)

**SQL check:**
```sql
SELECT * FROM nudges WHERE user_id = YOUR_USER_ID;
```

### 25. Data Integrity
- [ ] No orphaned nudges (user_id references existing user)
- [ ] No null required fields
- [ ] Timestamps are correct
- [ ] isRead values are 0 or 1

---

## 🔒 Security Verification

### 26. Authentication
- [ ] Cannot access nudges without token (401)
- [ ] Expired tokens rejected (401)
- [ ] Invalid tokens rejected (401)
- [ ] Only user's own nudges returned

**Test:**
```bash
# Without token (should fail)
curl -X GET http://localhost:8080/api/nudges
# Should return 401 Unauthorized

# With valid token (should succeed)
curl -X GET http://localhost:8080/api/nudges \
  -H "Authorization: Bearer VALID_TOKEN"
# Should return nudges
```

### 27. Authorization
- [ ] Cannot view other users' nudges
- [ ] Cannot mark other users' nudges as read
- [ ] Cannot dismiss other users' nudges
- [ ] User ID verified on all endpoints

---

## 🚀 Performance Verification

### 28. Response Times
- [ ] Generate nudges: < 2 seconds
- [ ] Get nudges: < 500ms
- [ ] Mark as read: < 300ms
- [ ] Dismiss: < 300ms
- [ ] Get stats: < 200ms

**Use browser DevTools Network tab to check**

### 29. Frontend Performance
- [ ] Page loads in < 2 seconds
- [ ] Animations smooth (60fps)
- [ ] No layout shifts
- [ ] Images/icons load quickly

---

## 📱 Cross-Browser Testing

### 30. Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### 31. Responsive Design
- [ ] Desktop (1920x1080) ✓
- [ ] Laptop (1366x768) ✓
- [ ] Tablet (768x1024) ✓
- [ ] Mobile (375x667) ✓

---

## ✅ Final Checks

### 32. User Experience
- [ ] Nudges are helpful and actionable
- [ ] Messages are clear and concise
- [ ] Priority levels make sense
- [ ] Action URLs navigate correctly
- [ ] Toast notifications appear
- [ ] Loading states show appropriately

### 33. Error Handling
- [ ] Network errors show toast
- [ ] API errors handled gracefully
- [ ] Empty states shown when no nudges
- [ ] 401 errors redirect to login
- [ ] 500 errors show user-friendly message

### 34. Documentation
- [ ] README files created
- [ ] Quick start guide available
- [ ] Test data script provided
- [ ] API documentation complete
- [ ] Troubleshooting guide available

---

## 🎉 Success Criteria

**All checks must pass for nudge engine to be considered fully working:**

### Critical (Must Pass)
- ✅ Backend compiles without errors
- ✅ Nudges table exists
- ✅ API returns 200 for all endpoints
- ✅ Frontend displays nudges correctly
- ✅ Can generate, read, and dismiss nudges

### Important (Should Pass)
- ✅ All 5 nudge types can be triggered
- ✅ Stats are accurate
- ✅ Security checks pass
- ✅ No console errors

### Nice to Have (Optional)
- ✅ Performance within targets
- ✅ Cross-browser compatibility
- ✅ Responsive on all devices

---

## 📝 Test Results Template

```
Test Date: __________
Tester: __________
Environment: Development / Staging / Production

Pre-Flight Checks:        [  ] Pass  [  ] Fail
API Testing:              [  ] Pass  [  ] Fail
Frontend Testing:         [  ] Pass  [  ] Fail
Nudge Type Verification:  [  ] Pass  [  ] Fail
Database Verification:    [  ] Pass  [  ] Fail
Security Verification:    [  ] Pass  [  ] Fail
Performance Verification: [  ] Pass  [  ] Fail

Overall Status: [  ] PASS  [  ] FAIL

Notes:
_____________________________________________
_____________________________________________
_____________________________________________

Issues Found:
1. _________________________________________
2. _________________________________________
3. _________________________________________

Recommendations:
1. _________________________________________
2. _________________________________________
3. _________________________________________
```

---

## 🔄 Re-Test After Fixes

If any checks fail:
1. Document the failure
2. Apply fixes from NUDGE_ENGINE_FIX.md
3. Re-run only failed checks
4. Verify fix didn't break other features
5. Update this checklist

---

## 📞 Support

If multiple checks fail:
- Review NUDGE_QUICK_START.md (5-min setup)
- Review NUDGE_ENGINE_FIX.md (comprehensive guide)
- Check backend logs for errors
- Verify database connection
- Ensure test data exists

---

**Checklist Version:** 1.0  
**Last Updated:** January 26, 2024  
**Status:** Ready for Use ✅