package com.expensetracker.features.lifestyle;

import com.expensetracker.entity.BaseEntity;
import com.expensetracker.entity.User;
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
@Table(name = "lifestyle_reports")
public class LifestyleReport extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate reportStartDate;

    @Column(nullable = false)
    private LocalDate reportEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportPeriod reportPeriod;

    @Column(nullable = false, length = 500)
    private String title; // e.g., "Your December 2024 Lifestyle Report"

    @Column(length = 5000)
    private String summary; // Executive summary of spending habits

    // Financial Metrics
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netSavings;
    private BigDecimal savingsRate; // Percentage

    // Category Breakdown
    @Column(length = 3000)
    private String categoryBreakdown; // JSON: {category: amount, percentage}

    // Top Categories
    @Column(length = 500)
    private String topSpendingCategory;
    private BigDecimal topSpendingAmount;

    @Column(length = 500)
    private String secondTopCategory;
    private BigDecimal secondTopAmount;

    @Column(length = 500)
    private String thirdTopCategory;
    private BigDecimal thirdTopAmount;

    // Spending Patterns
    @Enumerated(EnumType.STRING)
    private SpendingPattern spendingPattern;

    @Column(length = 1000)
    private String spendingTrends; // JSON: weekly/monthly trends

    private Integer averageDailyExpenses;
    private Integer totalTransactions;

    // Lifestyle Insights
    @Enumerated(EnumType.STRING)
    private LifestyleType lifestyleType;

    @Column(length = 2000)
    private String lifestyleInsights; // AI-generated personalized insights

    @Column(length = 2000)
    private String recommendations; // Actionable recommendations

    // Comparisons
    private BigDecimal comparisonToPreviousPeriod; // Percentage change
    private BigDecimal comparisonToAverage; // vs. user's average

    @Column(length = 1000)
    private String benchmarkComparison; // Compare to similar users (anonymized)

    // Habits & Behaviors
    @Column(length = 500)
    private String mostActiveDay; // Day with most spending

    @Column(length = 500)
    private String mostActiveTime; // Time of day with most spending

    private Integer impulsePurchases; // Estimated impulse purchases

    private Integer subscriptionCount; // Active subscriptions

    private BigDecimal subscriptionCost; // Total subscription cost

    // Goals & Achievements
    private Integer budgetGoalsAchieved;
    private Integer budgetGoalsTotal;

    private Integer savingsGoalsAchieved;
    private Integer savingsGoalsTotal;

    @Column(length = 2000)
    private String achievements; // JSON: list of achievements

    // Debt & Loans
    private BigDecimal totalDebt;
    private BigDecimal debtPaid;
    private Integer debtAccounts;

    // Shared Expenses
    private BigDecimal sharedExpensesTotal;
    private BigDecimal amountOwedToYou;
    private BigDecimal amountYouOwe;

    // Wallet Distribution
    @Column(length = 1000)
    private String walletDistribution; // JSON: wallet-wise spending

    // Financial Health
    private Integer financialHealthScore; // 0-100

    @Enumerated(EnumType.STRING)
    private FinancialHealthStatus financialHealthStatus;

    @Column(length = 2000)
    private String healthFactors; // JSON: factors affecting health score

    // Report Metadata
    @Column(nullable = false)
    @Builder.Default
    private Boolean isViewed = false;

    private LocalDate viewedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isShared = false;

    @Column(length = 500)
    private String shareUrl; // If user shares the report

    @Column(length = 3000)
    private String visualizationData; // JSON: data for charts and graphs

    @Column(length = 100)
    private String reportVersion; // For versioning report formats

    public enum ReportPeriod {
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY,
        CUSTOM
    }

    public enum SpendingPattern {
        CONSISTENT,        // Steady spending pattern
        INCREASING,        // Spending increasing over time
        DECREASING,        // Spending decreasing over time
        VOLATILE,          // Highly variable spending
        SEASONAL,          // Seasonal spending pattern
        WEEKEND_HEAVY,     // More spending on weekends
        WEEKDAY_HEAVY      // More spending on weekdays
    }

    public enum LifestyleType {
        FRUGAL,           // Very low spending, high savings
        BALANCED,         // Balanced spending and savings
        MODERATE_SPENDER, // Moderate spending habits
        HIGH_SPENDER,     // High spending, lower savings
        LUXURY,           // Premium lifestyle spending
        MINIMALIST,       // Minimal spending philosophy
        EXPERIENCE_FOCUSED, // Spends on experiences
        INVESTMENT_FOCUSED  // Focus on investments
    }

    public enum FinancialHealthStatus {
        EXCELLENT,        // >80 score
        GOOD,            // 60-80 score
        FAIR,            // 40-60 score
        NEEDS_ATTENTION, // 20-40 score
        CRITICAL         // <20 score
    }

    // Helper method to calculate savings rate
    public void calculateSavingsRate() {
        if (totalIncome != null && totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            if (netSavings != null) {
                savingsRate = netSavings
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, BigDecimal.ROUND_HALF_UP);
            }
        }
    }

    // Helper method to determine financial health status
    public void determineHealthStatus() {
        if (financialHealthScore == null) {
            financialHealthStatus = FinancialHealthStatus.FAIR;
            return;
        }

        if (financialHealthScore >= 80) {
            financialHealthStatus = FinancialHealthStatus.EXCELLENT;
        } else if (financialHealthScore >= 60) {
            financialHealthStatus = FinancialHealthStatus.GOOD;
        } else if (financialHealthScore >= 40) {
            financialHealthStatus = FinancialHealthStatus.FAIR;
        } else if (financialHealthScore >= 20) {
            financialHealthStatus = FinancialHealthStatus.NEEDS_ATTENTION;
        } else {
            financialHealthStatus = FinancialHealthStatus.CRITICAL;
        }
    }

    // Helper method to mark as viewed
    public void markAsViewed() {
        this.isViewed = true;
        this.viewedAt = LocalDate.now();
    }

    // Helper method to generate title
    public void generateTitle() {
        String periodName = reportPeriod.toString().toLowerCase();
        String monthYear = reportStartDate.getMonth().toString() + " " + reportStartDate.getYear();
        this.title = "Your " + periodName + " Lifestyle Report - " + monthYear;
    }
}
