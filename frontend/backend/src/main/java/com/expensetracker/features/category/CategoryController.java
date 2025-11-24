package com.expensetracker.features.category;

import com.expensetracker.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<CategoryDTO> getAllCategories(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return categoryService.getAllCategories(userDetails.getId());
    }

    @PostMapping
    public CategoryDTO createCategory(Authentication authentication, @RequestBody CategoryDTO categoryDTO) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return categoryService.createCategory(userDetails.getId(), categoryDTO);
    }

    @PutMapping("/{id}")
    public CategoryDTO updateCategory(@PathVariable Long id, Authentication authentication, @RequestBody CategoryDTO categoryDTO) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return categoryService.updateCategory(id, userDetails.getId(), categoryDTO);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
