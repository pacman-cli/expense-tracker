-- Init Schema Migration
-- Generated based on JPA Entities

-- 1. Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_categories_user` (`user_id`),
  CONSTRAINT `FK_categories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Wallets
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `balance` decimal(38,2) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_wallets_user` (`user_id`),
  CONSTRAINT `FK_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(38,2) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(255) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `wallet_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_expenses_category` (`category_id`),
  KEY `FK_expenses_user` (`user_id`),
  KEY `FK_expenses_wallet` (`wallet_id`),
  CONSTRAINT `FK_expenses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FK_expenses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_expenses_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Budgets
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(38,2) NOT NULL,
  `month` int NOT NULL,
  `spent` decimal(38,2) NOT NULL,
  `year` int NOT NULL,
  `category_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_budgets_category` (`category_id`),
  KEY `FK_budgets_user` (`user_id`),
  CONSTRAINT `FK_budgets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FK_budgets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Recurring Expenses
CREATE TABLE IF NOT EXISTS `recurring_expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `end_date` date DEFAULT NULL,
  `frequency` varchar(255) NOT NULL,
  `next_due_date` date NOT NULL,
  `start_date` date NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_recurring_expenses_category` (`category_id`),
  KEY `FK_recurring_expenses_user` (`user_id`),
  CONSTRAINT `FK_recurring_expenses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FK_recurring_expenses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Expense Templates
CREATE TABLE IF NOT EXISTS `expense_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `favorite` bit(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `usage_count` int NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_expense_templates_category` (`category_id`),
  KEY `FK_expense_templates_user` (`user_id`),
  CONSTRAINT `FK_expense_templates_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `FK_expense_templates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Debts
CREATE TABLE IF NOT EXISTS `debts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `creditor_debtor` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `installment_amount` decimal(38,2) DEFAULT NULL,
  `interest_rate` decimal(38,2) NOT NULL,
  `is_recurring` bit(1) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `payment_frequency` varchar(255) DEFAULT NULL,
  `remaining_amount` decimal(38,2) NOT NULL,
  `principal_amount` decimal(38,2) NOT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_debts_user` (`user_id`),
  CONSTRAINT `FK_debts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Debt Payments
CREATE TABLE IF NOT EXISTS `debt_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `amount` decimal(38,2) NOT NULL,
  `interest_portion` decimal(38,2) DEFAULT NULL,
  `is_verified` bit(1) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `principal_portion` decimal(38,2) DEFAULT NULL,
  `receipt_url` varchar(500) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `debt_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_debt_payments_debt` (`debt_id`),
  CONSTRAINT `FK_debt_payments_debt` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. Refresh Tokens
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_refresh_tokens_token` (`token`),
  UNIQUE KEY `UK_refresh_tokens_user` (`user_id`),
  CONSTRAINT `FK_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. Tax Exports
CREATE TABLE IF NOT EXISTS `tax_exports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `business_expenses` decimal(38,2) DEFAULT NULL,
  `business_income` decimal(38,2) DEFAULT NULL,
  `business_mileage` decimal(38,2) DEFAULT NULL,
  `capital_gains` decimal(38,2) DEFAULT NULL,
  `capital_losses` decimal(38,2) DEFAULT NULL,
  `charitable_donations` decimal(38,2) DEFAULT NULL,
  `compliance_notes` varchar(1000) DEFAULT NULL,
  `deductible_categories` varchar(3000) DEFAULT NULL,
  `deductible_transactions` int DEFAULT NULL,
  `download_count` int DEFAULT NULL,
  `end_date` date NOT NULL,
  `error_message` varchar(1000) DEFAULT NULL,
  `excluded_categories` varchar(2000) DEFAULT NULL,
  `expires_at` date DEFAULT NULL,
  `export_configuration` varchar(2000) DEFAULT NULL,
  `export_type` varchar(255) NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `file_url` longtext,
  `format` varchar(255) NOT NULL,
  `generated_at` date DEFAULT NULL,
  `generated_by` varchar(500) DEFAULT NULL,
  `include_attachments` bit(1) NOT NULL,
  `include_notes` bit(1) NOT NULL,
  `include_receipts` bit(1) NOT NULL,
  `included_categories` varchar(2000) DEFAULT NULL,
  `income_breakdown` varchar(3000) DEFAULT NULL,
  `interest_paid` decimal(38,2) DEFAULT NULL,
  `interest_received` decimal(38,2) DEFAULT NULL,
  `investment_income` decimal(38,2) DEFAULT NULL,
  `is_compliant` bit(1) NOT NULL,
  `last_downloaded_at` date DEFAULT NULL,
  `medical_expenses` decimal(38,2) DEFAULT NULL,
  `net_taxable_income` decimal(38,2) DEFAULT NULL,
  `processing_notes` varchar(1000) DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` varchar(255) NOT NULL,
  `tax_authority` varchar(100) DEFAULT NULL,
  `tax_id` varchar(255) DEFAULT NULL,
  `tax_region` varchar(100) DEFAULT NULL,
  `tax_year` int NOT NULL,
  `total_deductible_expenses` decimal(38,2) DEFAULT NULL,
  `total_expenses` decimal(38,2) DEFAULT NULL,
  `total_income` decimal(38,2) DEFAULT NULL,
  `total_non_deductible_expenses` decimal(38,2) DEFAULT NULL,
  `total_transactions` int DEFAULT NULL,
  `warnings` varchar(2000) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tax_exports_user` (`user_id`),
  CONSTRAINT `fk_tax_exports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
