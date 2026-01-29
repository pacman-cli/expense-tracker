package com.expensetracker.features.category;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CategoryDTO> getAllCategories(Long userId) {
        return categoryRepository.findByUserId(userId).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public CategoryDTO createCategory(Long userId, CategoryDTO categoryDTO) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setColor(categoryDTO.getColor());
        category.setIcon(categoryDTO.getIcon());
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public CategoryDTO updateCategory(Long categoryId, Long userId, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Validate ownership
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own categories");
        }

        category.setName(categoryDTO.getName());
        category.setColor(categoryDTO.getColor());
        if (categoryDTO.getIcon() != null) {
            category.setIcon(categoryDTO.getIcon());
        }

        Category updated = categoryRepository.save(category);
        return convertToDTO(updated);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setColor(category.getColor());
        dto.setIcon(category.getIcon());
        return dto;
    }
}
