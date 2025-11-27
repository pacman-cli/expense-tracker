package com.expensetracker.features.debt;

import com.expensetracker.entity.BaseEntity;
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
@Table(name = "debt_payments")
public class DebtPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debt_id", nullable = false)
    private Debt debt;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(length = 255)
    private String transactionId; // Bank transaction or reference ID

    @Column(length = 500)
    private String receiptUrl; // Receipt or proof of payment

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    private BigDecimal interestPortion; // Interest component of payment
    private BigDecimal principalPortion; // Principal component of payment

    public enum PaymentMethod {
        CASH,
        BANK_TRANSFER,
        CHECK,
        MOBILE_BANKING,
        CREDIT_CARD,
        DEBIT_CARD,
        OTHER
    }
}
