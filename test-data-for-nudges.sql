-- ============================================
-- Test Data Generator for Nudge Engine
-- ============================================
-- This script creates realistic test data to trigger all nudge types
-- Run this after setting up your database and creating a user account

-- IMPORTANT: Replace @user_id with your actual user ID
-- To find your user ID: SELECT id, email FROM users;
SET @user_id = 1; -- CHANGE THIS TO YOUR USER ID

-- Get or create test categories
SET @food_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Food' LIMIT 1);
SET @transport_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Transport' LIMIT 1);
SET @entertainment_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Entertainment' LIMIT 1);
SET @utilities_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Utilities' LIMIT 1);
SET @shopping_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Shopping' LIMIT 1);

-- Create categories if they don't exist
INSERT IGNORE INTO categories (user_id, name, color, icon, created_at, updated_at)
VALUES
    (@user_id, 'Food', '#FF6B6B', '🍔', NOW(), NOW()),
    (@user_id, 'Transport', '#4ECDC4', '🚗', NOW(), NOW()),
    (@user_id, 'Entertainment', '#95E1D3', '🎬', NOW(), NOW()),
    (@user_id, 'Utilities', '#F38181', '💡', NOW(), NOW()),
    (@user_id, 'Shopping', '#AA96DA', '🛍️', NOW(), NOW());

-- Update category IDs after insert
SET @food_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Food' LIMIT 1);
SET @transport_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Transport' LIMIT 1);
SET @entertainment_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Entertainment' LIMIT 1);
SET @utilities_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Utilities' LIMIT 1);
SET @shopping_category = (SELECT id FROM categories WHERE user_id = @user_id AND name = 'Shopping' LIMIT 1);

-- ============================================
-- 1. HIGH SPENDING PATTERN (Triggers: BUDGET_ALERT)
-- ============================================
-- Add expenses totaling >10,000 BDT in Food category this month
INSERT INTO expenses (user_id, category_id, amount, date, description, created_at, updated_at)
VALUES
    (@user_id, @food_category, 2500.00, CURDATE(), 'Restaurant dinner with family', NOW(), NOW()),
    (@user_id, @food_category, 3200.00, CURDATE() - INTERVAL 2 DAY, 'Grocery shopping', NOW(), NOW()),
    (@user_id, @food_category, 1800.00, CURDATE() - INTERVAL 5 DAY, 'Office lunch orders', NOW(), NOW()),
    (@user_id, @food_category, 2800.00, CURDATE() - INTERVAL 8 DAY, 'Weekend dining out', NOW(), NOW()),
    (@user_id, @food_category, 1500.00, CURDATE() - INTERVAL 12 DAY, 'Party catering', NOW(), NOW());

-- ============================================
-- 2. UNUSUAL SPENDING PATTERN (Triggers: UNUSUAL_SPENDING)
-- ============================================
-- Previous week: Low spending
INSERT INTO expenses (user_id, category_id, amount, date, description, created_at, updated_at)
VALUES
    (@user_id, @shopping_category, 500.00, CURDATE() - INTERVAL 10 DAY, 'Small purchase', NOW(), NOW()),
    (@user_id, @shopping_category, 600.00, CURDATE() - INTERVAL 11 DAY, 'Basic items', NOW(), NOW());

-- Current week: High spending (>50% increase)
INSERT INTO expenses (user_id, category_id, amount, date, description, created_at, updated_at)
VALUES
    (@user_id, @shopping_category, 4500.00, CURDATE() - INTERVAL 1 DAY, 'Electronics purchase', NOW(), NOW()),
    (@user_id, @shopping_category, 3200.00, CURDATE() - INTERVAL 2 DAY, 'Clothing shopping spree', NOW(), NOW()),
    (@user_id, @shopping_category, 2800.00, CURDATE() - INTERVAL 3 DAY, 'Home appliances', NOW(), NOW());

