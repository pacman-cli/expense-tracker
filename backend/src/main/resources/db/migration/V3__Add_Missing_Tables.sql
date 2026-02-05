-- V3: Add Missing Tables
-- Tables: lifestyle_reports, receipts, nudges, shared_expenses, shared_expense_participants, predictions

-- 1. Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  category_name VARCHAR(255),
  prediction_date DATE,
  predicted_amount DOUBLE PRECISION,
  actual_amount DOUBLE PRECISION,
  confidence DOUBLE PRECISION,
  prediction_type VARCHAR(255),
  prediction_period VARCHAR(255),
  algorithm_used VARCHAR(255),
  insights TEXT,
  is_accurate BOOLEAN,
  accuracy_percentage DOUBLE PRECISION,
  variance DOUBLE PRECISION,
  CONSTRAINT fk_predictions_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 2. Nudges
CREATE TABLE IF NOT EXISTS nudges (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  nudge_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_actionable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  action_url VARCHAR(255),
  metadata TEXT,
  CONSTRAINT fk_nudges_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 3. Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  user_id BIGINT NOT NULL,
  expense_id BIGINT,
  linked_expense_id BIGINT,
  image_url VARCHAR(255) NOT NULL,
  ocr_text VARCHAR(1000),
  merchant_name VARCHAR(500),
  extracted_amount NUMERIC(38,2),
  extracted_date TIMESTAMP,
  extracted_category VARCHAR(100),
  status VARCHAR(255) NOT NULL,
  error_message VARCHAR(1000),
  confidence INT,
  CONSTRAINT fk_receipts_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_receipts_expense FOREIGN KEY (expense_id) REFERENCES expenses (id)
);

-- 4. Shared Expenses
CREATE TABLE IF NOT EXISTS shared_expenses (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  expense_id BIGINT NOT NULL,
  paid_by_user_id BIGINT NOT NULL,
  total_amount NUMERIC(38,2) NOT NULL,
  description VARCHAR(500),
  split_type VARCHAR(255) NOT NULL,
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  settled_at TIMESTAMP,
  group_name VARCHAR(100),
  CONSTRAINT fk_shared_expenses_expense FOREIGN KEY (expense_id) REFERENCES expenses (id),
  CONSTRAINT fk_shared_expenses_paid_by FOREIGN KEY (paid_by_user_id) REFERENCES users (id)
);

-- 5. Shared Expense Participants
CREATE TABLE IF NOT EXISTS shared_expense_participants (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  shared_expense_id BIGINT NOT NULL,
  user_id BIGINT,
  external_participant_name VARCHAR(255),
  external_participant_email VARCHAR(255),
  share_amount NUMERIC(38,2) NOT NULL,
  share_percentage NUMERIC(38,2),
  share_units INT,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMP,
  notes VARCHAR(500),
  status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  CONSTRAINT fk_shared_participants_shared FOREIGN KEY (shared_expense_id) REFERENCES shared_expenses (id),
  CONSTRAINT fk_shared_participants_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 6. Lifestyle Reports
CREATE TABLE IF NOT EXISTS lifestyle_reports (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  user_id BIGINT NOT NULL,
  report_start_date DATE NOT NULL,
  report_end_date DATE NOT NULL,
  report_period VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  total_income NUMERIC(38,2),
  total_expenses NUMERIC(38,2),
  net_savings NUMERIC(38,2),
  savings_rate NUMERIC(38,2),
  category_breakdown TEXT,
  top_spending_category VARCHAR(500),
  top_spending_amount NUMERIC(38,2),
  second_top_category VARCHAR(500),
  second_top_amount NUMERIC(38,2),
  third_top_category VARCHAR(500),
  third_top_amount NUMERIC(38,2),
  spending_pattern VARCHAR(255),
  spending_trends TEXT,
  average_daily_expenses INT,
  total_transactions INT,
  lifestyle_type VARCHAR(255),
  lifestyle_insights TEXT,
  recommendations TEXT,
  comparison_to_previous_period NUMERIC(38,2),
  comparison_to_average NUMERIC(38,2),
  benchmark_comparison TEXT,
  most_active_day VARCHAR(500),
  most_active_time VARCHAR(500),
  impulse_purchases INT,
  subscription_count INT,
  subscription_cost NUMERIC(38,2),
  budget_goals_achieved INT,
  budget_goals_total INT,
  savings_goals_achieved INT,
  savings_goals_total INT,
  achievements TEXT,
  total_debt NUMERIC(38,2),
  debt_paid NUMERIC(38,2),
  debt_accounts INT,
  shared_expenses_total NUMERIC(38,2),
  amount_owed_to_you NUMERIC(38,2),
  amount_you_owe NUMERIC(38,2),
  wallet_distribution TEXT,
  financial_health_score INT,
  financial_health_status VARCHAR(255),
  health_factors TEXT,
  is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
  viewed_at DATE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  share_url VARCHAR(500),
  visualization_data TEXT,
  report_version VARCHAR(100),
  CONSTRAINT fk_lifestyle_reports_user FOREIGN KEY (user_id) REFERENCES users (id)
);
