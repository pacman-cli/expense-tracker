package com.expensetracker.features.shared;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class SharedExpenseDTO {

    private Long id;
    private Long expenseId;
    private String description;
    private String groupName;
    private String splitType;
    private List<SharedExpenseParticipantDTO> participants;
}
