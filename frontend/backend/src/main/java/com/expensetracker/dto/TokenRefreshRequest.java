package com.expensetracker.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
