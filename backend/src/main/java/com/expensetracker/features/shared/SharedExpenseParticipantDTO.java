package com.expensetracker.features.shared;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class SharedExpenseParticipantDTO {

    private Long userId;
    private String externalName;
    private String externalEmail;
    private BigDecimal shareAmount;
    private BigDecimal sharePercentage;
    private Integer shareUnits;
    private String status;
    private String notes;
}
