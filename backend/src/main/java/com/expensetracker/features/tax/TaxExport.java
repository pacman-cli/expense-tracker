package com.expensetracker.features.tax;

import com.expensetracker.entity.BaseEntity;
import com.expensetracker.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tax_exports")
public class TaxExport extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private Integer taxYear;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaxExportFormat format;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaxExportType exportType;

    @Column(nullable = false, length = 500)
    private String fileName;

    @Column(columnDefinition = "LONGTEXT")
    @JsonIgnore
    private String fileUrl; // Path to generated export file

    @Column(nullable = false)
    private Long fileSize; // File size in bytes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExportStatus status = ExportStatus.PENDING;

    @Column(length = 1000)
    private String errorMessage;

    // Financial Summary
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalDeductibleExpenses;
    private BigDecimal totalNonDeductibleExpenses;
    private BigDecimal netTaxableIncome;

    // Category Breakdowns
    @Column(length = 3000)
    private String deductibleCategories; // JSON: {category: amount}

    @Column(length = 3000)
    private String incomeBreakdown; // JSON: {source: amount}

    // Transaction Counts
    private Integer totalTransactions;
    private Integer deductibleTransactions;

    // Business Expenses (if applicable)
    private BigDecimal businessExpenses;
    private BigDecimal businessIncome;
    private BigDecimal businessMileage;

    // Medical Expenses
    private BigDecimal medicalExpenses;

    // Charitable Donations
    private BigDecimal charitableDonations;

    // Interest & Loans
    private BigDecimal interestPaid;
    private BigDecimal interestReceived;

    // Investment Income
    private BigDecimal investmentIncome;
    private BigDecimal capitalGains;
    private BigDecimal capitalLosses;

    // Export Configuration
    @Column(length = 2000)
    private String exportConfiguration; // JSON: user preferences for export

    @Column(length = 2000)
    private String includedCategories; // JSON: categories included in export

    @Column(length = 2000)
    private String excludedCategories; // JSON: categories excluded

    @Column(nullable = false)
    @Builder.Default
    private Boolean includeReceipts = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean includeNotes = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean includeAttachments = false;

    // Tax Authority
    @Column(length = 100)
    private String taxAuthority; // e.g., "IRS", "NBR Bangladesh"

    @Column(length = 100)
    private String taxRegion; // Country/State

    @Column(length = 255)
    private String taxId; // User's tax identification number (encrypted)

    // Compliance
    @Column(nullable = false)
    @Builder.Default
    private Boolean isCompliant = true;

    @Column(length = 1000)
    private String complianceNotes;

    @Column(length = 2000)
    private String warnings; // JSON: array of warnings

    // Processing Details
    private LocalDate generatedAt;
    private LocalDate expiresAt; // Download link expiration
    private Integer downloadCount;
    private LocalDate lastDownloadedAt;

    @Column(length = 500)
    private String generatedBy; // System or manual

    @Column(length = 1000)
    private String processingNotes;

    public enum TaxExportFormat {
        PDF, // PDF document
        CSV, // Comma-separated values
        EXCEL, // Excel spreadsheet
        JSON, // JSON format
        XML, // XML format
        TXT, // Plain text
        TURBOTAX, // TurboTax format
        QUICKBOOKS, // QuickBooks format
        CUSTOM // Custom format
    }

    public enum TaxExportType {
        FULL_YEAR, // Complete year export
        QUARTERLY, // Quarterly export
        CUSTOM_PERIOD, // Custom date range
        INCOME_ONLY, // Only income transactions
        EXPENSES_ONLY, // Only expense transactions
        DEDUCTIBLE_ONLY, // Only deductible items
        BUSINESS_EXPENSES, // Business-related expenses
        CHARITABLE_DONATIONS, // Charitable donations
        MEDICAL_EXPENSES, // Medical expenses
        INVESTMENT_REPORT // Investment income/losses
    }

    public enum ExportStatus {
        PENDING, // Export requested but not started
        PROCESSING, // Export being generated
        COMPLETED, // Export completed successfully
        FAILED, // Export failed
        EXPIRED, // Download link expired
        DELETED // Export file deleted
    }

    // Helper method to mark as completed
    public void markAsCompleted(String fileUrl, Long fileSize) {
        this.status = ExportStatus.COMPLETED;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.generatedAt = LocalDate.now();

        // Set expiration to 30 days from generation
        this.expiresAt = LocalDate.now().plusDays(30);
    }

    // Helper method to mark as failed
    public void markAsFailed(String errorMessage) {
        this.status = ExportStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    // Helper method to increment download count
    public void recordDownload() {
        this.downloadCount = (this.downloadCount == null ? 0 : this.downloadCount) + 1;
        this.lastDownloadedAt = LocalDate.now();
    }

    // Helper method to check if expired
    public boolean isExpired() {
        return expiresAt != null && LocalDate.now().isAfter(expiresAt);
    }

    // Helper method to calculate tax liability (simplified)
    public BigDecimal getEstimatedTaxableAmount() {
        if (netTaxableIncome != null) {
            return netTaxableIncome;
        }

        BigDecimal income = totalIncome != null ? totalIncome : BigDecimal.ZERO;
        BigDecimal deductions = totalDeductibleExpenses != null ? totalDeductibleExpenses : BigDecimal.ZERO;

        return income.subtract(deductions);
    }

    // Helper method to get deduction percentage
    public BigDecimal getDeductionPercentage() {
        if (totalExpenses == null || totalExpenses.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal deductible = totalDeductibleExpenses != null ? totalDeductibleExpenses : BigDecimal.ZERO;

        return deductible
                .multiply(BigDecimal.valueOf(100))
                .divide(totalExpenses, 2, java.math.RoundingMode.HALF_UP);
    }
}
