package com.expensetracker.features.debt;

import com.expensetracker.entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    // Find all debts for user
    List<Debt> findByUser(User user);

    Page<Debt> findByUser(User user, Pageable pageable);

    // Find debts by type (borrowed vs lent)
    List<Debt> findByUserAndType(User user, Debt.DebtType type);

    // Find debts by status
    List<Debt> findByUserAndStatus(User user, Debt.DebtStatus status);

    // Find overdue debts
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.dueDate < :currentDate AND d.status = 'ACTIVE'"
    )
    List<Debt> findOverdueDebts(
        @Param("user") User user,
        @Param("currentDate") LocalDate currentDate
    );

    // Get total borrowed amount (money user owes)
    @Query(
        "SELECT COALESCE(SUM(d.remainingAmount), 0) FROM Debt d WHERE d.user = :user AND d.type = 'BORROWED' AND d.status != 'PAID_OFF'"
    )
    BigDecimal getTotalBorrowedAmount(@Param("user") User user);

    // Get total lent amount (money owed to user)
    @Query(
        "SELECT COALESCE(SUM(d.remainingAmount), 0) FROM Debt d WHERE d.user = :user AND d.type = 'LENT' AND d.status != 'PAID_OFF'"
    )
    BigDecimal getTotalLentAmount(@Param("user") User user);

    // Get total debt by type and status
    @Query(
        "SELECT COALESCE(SUM(d.remainingAmount), 0) FROM Debt d WHERE d.user = :user AND d.type = :type AND d.status = :status"
    )
    BigDecimal getTotalDebtByTypeAndStatus(
        @Param("user") User user,
        @Param("type") Debt.DebtType type,
        @Param("status") Debt.DebtStatus status
    );

    // Find debts due within specific days
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.dueDate BETWEEN :startDate AND :endDate AND d.status = 'ACTIVE'"
    )
    List<Debt> findDebtsDueWithinPeriod(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Find high priority debts
    List<Debt> findByUserAndPriorityAndStatus(
        User user,
        Debt.Priority priority,
        Debt.DebtStatus status
    );

    // Find recurring debts (EMI/installments)
    List<Debt> findByUserAndIsRecurringTrue(User user);

    // Get debt statistics by type
    @Query(
        "SELECT d.type, COUNT(d), SUM(d.principalAmount), SUM(d.remainingAmount) FROM Debt d WHERE d.user = :user GROUP BY d.type"
    )
    List<Object[]> getDebtStatisticsByType(@Param("user") User user);

    // Find debts by creditor/debtor name (fuzzy search)
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND LOWER(d.creditorDebtor) LIKE LOWER(CONCAT('%', :name, '%'))"
    )
    List<Debt> findByUserAndCreditorDebtorContaining(
        @Param("user") User user,
        @Param("name") String name
    );

    // Find debts by date range
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.startDate BETWEEN :startDate AND :endDate"
    )
    List<Debt> findByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Count active debts
    Long countByUserAndStatus(User user, Debt.DebtStatus status);

    // Find debts with high interest rates
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.interestRate >= :minRate AND d.status = 'ACTIVE'"
    )
    List<Debt> findHighInterestDebts(
        @Param("user") User user,
        @Param("minRate") BigDecimal minRate
    );

    // Get total interest paid
    @Query(
        "SELECT COALESCE(SUM(dp.interestPortion), 0) FROM DebtPayment dp JOIN dp.debt d WHERE d.user = :user"
    )
    BigDecimal getTotalInterestPaid(@Param("user") User user);

    // Get payment history for debt
    @Query(
        "SELECT dp FROM DebtPayment dp WHERE dp.debt.id = :debtId ORDER BY dp.paymentDate DESC"
    )
    List<DebtPayment> findPaymentsByDebtId(@Param("debtId") Long debtId);

    // Find recently added debts
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user ORDER BY d.createdAt DESC"
    )
    List<Debt> findRecentDebts(@Param("user") User user, Pageable pageable);

    // Find debts nearing due date (within 7 days)
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.dueDate BETWEEN :today AND :futureDate AND d.status = 'ACTIVE'"
    )
    List<Debt> findDebtsNearingDueDate(
        @Param("user") User user,
        @Param("today") LocalDate today,
        @Param("futureDate") LocalDate futureDate
    );

    // Get average interest rate for user's debts
    @Query(
        "SELECT AVG(d.interestRate) FROM Debt d WHERE d.user = :user AND d.type = :type AND d.status = 'ACTIVE'"
    )
    BigDecimal getAverageInterestRate(
        @Param("user") User user,
        @Param("type") Debt.DebtType type
    );

    // Find partially paid debts
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.status = 'PARTIALLY_PAID' ORDER BY d.dueDate ASC"
    )
    List<Debt> findPartiallyPaidDebts(@Param("user") User user);

    // Get debt payment progress
    @Query(
        "SELECT d.id, d.title, d.principalAmount, d.remainingAmount, " +
            "(d.principalAmount - d.remainingAmount) as paidAmount " +
            "FROM Debt d WHERE d.user = :user AND d.status != 'PAID_OFF'"
    )
    List<Object[]> getDebtPaymentProgress(@Param("user") User user);

    // Find debts by payment frequency
    List<Debt> findByUserAndPaymentFrequency(
        User user,
        Debt.PaymentFrequency frequency
    );

    // Get total debt principal (original amounts)
    @Query(
        "SELECT COALESCE(SUM(d.principalAmount), 0) FROM Debt d WHERE d.user = :user AND d.type = :type"
    )
    BigDecimal getTotalPrincipalByType(
        @Param("user") User user,
        @Param("type") Debt.DebtType type
    );

    // Find debts with no payments made
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.principalAmount = d.remainingAmount AND d.status = 'ACTIVE'"
    )
    List<Debt> findDebtsWithNoPayments(@Param("user") User user);

    // Get monthly payment obligations (recurring debts)
    @Query(
        "SELECT COALESCE(SUM(d.installmentAmount), 0) FROM Debt d " +
            "WHERE d.user = :user AND d.isRecurring = true AND d.status = 'ACTIVE' AND d.paymentFrequency = 'MONTHLY'"
    )
    BigDecimal getMonthlyPaymentObligations(@Param("user") User user);

    // Find debts by minimum remaining amount
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.remainingAmount >= :minAmount AND d.status = 'ACTIVE'"
    )
    List<Debt> findByUserAndMinRemainingAmount(
        @Param("user") User user,
        @Param("minAmount") BigDecimal minAmount
    );

    // Check if user has any active debts
    boolean existsByUserAndStatus(User user, Debt.DebtStatus status);

    // Get debt-to-income ratio data
    @Query(
        "SELECT COALESCE(SUM(d.remainingAmount), 0) FROM Debt d WHERE d.user = :user AND d.type = 'BORROWED' AND d.status IN ('ACTIVE', 'PARTIALLY_PAID', 'OVERDUE')"
    )
    BigDecimal getTotalActiveDebtAmount(@Param("user") User user);

    // Find debts settled in a period
    @Query(
        "SELECT d FROM Debt d WHERE d.user = :user AND d.status = 'PAID_OFF' AND d.updatedAt BETWEEN :startDate AND :endDate"
    )
    List<Debt> findSettledDebtsInPeriod(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Find debts by status and due date before
    List<Debt> findByUserAndStatusAndDueDateBefore(
        User user,
        Debt.DebtStatus status,
        LocalDate date
    );
}
