package com.expensetracker.features.tax;

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
public interface TaxExportRepository extends JpaRepository<TaxExport, Long> {

        // Find all tax exports for user
        Page<TaxExport> findByUser(User user, Pageable pageable);

        // Find tax exports by year
        List<TaxExport> findByUserAndTaxYearOrderByCreatedAtDesc(User user, Integer taxYear);

        // Find tax exports by format
        List<TaxExport> findByUserAndFormatOrderByCreatedAtDesc(User user, TaxExport.TaxExportFormat format);

        // Find tax exports by type
        List<TaxExport> findByUserAndExportTypeOrderByCreatedAtDesc(User user, TaxExport.TaxExportType exportType);

        // Find tax exports by status
        List<TaxExport> findByUserAndStatusOrderByCreatedAtDesc(User user, TaxExport.ExportStatus status);

        // Find completed exports
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.status = 'COMPLETED' ORDER BY te.generatedAt DESC")
        List<TaxExport> findCompletedExports(@Param("user") User user);

        // Find pending exports
        List<TaxExport> findByUserAndStatusIn(User user, List<TaxExport.ExportStatus> statuses);

        // Find exports by date range
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.startDate >= :startDate AND te.endDate <= :endDate ORDER BY te.createdAt DESC")
        List<TaxExport> findByUserAndDateRange(
                        @Param("user") User user,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Find latest export for year
        Optional<TaxExport> findFirstByUserAndTaxYearOrderByGeneratedAtDesc(User user, Integer taxYear);

        // Find expired exports
        @Query("SELECT te FROM TaxExport te WHERE te.expiresAt < :currentDate AND te.status = 'COMPLETED'")
        List<TaxExport> findExpiredExports(@Param("currentDate") LocalDate currentDate);

        // Find exports by tax authority
        List<TaxExport> findByUserAndTaxAuthorityOrderByCreatedAtDesc(User user, String taxAuthority);

        // Check if export exists for year and type
        @Query("SELECT COUNT(te) > 0 FROM TaxExport te WHERE te.user = :user AND te.taxYear = :year AND te.exportType = :type AND te.status = 'COMPLETED'")
        boolean existsByUserAndYearAndType(
                        @Param("user") User user,
                        @Param("year") Integer year,
                        @Param("type") TaxExport.TaxExportType type);

        // Count exports by status
        Long countByUserAndStatus(User user, TaxExport.ExportStatus status);

        // Get total deductible expenses across exports
        @Query("SELECT COALESCE(SUM(te.totalDeductibleExpenses), 0) FROM TaxExport te WHERE te.user = :user AND te.taxYear = :year AND te.status = 'COMPLETED'")
        BigDecimal getTotalDeductiblesForYear(@Param("user") User user, @Param("year") Integer year);

        // Get total income across exports
        @Query("SELECT COALESCE(SUM(te.totalIncome), 0) FROM TaxExport te WHERE te.user = :user AND te.taxYear = :year AND te.status = 'COMPLETED'")
        BigDecimal getTotalIncomeForYear(@Param("user") User user, @Param("year") Integer year);

        // Find failed exports
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.status = 'FAILED' ORDER BY te.createdAt DESC")
        List<TaxExport> findFailedExports(@Param("user") User user);

        // Find non-compliant exports
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.isCompliant = false ORDER BY te.createdAt DESC")
        List<TaxExport> findNonCompliantExports(@Param("user") User user);

        // Find exports with warnings
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.warnings IS NOT NULL ORDER BY te.createdAt DESC")
        List<TaxExport> findExportsWithWarnings(@Param("user") User user);

        // Find recent exports
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user ORDER BY te.createdAt DESC")
        List<TaxExport> findRecentExports(@Param("user") User user, Pageable pageable);

        // Get export statistics by year
        @Query("SELECT te.taxYear, COUNT(te), SUM(te.fileSize), AVG(te.totalDeductibleExpenses) FROM TaxExport te WHERE te.user = :user AND te.status = 'COMPLETED' GROUP BY te.taxYear")
        List<Object[]> getExportStatisticsByYear(@Param("user") User user);

        // Count exports by format
        @Query("SELECT te.format, COUNT(te) FROM TaxExport te WHERE te.user = :user GROUP BY te.format")
        List<Object[]> countExportsByFormat(@Param("user") User user);

        // Count exports by type
        @Query("SELECT te.exportType, COUNT(te) FROM TaxExport te WHERE te.user = :user GROUP BY te.exportType")
        List<Object[]> countExportsByType(@Param("user") User user);

        // Find most downloaded exports
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.downloadCount > 0 ORDER BY te.downloadCount DESC")
        List<TaxExport> findMostDownloadedExports(@Param("user") User user, Pageable pageable);

        // Get total file size for user
        @Query("SELECT COALESCE(SUM(te.fileSize), 0) FROM TaxExport te WHERE te.user = :user AND te.status = 'COMPLETED'")
        Long getTotalFileSize(@Param("user") User user);

        // Find exports including receipts
        List<TaxExport> findByUserAndIncludeReceiptsTrueOrderByCreatedAtDesc(User user);

        // Find exports by year and status
        List<TaxExport> findByUserAndTaxYearAndStatusOrderByCreatedAtDesc(
                        User user,
                        Integer taxYear,
                        TaxExport.ExportStatus status);

        // Find exports needing renewal (expiring soon)
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.expiresAt BETWEEN :today AND :futureDate AND te.status = 'COMPLETED'")
        List<TaxExport> findExportsExpiringSoon(
                        @Param("user") User user,
                        @Param("today") LocalDate today,
                        @Param("futureDate") LocalDate futureDate);

        // Get average processing time (for performance monitoring)
        @Query("SELECT AVG(DATEDIFF(te.generatedAt, te.createdAt)) FROM TaxExport te WHERE te.user = :user AND te.status = 'COMPLETED'")
        Double getAverageProcessingTime(@Param("user") User user);

        // Find exports with business expenses
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.businessExpenses > 0 ORDER BY te.createdAt DESC")
        List<TaxExport> findExportsWithBusinessExpenses(@Param("user") User user);

        // Find exports with charitable donations
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.charitableDonations > 0 ORDER BY te.createdAt DESC")
        List<TaxExport> findExportsWithDonations(@Param("user") User user);

        // Find exports with medical expenses
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.medicalExpenses > 0 ORDER BY te.createdAt DESC")
        List<TaxExport> findExportsWithMedicalExpenses(@Param("user") User user);

        // Get deduction summary for year
        @Query("SELECT SUM(te.totalDeductibleExpenses), SUM(te.businessExpenses), SUM(te.medicalExpenses), SUM(te.charitableDonations) FROM TaxExport te WHERE te.user = :user AND te.taxYear = :year AND te.status = 'COMPLETED'")
        Object[] getDeductionSummaryForYear(@Param("user") User user, @Param("year") Integer year);

        // Find full year exports
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.exportType = 'FULL_YEAR' ORDER BY te.taxYear DESC")
        List<TaxExport> findFullYearExports(@Param("user") User user);

        // Find quarterly exports for year
        @Query("SELECT te FROM TaxExport te WHERE te.user = :user AND te.exportType = 'QUARTERLY' AND te.taxYear = :year ORDER BY te.startDate ASC")
        List<TaxExport> findQuarterlyExportsForYear(@Param("user") User user, @Param("year") Integer year);

        // Delete old exports (cleanup)
        void deleteByUserAndCreatedAtBefore(User user, LocalDate cutoffDate);

        // Find exports by tax region
        List<TaxExport> findByUserAndTaxRegionOrderByCreatedAtDesc(User user, String taxRegion);

        // Check if user has any exports for year
        boolean existsByUserAndTaxYear(User user, Integer taxYear);
}
