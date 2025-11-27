# Shared Expenses Feature - Complete Guide

## Overview

The Shared Expenses feature allows users to split bills and expenses with friends, family, or colleagues. It provides comprehensive tracking of who owes what, automatic split calculations, and settlement management.

## ✨ Features

### Core Functionality
- ✅ **Multiple Split Types**: Equal, Percentage, Exact Amount, and Shares
- ✅ **Automatic Calculations**: Smart distribution of expenses among participants
- ✅ **Payment Tracking**: Track who has paid and who hasn't
- ✅ **Settlement Management**: Mark individual payments or settle entire expenses
- ✅ **Real-time Summary**: See at-a-glance who owes you and what you owe
- ✅ **Group Organization**: Organize expenses by groups (e.g., "Weekend Trip", "Dinner")
- ✅ **External Participants**: Include people who aren't registered users

### Backend Features
- Independent transaction management for data integrity
- Comprehensive error handling and validation
- Detailed logging for troubleshooting
- RESTful API endpoints
- Automatic share validation

### Frontend Features
- Responsive, modern UI with animations
- Real-time updates after actions
- Tab-based filtering (All, You Owe, Owed to You)
- Search and group filtering
- Loading states and error handling
- Confirmation dialogs for destructive actions

---

## 🚀 Getting Started

### Prerequisites
1. Backend must be running on `http://localhost:8080`
2. Frontend must be running on `http://localhost:3000`
3. User must be authenticated
4. MySQL database must have the required tables

### Database Tables
The feature uses two main tables:
- `shared_expenses`: Main expense records
- `shared_expense_participants`: Participant details and payment status

---

## 📖 How to Use

### Step 1: Create a Regular Expense First
Before splitting an expense, you need to create a regular expense:
1. Go to `/expenses`
2. Click "Add Expense"
3. Fill in details (amount, description, category, date)
4. Save the expense

### Step 2: Navigate to Shared Expenses
1. Go to `/shared-expenses`
2. You'll see the dashboard with summary cards

### Step 3: Create a Shared Expense
Currently, shared expenses must be created via API. Here's an example:

```bash
curl -X POST http://localhost:8080/api/shared-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expenseId": 1,
    "description": "Dinner at restaurant",
    "groupName": "Weekend Trip",
    "splitType": "EQUAL",
    "participants": [
      {
        "userId": 2,
        "shareAmount": 25.00
      },
      {
        "externalName": "John Doe",
        "externalEmail": "john@example.com",
        "shareAmount": 25.00
      }
    ]
  }'
```

### Step 4: Manage the Expense
On the Shared Expenses page, you can:
- **View Details**: See all participants and their payment status
- **Pay Your Share**: Click "Pay My Share" if you're a participant
- **Settle All**: If you're the payer, mark everyone as paid
- **Delete**: Remove the expense if no payments have been made

---

## 🔧 API Endpoints

