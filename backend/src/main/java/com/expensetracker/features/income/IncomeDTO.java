package com.expensetracker.features.income;

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
public class IncomeDTO {
    private Long id;
    private String source;
    private BigDecimal amount;
    private LocalDate date;
    private String description;
    private Long walletId;
    private String walletName;
}
