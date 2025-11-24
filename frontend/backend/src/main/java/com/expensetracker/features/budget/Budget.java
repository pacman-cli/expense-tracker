package com.expensetracker.features.budget;

import com.expensetracker.entity.BaseEntity;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "budgets")
public class Budget extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private Integer month; // 1-12

    @Column(nullable = false)
    private Integer year; // e.g., 2024

    @Column(nullable = false)
    private BigDecimal spent = BigDecimal.ZERO;

    public double getPercentageUsed() {
        if (amount.compareTo(BigDecimal.ZERO) == 0) return 0;
        return (spent.doubleValue() / amount.doubleValue()) * 100;
    }

    public BigDecimal getRemaining() {
        return amount.subtract(spent);
    }

    public boolean isOverBudget() {
        return spent.compareTo(amount) > 0;
    }
}