### GET `/api/shared-expenses`
Get all shared expenses for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "expense": {
      "description": "Dinner",
      "date": "2024-01-01",
      "category": { "name": "Food" }
    },
    "totalAmount": 100.00,
    "paidBy": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "splitType": "EQUAL",
    "isSettled": false,
    "groupName": "Weekend Trip",
    "participants": [...]
  }
]
```

### GET `/api/shared-expenses/{id}`
Get a specific shared expense.

### GET `/api/shared-expenses/summary`
Get summary of amounts owed/owing.

**Response:**
```json
{
  "totalYouOwe": 50.00,
  "totalOwedToYou": 75.00,
  "netBalance": 25.00,
  "unsettledExpensesCount": 3
}
```

### POST `/api/shared-expenses`
Create a new shared expense.

**Request Body:**
```json
{
  "expenseId": 1,
  "description": "Optional description",
  "groupName": "Optional group name",
  "splitType": "EQUAL",
  "participants": [
    {
      "userId": 2,
      "shareAmount": 50.00
    },
    {
      "externalName": "Jane Doe",
      "externalEmail": "jane@example.com",
      "shareAmount": 50.00
    }
  ]
}
```

### PUT `/api/shared-expenses/{id}`
Update an existing shared expense (only the payer can update).

### DELETE `/api/shared-expenses/{id}`
Delete a shared expense (only if no payments made).

### POST `/api/shared-expenses/{expenseId}/participants/{participantId}/pay`
Mark a participant's share as paid.

### POST `/api/shared-expenses/{expenseId}/settle`
Settle the entire expense (mark all participants as paid).

---

## 💡 Split Types Explained

### 1. EQUAL
Splits the total amount equally among all participants.

**Example:** $100 expense with 4 participants = $25 each

**API Request:**
```json
{
  "splitType": "EQUAL",
  "participants": [
    { "userId": 1 },
    { "userId": 2 },
    { "userId": 3 },
    { "userId": 4 }
  ]
}
```
*Note: `shareAmount` is calculated automatically*

### 2. PERCENTAGE
Each participant pays a specific percentage of the total.

**Example:** $100 expense
- Person A: 50% = $50
- Person B: 30% = $30
- Person C: 20% = $20

**API Request:**
```json
{
  "splitType": "PERCENTAGE",
  "participants": [
    { "userId": 1, "sharePercentage": 50.00 },
    { "userId": 2, "sharePercentage": 30.00 },
    { "userId": 3, "sharePercentage": 20.00 }
  ]
}
```
*Note: Percentages must add up to 100*

### 3. EXACT_AMOUNT
Specify exact amount each participant owes.

**Example:** $100 expense
- Person A: $60
- Person B: $40

**API Request:**
```json
{
  "splitType": "EXACT_AMOUNT",
  "participants": [
    { "userId": 1, "shareAmount": 60.00 },
    { "userId": 2, "shareAmount": 40.00 }
  ]
}
```
*Note: Amounts must add up to total*

### 4. SHARES
Split by units/shares (e.g., if some ate more than others).

**Example:** $100 expense, total 10 shares
- Person A: 6 shares = $60
- Person B: 4 shares = $40

**API Request:**
```json
{
  "splitType": "SHARES",
  "participants": [
    { "userId": 1, "shareUnits": 6 },
    { "userId": 2, "shareUnits": 4 }
  ]
}
```

---

## 🎯 User Interface Guide

### Dashboard Cards
1. **You Owe**: Total amount you owe to others
2. **Owed to You**: Total amount others owe you
3. **Net Balance**: Your net position (positive = people owe you)
4. **Active**: Number of unsettled expenses

### Tab Filters
- **All Expenses**: Shows all shared expenses
- **You Owe**: Shows only expenses where you haven't paid
- **Owed to You**: Shows expenses where you're the payer

### Expense Card Information
Each expense card shows:
- **Title**: Expense description
- **Amount**: Total expense amount
- **Split Type**: How the expense was divided
- **Group/Category**: Organization labels
- **Date**: When the expense occurred
- **Payer Info**: Who paid the expense
- **Payment Progress**: Visual bar showing payment completion
- **Participants**: List of all participants with payment status

### Actions Available
- **Pay My Share**: Mark your portion as paid (if you're a participant)
- **Settle All**: Mark everyone as paid (if you're the payer)
- **Delete**: Remove the expense (if no payments made and you're the payer)

---

## 🔒 Security & Permissions

### Access Control
- Users can only view expenses they're involved in (as payer or participant)
- Only the payer can:
  - Update the expense
  - Settle the entire expense
  - Delete the expense (if no payments made)
- Participants can mark their own share as paid

### Validation
- All monetary amounts are validated
- Split calculations are verified (must match total amount)
- Percentages must sum to 100
- User existence is verified
- External participants must have a name

---

## 🐛 Troubleshooting

### "Failed to fetch shared expenses"
**Cause**: Backend not running or not authenticated
**Solution**: 
1. Check backend is running: `http://localhost:8080`
2. Verify you're logged in
3. Check browser console for detailed error

### "User not found"
**Cause**: Participant user ID doesn't exist
**Solution**: Use valid user IDs from your database

### "Percentages must add up to 100"
**Cause**: Using PERCENTAGE split type with invalid percentages
**Solution**: Ensure all `sharePercentage` values sum to exactly 100

