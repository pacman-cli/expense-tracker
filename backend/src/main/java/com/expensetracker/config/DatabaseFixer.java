package com.expensetracker.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking database schema...");

        try {
            // Create tax_exports table if not exists
            String sql = """
                        CREATE TABLE IF NOT EXISTS tax_exports (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            user_id BIGINT NOT NULL,
                            tax_year INT NOT NULL,
                            start_date DATE NOT NULL,
                            end_date DATE NOT NULL,
                            format VARCHAR(255) NOT NULL,
                            export_type VARCHAR(255) NOT NULL,
                            file_name VARCHAR(500) NOT NULL,
                            file_url LONGTEXT,
                            file_size BIGINT NOT NULL,
                            status VARCHAR(255) NOT NULL,
                            error_message TEXT,
                            total_income DECIMAL(19,2),
                            total_expenses DECIMAL(19,2),
                            total_deductible_expenses DECIMAL(19,2),
                            total_non_deductible_expenses DECIMAL(19,2),
                            net_taxable_income DECIMAL(19,2),
                            deductible_categories TEXT,
                            income_breakdown TEXT,
                            total_transactions INT,
                            deductible_transactions INT,
                            business_expenses DECIMAL(19,2),
                            business_income DECIMAL(19,2),
                            business_mileage DECIMAL(19,2),
                            medical_expenses DECIMAL(19,2),
                            charitable_donations DECIMAL(19,2),
                            interest_paid DECIMAL(19,2),
                            interest_received DECIMAL(19,2),
                            investment_income DECIMAL(19,2),
                            capital_gains DECIMAL(19,2),
                            capital_losses DECIMAL(19,2),
                            export_configuration TEXT,
                            included_categories TEXT,
                            excluded_categories TEXT,
                            include_receipts BOOLEAN NOT NULL DEFAULT FALSE,
                            include_notes BOOLEAN NOT NULL DEFAULT TRUE,
                            include_attachments BOOLEAN NOT NULL DEFAULT FALSE,
                            tax_authority VARCHAR(100),
                            tax_region VARCHAR(100),
                            tax_id VARCHAR(255),
                            is_compliant BOOLEAN NOT NULL DEFAULT TRUE,
                            compliance_notes TEXT,
                            warnings TEXT,
                            generated_at DATE,
                            expires_at DATE,
                            download_count INT,
                            last_downloaded_at DATE,
                            generated_by VARCHAR(500),
                            processing_notes VARCHAR(1000),
                            created_at DATETIME(6),
                            updated_at DATETIME(6),
                            CONSTRAINT fk_tax_exports_user FOREIGN KEY (user_id) REFERENCES users(id)
                        );
                    """;

            jdbcTemplate.execute(sql);
            log.info("Database schema check completed. 'tax_exports' table verified.");

            // Fix nudges table schema issues
            try {
                // Check if is_actionable column exists
                String checkColumnSql = """
                            SELECT COUNT(*) FROM information_schema.COLUMNS
                            WHERE TABLE_SCHEMA = DATABASE()
                            AND TABLE_NAME = 'nudges'
                            AND COLUMN_NAME = 'is_actionable'
                        """;
                Integer count = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);

                if (count == null || count == 0) {
                    // Column doesn't exist, add it
                    jdbcTemplate.execute("""
                                ALTER TABLE nudges
                                ADD COLUMN is_actionable BOOLEAN NOT NULL DEFAULT TRUE
                            """);
                    log.info("Added is_actionable column to nudges table.");
                } else {
                    log.debug("is_actionable column already exists in nudges table.");
                }
            } catch (Exception e) {
                log.warn("Error checking/adding is_actionable column: {}", e.getMessage());
            }

            try {
                // Fix nudge_type column size if it's too small
                jdbcTemplate.execute("""
                            ALTER TABLE nudges
                            MODIFY COLUMN nudge_type VARCHAR(50) NOT NULL
                        """);
                log.info("Updated nudge_type column size in nudges table.");
            } catch (Exception e) {
                log.debug("nudge_type column update: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Error checking/creating database schema: {}", e.getMessage());
        }

        try {
            // Create lifestyle_reports table if not exists (Robust Fix)
            String lifestyleSql = """
                        CREATE TABLE IF NOT EXISTS lifestyle_reports (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            user_id BIGINT NOT NULL,
                            report_start_date DATE NOT NULL,
                            report_end_date DATE NOT NULL,
                            report_period VARCHAR(255) NOT NULL,
                            title VARCHAR(500) NOT NULL,
                            summary TEXT,
                            total_income DECIMAL(19,2),
                            total_expenses DECIMAL(19,2),
                            net_savings DECIMAL(19,2),
                            savings_rate DECIMAL(19,2),
                            category_breakdown TEXT,
                            top_spending_category VARCHAR(500),
                            top_spending_amount DECIMAL(19,2),
                            second_top_category VARCHAR(500),
                            second_top_amount DECIMAL(19,2),
                            third_top_category VARCHAR(500),
                            third_top_amount DECIMAL(19,2),
                            spending_pattern VARCHAR(255),
                            spending_trends TEXT,
                            average_daily_expenses INT,
                            total_transactions INT,
                            lifestyle_type VARCHAR(255),
                            lifestyle_insights TEXT,
                            recommendations TEXT,
                            comparison_to_previous_period DECIMAL(19,2),
                            comparison_to_average DECIMAL(19,2),
                            benchmark_comparison TEXT,
                            most_active_day VARCHAR(500),
                            most_active_time VARCHAR(500),
                            impulse_purchases INT,
                            subscription_count INT,
                            subscription_cost DECIMAL(19,2),
                            budget_goals_achieved INT,
                            budget_goals_total INT,
                            savings_goals_achieved INT,
                            savings_goals_total INT,
                            achievements TEXT,
                            total_debt DECIMAL(19,2),
                            debt_paid DECIMAL(19,2),
                            debt_accounts INT,
                            shared_expenses_total DECIMAL(19,2),
                            amount_owed_to_you DECIMAL(19,2),
                            amount_you_owe DECIMAL(19,2),
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
                            created_at DATETIME(6),
                            updated_at DATETIME(6),
                            CONSTRAINT fk_lifestyle_reports_user FOREIGN KEY (user_id) REFERENCES users(id)
                        );
                    """;
            jdbcTemplate.execute(lifestyleSql);
            log.info("Database schema check completed. 'lifestyle_reports' table verified.");
        } catch (Exception e) {
            log.error("Error creating lifestyle_reports table: {}", e.getMessage());
        }
    }
}
