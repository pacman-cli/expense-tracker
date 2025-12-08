package com.expensetracker.entity;

import com.expensetracker.features.category.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@lombok.EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recurring_expenses")
public class RecurringExpense extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @Column(nullable = false)
    private LocalDate nextDueDate;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    public enum Frequency {
        DAILY,
        WEEKLY,
        BIWEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    public void updateNextDueDate() {
        switch (frequency) {
            case DAILY:
                this.nextDueDate = this.nextDueDate.plusDays(1);
                break;
            case WEEKLY:
                this.nextDueDate = this.nextDueDate.plusWeeks(1);
                break;
            case BIWEEKLY:
                this.nextDueDate = this.nextDueDate.plusWeeks(2);
                break;
            case MONTHLY:
                this.nextDueDate = this.nextDueDate.plusMonths(1);
                break;
            case QUARTERLY:
                this.nextDueDate = this.nextDueDate.plusMonths(3);
                break;
            case YEARLY:
                this.nextDueDate = this.nextDueDate.plusYears(1);
                break;
        }
    }

    public boolean isDue() {
        return active && nextDueDate.isBefore(LocalDate.now().plusDays(1));
    }

    public boolean isExpired() {
        return endDate != null && LocalDate.now().isAfter(endDate);
    }
}
