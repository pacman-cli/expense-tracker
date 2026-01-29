package com.expensetracker.features.lifestyle;

import com.expensetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LifestyleReportRepository extends JpaRepository<LifestyleReport, Long> {

        // Find reports by user
        Page<LifestyleReport> findByUser(User user, Pageable pageable);

        // Find reports by user and period
        List<LifestyleReport> findByUserAndReportPeriod(User user, LifestyleReport.ReportPeriod period);

        // Find reports by date range
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.reportStartDate >= :startDate AND lr.reportEndDate <= :endDate ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findByUserAndDateRange(
                        @Param("user") User user,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Find latest report by period type
        // Find latest report by period type
        Optional<LifestyleReport> findFirstByUserAndReportPeriodOrderByReportStartDateDesc(User user,
                        LifestyleReport.ReportPeriod period);

        // Find unviewed reports
        List<LifestyleReport> findByUserAndIsViewedFalseOrderByReportStartDateDesc(User user);

        // Count unviewed reports
        Long countByUserAndIsViewedFalse(User user);

        // Find reports by lifestyle type
        List<LifestyleReport> findByUserAndLifestyleTypeOrderByReportStartDateDesc(User user,
                        LifestyleReport.LifestyleType lifestyleType);

        // Find reports by financial health status
        List<LifestyleReport> findByUserAndFinancialHealthStatusOrderByReportStartDateDesc(User user,
                        LifestyleReport.FinancialHealthStatus status);

        // Find reports by spending pattern
        List<LifestyleReport> findByUserAndSpendingPatternOrderByReportStartDateDesc(User user,
                        LifestyleReport.SpendingPattern pattern);

        // Get latest report
        // Get latest report
        Optional<LifestyleReport> findFirstByUserOrderByReportStartDateDesc(User user);

        // Find reports with high financial health score
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.financialHealthScore >= :minScore ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findHighScoreReports(@Param("user") User user, @Param("minScore") Integer minScore);

        // Find reports with low financial health score (needs attention)
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.financialHealthScore < :maxScore ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findLowScoreReports(@Param("user") User user, @Param("maxScore") Integer maxScore);

        // Get average financial health score
        @Query("SELECT AVG(lr.financialHealthScore) FROM LifestyleReport lr WHERE lr.user = :user")
        Double getAverageFinancialHealthScore(@Param("user") User user);

        // Get average savings rate
        @Query("SELECT AVG(lr.savingsRate) FROM LifestyleReport lr WHERE lr.user = :user")
        BigDecimal getAverageSavingsRate(@Param("user") User user);

        // Find reports showing improvement (higher score than previous)
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.comparisonToPreviousPeriod > 0 ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findImprovingReports(@Param("user") User user);

        // Find reports showing decline
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.comparisonToPreviousPeriod < 0 ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findDecliningReports(@Param("user") User user);

        // Find monthly reports for a specific year
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.reportPeriod = 'MONTHLY' AND YEAR(lr.reportStartDate) = :year ORDER BY lr.reportStartDate ASC")
        List<LifestyleReport> findMonthlyReportsForYear(@Param("user") User user, @Param("year") Integer year);

        // Find shared reports
        List<LifestyleReport> findByUserAndIsSharedTrueOrderByReportStartDateDesc(User user);

        // Check if report exists for period
        @Query("SELECT COUNT(lr) > 0 FROM LifestyleReport lr WHERE lr.user = :user AND lr.reportStartDate = :startDate AND lr.reportEndDate = :endDate AND lr.reportPeriod = :period")
        boolean existsByUserAndPeriod(
                        @Param("user") User user,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("period") LifestyleReport.ReportPeriod period);

        // Get report statistics
        @Query("SELECT COUNT(lr), AVG(lr.financialHealthScore), AVG(lr.savingsRate), AVG(lr.totalExpenses) FROM LifestyleReport lr WHERE lr.user = :user")
        Object[] getReportStatistics(@Param("user") User user);

        // Find reports by top spending category
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.topSpendingCategory = :category ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findByTopSpendingCategory(@Param("user") User user, @Param("category") String category);

        // Get trend data (last N reports)
        @Query("SELECT lr.reportStartDate, lr.totalIncome, lr.totalExpenses, lr.netSavings, lr.financialHealthScore FROM LifestyleReport lr WHERE lr.user = :user ORDER BY lr.reportStartDate DESC")
        List<Object[]> getTrendData(@Param("user") User user, Pageable pageable);

        // Find reports with debt information
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.totalDebt > 0 ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findReportsWithDebt(@Param("user") User user);

        // Find reports with shared expenses
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.sharedExpensesTotal > 0 ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findReportsWithSharedExpenses(@Param("user") User user);

        // Count reports by period type
        @Query("SELECT lr.reportPeriod, COUNT(lr) FROM LifestyleReport lr WHERE lr.user = :user GROUP BY lr.reportPeriod")
        List<Object[]> countReportsByPeriod(@Param("user") User user);

        // Count reports by lifestyle type
        @Query("SELECT lr.lifestyleType, COUNT(lr) FROM LifestyleReport lr WHERE lr.user = :user GROUP BY lr.lifestyleType")
        List<Object[]> countReportsByLifestyleType(@Param("user") User user);

        // Find recent reports
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user ORDER BY lr.createdAt DESC")
        List<LifestyleReport> findRecentReports(@Param("user") User user, Pageable pageable);

        // Get health status distribution
        @Query("SELECT lr.financialHealthStatus, COUNT(lr) FROM LifestyleReport lr WHERE lr.user = :user GROUP BY lr.financialHealthStatus")
        List<Object[]> getHealthStatusDistribution(@Param("user") User user);

        // Get spending pattern distribution
        @Query("SELECT lr.spendingPattern, COUNT(lr) FROM LifestyleReport lr WHERE lr.user = :user GROUP BY lr.spendingPattern")
        List<Object[]> getSpendingPatternDistribution(@Param("user") User user);

        // Find reports by minimum savings rate
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND lr.savingsRate >= :minRate ORDER BY lr.savingsRate DESC")
        List<LifestyleReport> findBySavingsRateThreshold(@Param("user") User user,
                        @Param("minRate") BigDecimal minRate);

        // Find reports with achievements
        @Query("SELECT lr FROM LifestyleReport lr WHERE lr.user = :user AND (lr.budgetGoalsAchieved > 0 OR lr.savingsGoalsAchieved > 0) ORDER BY lr.reportStartDate DESC")
        List<LifestyleReport> findReportsWithAchievements(@Param("user") User user);

        // Get total transaction counts across all reports
        @Query("SELECT SUM(lr.totalTransactions) FROM LifestyleReport lr WHERE lr.user = :user")
        Long getTotalTransactionCount(@Param("user") User user);

        // Delete old reports (cleanup)
        void deleteByUserAndReportStartDateBefore(User user, LocalDate cutoffDate);

        // Get year-over-year comparison data
        @Query("SELECT YEAR(lr.reportStartDate), AVG(lr.financialHealthScore), AVG(lr.savingsRate), SUM(lr.totalExpenses) FROM LifestyleReport lr WHERE lr.user = :user AND lr.reportPeriod = 'MONTHLY' GROUP BY YEAR(lr.reportStartDate)")
        List<Object[]> getYearOverYearComparison(@Param("user") User user);
}
