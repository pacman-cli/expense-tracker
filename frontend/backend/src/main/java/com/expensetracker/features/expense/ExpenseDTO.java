package com.expensetracker.features.expense;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private Long categoryId;
    private String categoryName;
}
