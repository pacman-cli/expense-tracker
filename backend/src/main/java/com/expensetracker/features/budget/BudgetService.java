package com.expensetracker.features.budget;

import com.expensetracker.features.category.Category;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public List<Budget> getBudgetsForUser(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public List<Budget> getCurrentMonthBudgets(Long userId) {
        LocalDate now = LocalDate.now();
        return budgetRepository.findByUserIdAndYearAndMonth(userId, now.getYear(), now.getMonthValue());
    }

    @Transactional
    public Budget createOrUpdateBudget(Long userId, Long categoryId, BigDecimal amount, Integer year, Integer month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Optional<Budget> existingBudget = budgetRepository
                .findByUserIdAndCategoryIdAndYearAndMonth(userId, categoryId, year, month);

        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setAmount(amount);
        } else {
            budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .amount(amount)
                    .year(year)
                    .month(month)
                    .spent(BigDecimal.ZERO)
                    .build();
        }

        // Calculate current spent amount
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        BigDecimal spent = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
                .stream()
                .filter(e -> e.getCategory() != null && e.getCategory().getId().equals(categoryId))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setSpent(spent);

        return budgetRepository.save(budget);
    }

    @Transactional
    public void updateBudgetSpent(Long userId, Integer year, Integer month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month);

        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        for (Budget budget : budgets) {
            BigDecimal spent = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
                    .stream()
                    .filter(e -> e.getCategory() != null &&
                            e.getCategory().getId().equals(budget.getCategory().getId()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            budget.setSpent(spent);
            budgetRepository.save(budget);
        }
    }

    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }
}
