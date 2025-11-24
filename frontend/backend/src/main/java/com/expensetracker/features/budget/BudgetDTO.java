package com.expensetracker.features.budget;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private BigDecimal amount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private Integer month;
    private Integer year;
    private Double percentageUsed;
    private Boolean isOverBudget;
}
