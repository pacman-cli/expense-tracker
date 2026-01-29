package com.expensetracker.features.receipt;

import com.expensetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    // Find receipts by user
    Page<Receipt> findByUser(User user, Pageable pageable);

    // Find receipts by user and status
    Page<Receipt> findByUserAndStatus(User user, Receipt.ProcessingStatus status, Pageable pageable);

    // Find receipts without linked expense
    List<Receipt> findByUserAndExpenseIsNull(User user);

    // Find receipts by confidence threshold
    @Query("SELECT r FROM Receipt r WHERE r.user = :user AND r.confidence >= :minConfidence")
    List<Receipt> findByUserAndMinimumConfidence(@Param("user") User user, @Param("minConfidence") Integer minConfidence);

    // Find pending receipts
    List<Receipt> findByUserAndStatusIn(User user, List<Receipt.ProcessingStatus> statuses);

    // Find receipts needing manual review
    List<Receipt> findByUserAndStatus(User user, Receipt.ProcessingStatus status);

    // Find receipts by date range
    @Query("SELECT r FROM Receipt r WHERE r.user = :user AND r.extractedDate BETWEEN :startDate AND :endDate")
    List<Receipt> findByUserAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Count receipts by status for user
    Long countByUserAndStatus(User user, Receipt.ProcessingStatus status);

    // Find receipts by merchant name (fuzzy search)
    @Query("SELECT r FROM Receipt r WHERE r.user = :user AND LOWER(r.merchantName) LIKE LOWER(CONCAT('%', :merchantName, '%'))")
    List<Receipt> findByUserAndMerchantNameContaining(@Param("user") User user, @Param("merchantName") String merchantName);

    // Find receipts by category
    @Query("SELECT r FROM Receipt r WHERE r.user = :user AND r.extractedCategory = :category")
    List<Receipt> findByUserAndCategory(@Param("user") User user, @Param("category") String category);

    // Find recent receipts
    @Query("SELECT r FROM Receipt r WHERE r.user = :user ORDER BY r.createdAt DESC")
    List<Receipt> findRecentByUser(@Param("user") User user, Pageable pageable);

    // Find receipts that failed processing
    @Query("SELECT r FROM Receipt r WHERE r.user = :user AND r.status = 'FAILED' AND r.createdAt >= :since")
    List<Receipt> findFailedReceiptsSince(@Param("user") User user, @Param("since") LocalDateTime since);

    // Get receipt statistics
    @Query("SELECT COUNT(r), AVG(r.confidence), r.status FROM Receipt r WHERE r.user = :user GROUP BY r.status")
    List<Object[]> getReceiptStatisticsByUser(@Param("user") User user);

    // Find unprocessed receipts older than specific date
    @Query("SELECT r FROM Receipt r WHERE r.status = 'PENDING' AND r.createdAt < :cutoffDate")
    List<Receipt> findStaleUnprocessedReceipts(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Check if receipt exists by image URL
    boolean existsByImageUrl(String imageUrl);

    // Find receipts by expense ID
    Optional<Receipt> findByExpenseId(Long expenseId);
}
