package com.expensetracker.features.expense;

import com.expensetracker.features.category.Category;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Page<ExpenseDTO> getAllExpenses(Long userId, Pageable pageable) {
        return expenseRepository.findByUserId(userId, pageable).map(this::convertToDTO);
    }

    public ExpenseDTO createExpense(Long userId, ExpenseDTO expenseDTO) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Category category = null;
        if (expenseDTO.getCategoryId() != null) {
            category = categoryRepository.findById(expenseDTO.getCategoryId()).orElse(null);
        }

        Expense expense = new Expense();
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());
        expense.setCategory(category);
        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }

    public void deleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own expenses");
        }

        expenseRepository.delete(expense);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate());
        if (expense.getCategory() != null) {
            dto.setCategoryId(expense.getCategory().getId());
            dto.setCategoryName(expense.getCategory().getName());
        }
        return dto;
    }
}
