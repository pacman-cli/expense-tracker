package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecurringExpenseDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String description;
    private BigDecimal amount;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextDueDate;
    private Boolean active;
}
