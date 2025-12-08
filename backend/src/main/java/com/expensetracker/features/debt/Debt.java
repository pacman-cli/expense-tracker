package com.expensetracker.features.debt;

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
import java.util.HashSet;
import java.util.Set;

@Data
@lombok.EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "debts")
public class Debt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 255)
    private String title; // e.g., "Loan to John", "Credit Card Debt"

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DebtType type; // BORROWED (I owe someone), LENT (Someone owes me)

    @Column(nullable = false)
    private BigDecimal principalAmount; // Original amount

    @Column(nullable = false)
    private BigDecimal remainingAmount; // Amount still owed

    @Column(nullable = false)
    private BigDecimal interestRate; // Annual interest rate percentage

    @Column(length = 255)
    private String creditorDebtor; // Name of the person/institution

    @Column(length = 255)
    private String contactInfo; // Email or phone

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate dueDate; // When it should be fully paid

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DebtStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentFrequency paymentFrequency;

    private BigDecimal installmentAmount; // For recurring payments

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRecurring = false; // EMI or installment plan

    @OneToMany(mappedBy = "debt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private Set<DebtPayment> payments = new HashSet<>();

    @Column(length = 500)
    private String attachmentUrl; // Contract or agreement document

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    public enum DebtType {
        BORROWED, // Money I owe to someone (liability)
        LENT // Money someone owes to me (asset)
    }

    public enum DebtStatus {
        ACTIVE,
        PAID_OFF,
        OVERDUE,
        DEFAULTED,
        PARTIALLY_PAID,
        WAIVED
    }

    public enum PaymentFrequency {
        WEEKLY,
        BI_WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY,
        ONE_TIME
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    // Helper method to add payment
    public void addPayment(DebtPayment payment) {
        payments.add(payment);
        payment.setDebt(this);

        // Update remaining amount
        if (payment.getAmount() != null) {
            this.remainingAmount = this.remainingAmount.subtract(payment.getAmount());

            // Update status based on remaining amount
            if (this.remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                this.status = DebtStatus.PAID_OFF;
            } else if (this.remainingAmount.compareTo(this.principalAmount) < 0) {
                this.status = DebtStatus.PARTIALLY_PAID;
            }
        }
    }

    // Helper method to calculate total paid
    public BigDecimal getTotalPaid() {
        return principalAmount.subtract(remainingAmount);
    }

    // Helper method to calculate payment progress percentage
    public BigDecimal getPaymentProgress() {
        if (principalAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return getTotalPaid()
                .multiply(BigDecimal.valueOf(100))
                .divide(principalAmount, 2, java.math.RoundingMode.HALF_UP);
    }

    // Check if debt is overdue
    public boolean isOverdue() {
        return dueDate != null &&
                LocalDate.now().isAfter(dueDate) &&
                status == DebtStatus.ACTIVE;
    }
}
