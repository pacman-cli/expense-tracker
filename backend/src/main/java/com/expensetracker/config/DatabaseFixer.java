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
    }
}
