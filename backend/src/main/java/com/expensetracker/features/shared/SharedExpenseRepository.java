package com.expensetracker.features.shared;

import com.expensetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SharedExpenseRepository extends JpaRepository<SharedExpense, Long> {

       // Find shared expenses where user is the payer
       Page<SharedExpense> findByPaidBy(User user, Pageable pageable);

       // Find shared expenses where user is a participant
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "JOIN FETCH se.expense e " +
                     "LEFT JOIN FETCH e.category " +
                     "JOIN se.participants p " +
                     "WHERE p.user = :user")
       Page<SharedExpense> findByParticipantUser(@Param("user") User user, Pageable pageable);

       // Find all shared expenses involving a user (either as payer or participant)
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "JOIN FETCH se.expense e " +
                     "LEFT JOIN FETCH e.category " +
                     "LEFT JOIN se.participants p " +
                     "WHERE se.paidBy = :user OR p.user = :user")
       Page<SharedExpense> findAllByUser(@Param("user") User user, Pageable pageable);

       // Find unsettled shared expenses for user
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "JOIN FETCH se.expense e " +
                     "LEFT JOIN FETCH e.category " +
                     "LEFT JOIN se.participants p " +
                     "WHERE (se.paidBy = :user OR p.user = :user) " +
                     "AND se.isSettled = false")
       List<SharedExpense> findUnsettledByUser(@Param("user") User user);

       // Find settled shared expenses for user
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "JOIN FETCH se.expense e " +
                     "LEFT JOIN FETCH e.category " +
                     "LEFT JOIN se.participants p " +
                     "WHERE (se.paidBy = :user OR p.user = :user) " +
                     "AND se.isSettled = true")
       Page<SharedExpense> findSettledByUser(@Param("user") User user, Pageable pageable);

       // Find shared expenses by group name
       @Query("SELECT se FROM SharedExpense se " +
                     "WHERE se.paidBy = :user " +
                     "AND LOWER(se.groupName) LIKE LOWER(CONCAT('%', :groupName, '%'))")
       List<SharedExpense> findByUserAndGroupName(@Param("user") User user, @Param("groupName") String groupName);

       // Find shared expenses by split type
       List<SharedExpense> findByPaidByAndSplitType(User user, SharedExpense.SplitType splitType);

       // Get total amount user paid for others
       @Query("SELECT COALESCE(SUM(se.totalAmount), 0) FROM SharedExpense se " +
                     "WHERE se.paidBy = :user AND se.isSettled = false")
       BigDecimal getTotalAmountPaidByUser(@Param("user") User user);

       // Get total amount user owes
       @Query("SELECT COALESCE(SUM(p.shareAmount), 0) FROM SharedExpenseParticipant p " +
                     "WHERE p.user = :user AND p.isPaid = false")
       BigDecimal getTotalAmountOwedByUser(@Param("user") User user);

       // Get total amount owed to user
       @Query("SELECT COALESCE(SUM(p.shareAmount), 0) FROM SharedExpenseParticipant p " +
                     "JOIN p.sharedExpense se " +
                     "WHERE se.paidBy = :user AND p.isPaid = false AND p.user != :user")
       BigDecimal getTotalAmountOwedToUser(@Param("user") User user);

       // Find shared expenses by date range
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "WHERE se.paidBy = :user " +
                     "AND se.createdAt BETWEEN :startDate AND :endDate")
       List<SharedExpense> findByUserAndDateRange(
                     @Param("user") User user,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       // Count unsettled shared expenses for user
       @Query("SELECT COUNT(DISTINCT se) FROM SharedExpense se " +
                     "LEFT JOIN se.participants p " +
                     "WHERE (se.paidBy = :user OR p.user = :user) " +
                     "AND se.isSettled = false")
       Long countUnsettledByUser(@Param("user") User user);

       // Find shared expenses where user owes money
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "JOIN se.participants p " +
                     "WHERE p.user = :user AND p.isPaid = false")
       List<SharedExpense> findWhereUserOwes(@Param("user") User user);

       // Find shared expenses where others owe user
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "JOIN se.participants p " +
                     "WHERE se.paidBy = :user AND p.isPaid = false AND p.user != :user")
       List<SharedExpense> findWhereOthersOweUser(@Param("user") User user);

       // Get shared expense statistics for user
       @Query("SELECT COUNT(se), SUM(se.totalAmount), se.splitType " +
                     "FROM SharedExpense se " +
                     "WHERE se.paidBy = :user " +
                     "GROUP BY se.splitType")
       List<Object[]> getSharedExpenseStatistics(@Param("user") User user);

       // Find recent shared expenses
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "LEFT JOIN se.participants p " +
                     "WHERE se.paidBy = :user OR p.user = :user " +
                     "ORDER BY se.createdAt DESC")
       List<SharedExpense> findRecentByUser(@Param("user") User user, Pageable pageable);

       // Find shared expenses by minimum amount
       @Query("SELECT se FROM SharedExpense se " +
                     "WHERE se.paidBy = :user AND se.totalAmount >= :minAmount")
       List<SharedExpense> findByUserAndMinAmount(@Param("user") User user, @Param("minAmount") BigDecimal minAmount);

       // Find overdue shared expenses (unsettled for more than 30 days)
       @Query("SELECT DISTINCT se FROM SharedExpense se " +
                     "WHERE se.paidBy = :user " +
                     "AND se.isSettled = false " +
                     "AND se.createdAt < :cutoffDate")
       List<SharedExpense> findOverdueByUser(@Param("user") User user, @Param("cutoffDate") LocalDateTime cutoffDate);

       // Check if user has any pending shared expenses
       @Query("SELECT CASE WHEN COUNT(se) > 0 THEN true ELSE false END " +
                     "FROM SharedExpense se " +
                     "LEFT JOIN se.participants p " +
                     "WHERE (se.paidBy = :user OR p.user = :user) " +
                     "AND se.isSettled = false")
       boolean hasUnsettledExpenses(@Param("user") User user);
}