-- ============================================
-- 3. RECURRING EXPENSES (Triggers: BILL_REMINDER)
-- ============================================
-- Create recurring bills due in 3-5 days
INSERT INTO recurring_expenses (user_id, category_id, description, amount, frequency, start_date, next_due_date, active, created_at, updated_at)
VALUES
    (@user_id, @utilities_category, 'Internet Bill', 1200.00, 'MONTHLY', '2024-01-01', DATE_ADD(CURDATE(), INTERVAL 3 DAY), TRUE, NOW(), NOW()),
    (@user_id, @entertainment_category, 'Netflix Subscription', 799.00, 'MONTHLY', '2024-01-01', DATE_ADD(CURDATE(), INTERVAL 5 DAY), TRUE, NOW(), NOW()),
    (@user_id, @utilities_category, 'Electricity Bill', 2500.00, 'MONTHLY', '2024-01-01', DATE_ADD(CURDATE(), INTERVAL 4 DAY), TRUE, NOW(), NOW()),
    (@user_id, @entertainment_category, 'Spotify Premium', 149.00, 'MONTHLY', '2024-01-01', DATE_ADD(CURDATE(), INTERVAL 6 DAY), TRUE, NOW(), NOW());

-- ============================================
-- 4. SAVINGS OPPORTUNITY (Triggers: SAVINGS_OPPORTUNITY)
-- ============================================
-- Add 5+ expenses totaling >5000 BDT in Entertainment category
INSERT INTO expenses (user_id, category_id, amount, date, description, created_at, updated_at)
VALUES
    (@user_id, @entertainment_category, 1200.00, CURDATE() - INTERVAL 5 DAY, 'Movie tickets', NOW(), NOW()),
    (@user_id, @entertainment_category, 1500.00, CURDATE() - INTERVAL 10 DAY, 'Concert tickets', NOW(), NOW()),
    (@user_id, @entertainment_category, 1800.00, CURDATE() - INTERVAL 15 DAY, 'Gaming purchases', NOW(), NOW()),
    (@user_id, @entertainment_category, 1000.00, CURDATE() - INTERVAL 20 DAY, 'Streaming services', NOW(), NOW()),
    (@user_id, @entertainment_category, 900.00, CURDATE() - INTERVAL 25 DAY, 'Books and magazines', NOW(), NOW());

-- ============================================
-- 5. SPENDING INSIGHTS DATA (Triggers: SPENDING_INSIGHT)
-- ============================================
-- Add diverse expenses over last month for comprehensive insights
INSERT INTO expenses (user_id, category_id, amount, date, description, created_at, updated_at)
VALUES
    -- Transport expenses
    (@user_id, @transport_category, 800.00, CURDATE() - INTERVAL 3 DAY, 'Uber rides', NOW(), NOW()),
    (@user_id, @transport_category, 1200.00, CURDATE() - INTERVAL 7 DAY, 'Fuel refill', NOW(), NOW()),
    (@user_id, @transport_category, 500.00, CURDATE() - INTERVAL 14 DAY, 'Parking fees', NOW(), NOW()),
    (@user_id, @transport_category, 900.00, CURDATE() - INTERVAL 18 DAY, 'Car maintenance', NOW(), NOW()),
    (@user_id, @transport_category, 600.00, CURDATE() - INTERVAL 22 DAY, 'Public transport', NOW(), NOW()),

    -- Utilities expenses
    (@user_id, @utilities_category, 2200.00, CURDATE() - INTERVAL 6 DAY, 'Electricity bill', NOW(), NOW()),
    (@user_id, @utilities_category, 1100.00, CURDATE() - INTERVAL 9 DAY, 'Water bill', NOW(), NOW()),
    (@user_id, @utilities_category, 1500.00, CURDATE() - INTERVAL 16 DAY, 'Gas bill', NOW(), NOW()),

    -- More shopping
    (@user_id, @shopping_category, 1800.00, CURDATE() - INTERVAL 4 DAY, 'Clothing', NOW(), NOW()),
    (@user_id, @shopping_category, 2200.00, CURDATE() - INTERVAL 11 DAY, 'Home decor', NOW(), NOW()),
    (@user_id, @shopping_category, 1500.00, CURDATE() - INTERVAL 19 DAY, 'Personal care items', NOW(), NOW()),

    -- More food expenses
    (@user_id, @food_category, 1200.00, CURDATE() - INTERVAL 13 DAY, 'Weekly groceries', NOW(), NOW()),
    (@user_id, @food_category, 800.00, CURDATE() - INTERVAL 17 DAY, 'Restaurant visit', NOW(), NOW()),
    (@user_id, @food_category, 1100.00, CURDATE() - INTERVAL 21 DAY, 'Food delivery', NOW(), NOW()),
    (@user_id, @food_category, 950.00, CURDATE() - INTERVAL 26 DAY, 'Cafe and snacks', NOW(), NOW());

