package com.expensetracker.features.receipt;

import com.expensetracker.entity.BaseEntity;
import com.expensetracker.entity.User;
import com.expensetracker.features.expense.Expense;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@lombok.EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "receipts")
public class Receipt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id")
    private Expense expense;

    @Column(name = "linked_expense_id")
    private Long linkedExpenseId;

    @Column(nullable = false)
    private String imageUrl; // Path to stored receipt image

    @Column(length = 1000)
    private String ocrText; // Raw OCR extracted text

    @Column(length = 500)
    private String merchantName;

    private BigDecimal extractedAmount;

    private LocalDateTime extractedDate;

    @Column(length = 100)
    private String extractedCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessingStatus status;

    @Column(length = 1000)
    private String errorMessage;

    private Integer confidence; // OCR confidence score 0-100

    public enum ProcessingStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        MANUAL_REVIEW_NEEDED,
    }
}
