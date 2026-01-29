package com.expensetracker.features.category;

import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private String color;
    private String icon;
}