-- ============================================
-- 6. HISTORICAL DATA (For Trend Analysis)
-- ============================================
-- Add expenses from 2 months ago for comparison
INSERT INTO expenses (user_id, category_id, amount, date, description, created_at, updated_at)
VALUES
    (@user_id, @food_category, 1500.00, CURDATE() - INTERVAL 35 DAY, 'Old grocery shopping', NOW(), NOW()),
    (@user_id, @food_category, 1200.00, CURDATE() - INTERVAL 40 DAY, 'Old restaurant', NOW(), NOW()),
    (@user_id, @transport_category, 900.00, CURDATE() - INTERVAL 38 DAY, 'Old fuel', NOW(), NOW()),
    (@user_id, @shopping_category, 1800.00, CURDATE() - INTERVAL 42 DAY, 'Old shopping', NOW(), NOW()),
    (@user_id, @entertainment_category, 800.00, CURDATE() - INTERVAL 45 DAY, 'Old entertainment', NOW(), NOW()),
    (@user_id, @utilities_category, 2000.00, CURDATE() - INTERVAL 37 DAY, 'Old utility bill', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify data was inserted correctly

-- Check total expenses by category this month
SELECT
    c.name AS category,
    COUNT(*) AS transaction_count,
    SUM(e.amount) AS total_spent
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = @user_id
    AND e.date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
GROUP BY c.name
ORDER BY total_spent DESC;

-- Check recurring expenses due soon
SELECT
    description,
    amount,
    next_due_date,
    DATEDIFF(next_due_date, CURDATE()) AS days_until_due
FROM recurring_expenses
WHERE user_id = @user_id
    AND active = TRUE
    AND next_due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY next_due_date;

-- Check weekly spending comparison
SELECT
    'Previous Week' AS period,
    COUNT(*) AS transactions,
    SUM(amount) AS total
FROM expenses
WHERE user_id = @user_id
    AND date BETWEEN CURDATE() - INTERVAL 14 DAY AND CURDATE() - INTERVAL 7 DAY
UNION ALL
SELECT
    'Current Week' AS period,
    COUNT(*) AS transactions,
    SUM(amount) AS total
FROM expenses
WHERE user_id = @user_id
    AND date BETWEEN CURDATE() - INTERVAL 7 DAY AND CURDATE();

-- Check total data summary
SELECT
    COUNT(DISTINCT e.id) AS total_expenses,
    COUNT(DISTINCT c.id) AS total_categories,
    COUNT(DISTINCT r.id) AS total_recurring,
    SUM(e.amount) AS total_amount
FROM users u
LEFT JOIN expenses e ON e.user_id = u.id AND e.date >= CURDATE() - INTERVAL 60 DAY
LEFT JOIN categories c ON c.user_id = u.id
LEFT JOIN recurring_expenses r ON r.user_id = u.id AND r.active = TRUE
WHERE u.id = @user_id;

-- ============================================
-- EXPECTED NUDGES AFTER GENERATION
-- ============================================
/*
After running this script and calling POST /api/nudges/generate, you should see:

1. BUDGET_ALERT (HIGH/URGENT priority)
   - "High Spending Alert" for Food category (>10,000 BDT)

2. UNUSUAL_SPENDING (HIGH priority)
   - "Unusual Spending Detected" for Shopping (big increase this week)

3. BILL_REMINDER (HIGH/MEDIUM priority)
   - "Upcoming Bill" for Internet, Netflix, Electricity, Spotify

4. SAVINGS_OPPORTUNITY (LOW priority)
   - "Savings Opportunity" for Entertainment category (>5,000 BDT)

5. SPENDING_INSIGHT (LOW priority)
   - "Monthly Spending Summary" with top category and totals

Total Expected Nudges: 6-8 nudges
*/

-- ============================================
-- CLEANUP (Run only if you want to start fresh)
-- ============================================
/*
-- WARNING: This will delete ALL test data for your user!
-- Uncomment only if you need to reset

DELETE FROM expenses WHERE user_id = @user_id;
DELETE FROM recurring_expenses WHERE user_id = @user_id;
DELETE FROM nudges WHERE user_id = @user_id;
DELETE FROM categories WHERE user_id = @user_id;
*/

-- ============================================
SELECT '✅ Test data inserted successfully!' AS status;
SELECT 'Run: POST /api/nudges/generate to create nudges' AS next_step;
-- ============================================