### "Total participant shares do not match expense total"
**Cause**: Using EXACT_AMOUNT with amounts that don't sum correctly
**Solution**: Verify all `shareAmount` values add up to the expense total

### "Cannot delete expense with payments already made"
**Cause**: Trying to delete an expense where someone has paid
**Solution**: This is by design to maintain payment history integrity

### "Only the payer can update/delete/settle this shared expense"
**Cause**: Trying to perform payer-only actions as a participant
**Solution**: Only the person who paid the expense can manage it

---

## 📊 Example Scenarios

### Scenario 1: Equal Split Dinner
**Situation**: 4 friends went to dinner, bill was $120, you paid

**Steps:**
1. Create expense: $120 "Dinner at Restaurant"
2. Create shared expense with `splitType: "EQUAL"`
3. Add 3 friends as participants
4. System calculates: $30 per person
5. Friends mark their shares as paid
6. You settle the expense

### Scenario 2: Unequal Trip Costs
**Situation**: 3-day trip, different people paid different amounts

**Steps:**
1. Create multiple expenses for hotel, meals, activities
2. For each expense, create shared expense
3. Use different split types based on situation:
   - Hotel: EQUAL (everyone stayed)
   - Meals: EXACT_AMOUNT (some ate more expensive meals)
   - Activities: PERCENTAGE (some didn't participate in everything)
4. At end of trip, use summary to see net balance
5. Settle up based on who owes whom

### Scenario 3: Mixed User Types
**Situation**: Paid for dinner including non-registered friends

**Steps:**
1. Create expense: $150 "Group Dinner"
2. Create shared expense
3. Add registered users by `userId`
4. Add non-registered friends with `externalName` and `externalEmail`
5. Track payments separately for external participants

---

## 🚧 Known Limitations & Future Enhancements

### Current Limitations
- No UI for creating shared expenses (must use API)
- Cannot send email reminders to participants
- No export/download functionality
- Cannot edit participants after creation (must delete and recreate)
- No recurring shared expenses

### Planned Enhancements
- ✨ Modal UI for creating shared expenses from frontend
- 📧 Email notifications to participants
- 📄 Export expense summaries as PDF
- 💬 Reminder system for unpaid shares
- 🔄 Edit participant list
- 📱 Mobile app integration
- 💰 Settlement suggestions (optimal way to settle complex scenarios)
- 📊 Analytics and spending insights

---

## 🎓 Best Practices

1. **Always create the regular expense first** before converting to shared
2. **Use descriptive group names** for better organization
3. **Settle expenses promptly** to maintain accurate balances
4. **Verify split calculations** before creating the expense
5. **Use external participants** for people not in the system
6. **Check the summary regularly** to track your overall balance
7. **Communicate with participants** before settling or deleting

---

## 🆘 Support

If you encounter issues:
1. Check this documentation first
2. Review browser console for errors
3. Check backend logs: `backend/logs/application.log`
4. Verify database connection
5. Test API endpoints directly with curl or Postman

---

## 📝 Developer Notes

### Backend Architecture
- Service layer: `SharedExpenseService.java`
- Controller: `SharedExpenseController.java`
- Entities: `SharedExpense.java`, `SharedExpenseParticipant.java`
- Repository: `SharedExpenseRepository.java`
- DTOs: `SharedExpenseDTO.java`, `SharedExpenseParticipantDTO.java`

### Transaction Management
- Independent transactions using `REQUIRES_NEW` propagation
- Prevents partial failures from rolling back successful operations
- Each method has its own transaction boundary

### Frontend Architecture
- Page: `frontend/src/app/(app)/shared-expenses/page.tsx`
- Uses React hooks for state management
- Framer Motion for animations
- Lucide React for icons
- Real-time data fetching and updates

---

## 🎉 Summary

The Shared Expenses feature provides a robust solution for splitting bills and tracking shared costs. With multiple split types, automatic calculations, and comprehensive tracking, it makes managing group expenses simple and transparent.

**Key Takeaways:**
- Create expenses first, then split them
- Use appropriate split types for different scenarios
- Track payments in real-time
- Settle expenses to maintain clear records
- Check your summary for overall balance

**Ready to split some bills? Start by creating an expense and converting it to a shared expense!** 💰