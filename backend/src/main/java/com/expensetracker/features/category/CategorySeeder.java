package com.expensetracker.features.category;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class CategorySeeder {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public void seedDefaultCategories(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has categories
        if (categoryRepository.findByUserId(userId).isEmpty()) {
            List<CategoryData> defaultCategories = Arrays.asList(
                    new CategoryData("Food & Dining", "#EF4444", "🍔"),
                    new CategoryData("Transportation", "#3B82F6", "🚗"),
                    new CategoryData("Shopping", "#8B5CF6", "🛍️"),
                    new CategoryData("Bills & Utilities", "#F59E0B", "💡"),
                    new CategoryData("Entertainment", "#EC4899", "🎬"),
                    new CategoryData("Health & Fitness", "#10B981", "💪"),
                    new CategoryData("Travel", "#06B6D4", "✈️"),
                    new CategoryData("Education", "#6366F1", "📚"),
                    new CategoryData("Personal Care", "#F97316", "💄"),
                    new CategoryData("Others", "#6B7280", "📌"));

            for (CategoryData data : defaultCategories) {
                Category category = new Category();
                category.setName(data.name);
                category.setColor(data.color);
                category.setIcon(data.icon);
                category.setUser(user);
                categoryRepository.save(category);
            }
        }
    }

    private static class CategoryData {
        String name;
        String color;
        String icon;

        CategoryData(String name, String color, String icon) {
            this.name = name;
            this.color = color;
            this.icon = icon;
        }
    }
}
