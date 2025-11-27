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
                            error_message VARCHAR(1000),
                            total_income DECIMAL(19,2),
                            total_expenses DECIMAL(19,2),
                            total_deductible_expenses DECIMAL(19,2),
                            total_non_deductible_expenses DECIMAL(19,2),
                            net_taxable_income DECIMAL(19,2),
                            deductible_categories VARCHAR(3000),
                            income_breakdown VARCHAR(3000),
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
                            export_configuration VARCHAR(2000),
                            included_categories VARCHAR(2000),
                            excluded_categories VARCHAR(2000),
                            include_receipts BOOLEAN NOT NULL DEFAULT FALSE,
                            include_notes BOOLEAN NOT NULL DEFAULT TRUE,
                            include_attachments BOOLEAN NOT NULL DEFAULT FALSE,
                            tax_authority VARCHAR(100),
                            tax_region VARCHAR(100),
                            tax_id VARCHAR(255),
                            is_compliant BOOLEAN NOT NULL DEFAULT TRUE,
                            compliance_notes VARCHAR(1000),
                            warnings VARCHAR(2000),
                            generated_at DATE,
                            expires_at DATE,
                            download_count INT,
                            last_downloaded_at DATE,
                            generated_by VARCHAR(500),
                            processing_notes VARCHAR(1000),
                            created_at DATETIME(6),
                            updated_at DATETIME(6),
                            FOREIGN KEY (user_id) REFERENCES users(id)
                        );
                    """;

            jdbcTemplate.execute(sql);
            log.info("Database schema check completed. 'tax_exports' table verified.");
        } catch (Exception e) {
            log.error("Error checking/creating database schema: {}", e.getMessage());
        }
    }
}
