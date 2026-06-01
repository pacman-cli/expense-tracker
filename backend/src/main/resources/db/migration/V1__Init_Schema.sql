-- Init Schema Migration for PostgreSQL
-- Generated based on JPA Entities

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255)
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  color VARCHAR(255),
  icon VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 3. Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  balance NUMERIC(38,2) NOT NULL,
  currency VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 4. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  amount NUMERIC(38,2) NOT NULL,
  date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  category_id BIGINT,
  user_id BIGINT NOT NULL,
  wallet_id BIGINT,
  CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_expenses_wallet FOREIGN KEY (wallet_id) REFERENCES wallets (id)
);

-- 5. Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  amount NUMERIC(38,2) NOT NULL,
  "month" INT NOT NULL,
  spent NUMERIC(38,2) NOT NULL,
  "year" INT NOT NULL,
  category_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 6. Recurring Expenses
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  active BOOLEAN NOT NULL,
  amount NUMERIC(38,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  end_date DATE,
  frequency VARCHAR(255) NOT NULL,
  next_due_date DATE NOT NULL,
  start_date DATE NOT NULL,
  category_id BIGINT,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_recurring_expenses_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_recurring_expenses_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 7. Expense Templates
CREATE TABLE IF NOT EXISTS expense_templates (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  active BOOLEAN NOT NULL,
  amount NUMERIC(38,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  favorite BOOLEAN NOT NULL,
  name VARCHAR(255) NOT NULL,
  usage_count INT NOT NULL,
  category_id BIGINT,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_expense_templates_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_expense_templates_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 8. Debts
CREATE TABLE IF NOT EXISTS debts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  attachment_url VARCHAR(500),
  contact_info VARCHAR(255),
  creditor_debtor VARCHAR(255),
  description VARCHAR(1000),
  due_date DATE,
  installment_amount NUMERIC(38,2),
  interest_rate NUMERIC(38,2) NOT NULL,
  is_recurring BOOLEAN NOT NULL,
  notes VARCHAR(500),
  payment_frequency VARCHAR(255),
  remaining_amount NUMERIC(38,2) NOT NULL,
  principal_amount NUMERIC(38,2) NOT NULL,
  priority VARCHAR(255),
  start_date DATE NOT NULL,
  status VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_debts_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 9. Debt Payments
CREATE TABLE IF NOT EXISTS debt_payments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  amount NUMERIC(38,2) NOT NULL,
  interest_portion NUMERIC(38,2),
  is_verified BOOLEAN NOT NULL,
  notes VARCHAR(500),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(255) NOT NULL,
  principal_portion NUMERIC(38,2),
  receipt_url VARCHAR(500),
  transaction_id VARCHAR(255),
  debt_id BIGINT NOT NULL,
  CONSTRAINT fk_debt_payments_debt FOREIGN KEY (debt_id) REFERENCES debts (id)
);

-- 10. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  expiry_date TIMESTAMP NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_id BIGINT UNIQUE,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 11. Tax Exports
CREATE TABLE IF NOT EXISTS tax_exports (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  business_expenses NUMERIC(38,2),
  business_income NUMERIC(38,2),
  business_mileage NUMERIC(38,2),
  capital_gains NUMERIC(38,2),
  capital_losses NUMERIC(38,2),
  charitable_donations NUMERIC(38,2),
  compliance_notes VARCHAR(1000),
  deductible_categories VARCHAR(3000),
  deductible_transactions INT,
  download_count INT,
  end_date DATE NOT NULL,
  error_message VARCHAR(1000),
  excluded_categories VARCHAR(2000),
  expires_at DATE,
  export_configuration VARCHAR(2000),
  export_type VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT,
  format VARCHAR(255) NOT NULL,
  generated_at DATE,
  generated_by VARCHAR(500),
  include_attachments BOOLEAN NOT NULL,
  include_notes BOOLEAN NOT NULL,
  include_receipts BOOLEAN NOT NULL,
  included_categories VARCHAR(2000),
  income_breakdown VARCHAR(3000),
  interest_paid NUMERIC(38,2),
  interest_received NUMERIC(38,2),
  investment_income NUMERIC(38,2),
  is_compliant BOOLEAN NOT NULL,
  last_downloaded_at DATE,
  medical_expenses NUMERIC(38,2),
  net_taxable_income NUMERIC(38,2),
  processing_notes VARCHAR(1000),
  start_date DATE NOT NULL,
  status VARCHAR(255) NOT NULL,
  tax_authority VARCHAR(100),
  tax_id VARCHAR(255),
  tax_region VARCHAR(100),
  tax_year INT NOT NULL,
  total_deductible_expenses NUMERIC(38,2),
  total_expenses NUMERIC(38,2),
  total_income NUMERIC(38,2),
  total_non_deductible_expenses NUMERIC(38,2),
  total_transactions INT,
  warnings VARCHAR(2000),
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_tax_exports_user FOREIGN KEY (user_id) REFERENCES users (id)
);
