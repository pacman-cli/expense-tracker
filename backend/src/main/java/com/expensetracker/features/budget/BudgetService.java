package com.expensetracker.features.budget;

import com.expensetracker.entity.User;
import com.expensetracker.features.category.Category;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return budgetRepository.findByUserIdAndYearAndMonth(
            userId,
            now.getYear(),
            now.getMonthValue()
        );
    }

    @Transactional
    public Budget createOrUpdateBudget(
        Long userId,
        Long categoryId,
        BigDecimal amount,
        Integer year,
        Integer month
    ) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryRepository
            .findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

        Optional<Budget> existingBudget =
            budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(
                userId,
                categoryId,
                year,
                month
            );

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
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(
            startOfMonth.lengthOfMonth()
        );

        BigDecimal spent = expenseRepository
            .findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
            .stream()
            .filter(
                e ->
                    e.getCategory() != null &&
                    e.getCategory().getId().equals(categoryId)
            )
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setSpent(spent);

        return budgetRepository.save(budget);
    }

    @Transactional
    public void updateBudgetSpent(Long userId, Integer year, Integer month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndYearAndMonth(
            userId,
            year,
            month
        );

        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(
            startOfMonth.lengthOfMonth()
        );

        for (Budget budget : budgets) {
            BigDecimal spent = expenseRepository
                .findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
                .stream()
                .filter(
                    e ->
                        e.getCategory() != null &&
                        e
                            .getCategory()
                            .getId()
                            .equals(budget.getCategory().getId())
                )
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            budget.setSpent(spent);
            budgetRepository.save(budget);
        }
    }

    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository
            .findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }

    public List<Budget> getBudgetHistory(
        Long userId,
        Long categoryId,
        int months
    ) {
        LocalDate now = LocalDate.now();
        List<Budget> history = new ArrayList<>();

        for (int i = 0; i < months; i++) {
            YearMonth yearMonth = YearMonth.from(now.minusMonths(i));
            int year = yearMonth.getYear();
            int month = yearMonth.getMonthValue();

            List<Budget> monthBudgets;
            if (categoryId != null) {
                monthBudgets = budgetRepository
                    .findByUserIdAndCategoryIdAndYearAndMonth(
                        userId,
                        categoryId,
                        year,
                        month
                    )
                    .map(Collections::singletonList)
                    .orElse(Collections.emptyList());
            } else {
                monthBudgets = budgetRepository.findByUserIdAndYearAndMonth(
                    userId,
                    year,
                    month
                );
            }

            history.addAll(monthBudgets);
        }

        return history;
    }

    public Map<String, Object> getBudgetAnalytics(Long userId) {
        LocalDate now = LocalDate.now();
        List<Budget> currentBudgets = getCurrentMonthBudgets(userId);

        Map<String, Object> analytics = new HashMap<>();

        // Overall stats
        BigDecimal totalBudget = currentBudgets
            .stream()
            .map(Budget::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = currentBudgets
            .stream()
            .map(Budget::getSpent)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRemaining = currentBudgets
            .stream()
            .map(Budget::getRemaining)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long overBudgetCount = currentBudgets
            .stream()
            .filter(Budget::isOverBudget)
            .count();

        long onTrackCount = currentBudgets
            .stream()
            .filter(b -> !b.isOverBudget() && b.getPercentageUsed() < 90.0)
            .count();

        long nearLimitCount = currentBudgets
            .stream()
            .filter(b -> !b.isOverBudget() && b.getPercentageUsed() >= 90.0)
            .count();

        analytics.put("totalBudget", totalBudget);
        analytics.put("totalSpent", totalSpent);
        analytics.put("totalRemaining", totalRemaining);
        analytics.put("overBudgetCount", overBudgetCount);
        analytics.put("onTrackCount", onTrackCount);
        analytics.put("nearLimitCount", nearLimitCount);
        analytics.put("totalBudgets", currentBudgets.size());

        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal overallPercentage = totalSpent
                .multiply(BigDecimal.valueOf(100))
                .divide(totalBudget, 2, RoundingMode.HALF_UP);
            analytics.put("overallPercentageUsed", overallPercentage);
        } else {
            analytics.put("overallPercentageUsed", 0.0);
        }

        // Top spending categories
        List<Map<String, Object>> topCategories = currentBudgets
            .stream()
            .sorted((a, b) -> b.getSpent().compareTo(a.getSpent()))
            .limit(5)
            .map(b -> {
                Map<String, Object> cat = new HashMap<>();
                cat.put("categoryName", b.getCategory().getName());
                cat.put("spent", b.getSpent());
                cat.put("budget", b.getAmount());
                cat.put("percentage", b.getPercentageUsed());
                return cat;
            })
            .collect(Collectors.toList());

        analytics.put("topSpendingCategories", topCategories);

        return analytics;
    }

    public Map<String, Object> getBudgetComparison(
        Long userId,
        int year,
        int month
    ) {
        List<Budget> currentBudgets =
            budgetRepository.findByUserIdAndYearAndMonth(userId, year, month);

        // Get previous month
        YearMonth currentMonth = YearMonth.of(year, month);
        YearMonth previousMonth = currentMonth.minusMonths(1);

        List<Budget> previousBudgets =
            budgetRepository.findByUserIdAndYearAndMonth(
                userId,
                previousMonth.getYear(),
                previousMonth.getMonthValue()
            );

        Map<String, Object> comparison = new HashMap<>();
        List<Map<String, Object>> categoryComparisons = new ArrayList<>();

        for (Budget current : currentBudgets) {
            Map<String, Object> comp = new HashMap<>();
            comp.put("categoryId", current.getCategory().getId());
            comp.put("categoryName", current.getCategory().getName());
            comp.put("currentAmount", current.getAmount());
            comp.put("currentSpent", current.getSpent());
            comp.put("currentPercentage", current.getPercentageUsed());

            Optional<Budget> prevBudget = previousBudgets
                .stream()
                .filter(b ->
                    b
                        .getCategory()
                        .getId()
                        .equals(current.getCategory().getId())
                )
                .findFirst();

            if (prevBudget.isPresent()) {
                Budget prev = prevBudget.get();
                comp.put("previousAmount", prev.getAmount());
                comp.put("previousSpent", prev.getSpent());
                comp.put("previousPercentage", prev.getPercentageUsed());

                BigDecimal spentChange = current
                    .getSpent()
                    .subtract(prev.getSpent());
                comp.put("spentChange", spentChange);

                double percentageChange =
                    current.getPercentageUsed() - prev.getPercentageUsed();
                comp.put("percentageChange", percentageChange);
            } else {
                comp.put("previousAmount", null);
                comp.put("previousSpent", null);
                comp.put("previousPercentage", null);
                comp.put("spentChange", null);
                comp.put("percentageChange", null);
            }

            categoryComparisons.add(comp);
        }

        comparison.put("categories", categoryComparisons);
        comparison.put("currentMonth", month);
        comparison.put("currentYear", year);
        comparison.put("previousMonth", previousMonth.getMonthValue());
        comparison.put("previousYear", previousMonth.getYear());

        return comparison;
    }

    @Transactional
    public int rolloverBudgets(
        Long userId,
        int fromYear,
        int fromMonth,
        int toYear,
        int toMonth
    ) {
        List<Budget> sourceBudgets =
            budgetRepository.findByUserIdAndYearAndMonth(
                userId,
                fromYear,
                fromMonth
            );

        int count = 0;
        for (Budget source : sourceBudgets) {
            Optional<Budget> existing =
                budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(
                    userId,
                    source.getCategory().getId(),
                    toYear,
                    toMonth
                );

            if (existing.isEmpty()) {
                createOrUpdateBudget(
                    userId,
                    source.getCategory().getId(),
                    source.getAmount(),
                    toYear,
                    toMonth
                );
                count++;
            }
        }

        return count;
    }

    @Transactional
    public Budget adjustBudget(
        Long budgetId,
        Long userId,
        BigDecimal amount,
        String type
    ) {
        Budget budget = budgetRepository
            .findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        BigDecimal newAmount;
        if ("increase".equalsIgnoreCase(type)) {
            newAmount = budget.getAmount().add(amount);
        } else if ("decrease".equalsIgnoreCase(type)) {
            newAmount = budget.getAmount().subtract(amount);
            if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
                newAmount = BigDecimal.ZERO;
            }
        } else {
            throw new RuntimeException("Invalid adjustment type");
        }

        budget.setAmount(newAmount);
        return budgetRepository.save(budget);
    }

    @Transactional
    public Budget duplicateBudget(
        Long budgetId,
        Long userId,
        int targetYear,
        int targetMonth
    ) {
        Budget source = budgetRepository
            .findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!source.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return createOrUpdateBudget(
            userId,
            source.getCategory().getId(),
            source.getAmount(),
            targetYear,
            targetMonth
        );
    }

    public Map<String, Object> getBudgetDetails(Long budgetId, Long userId) {
        Budget budget = budgetRepository
            .findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("id", budget.getId());
        details.put("categoryName", budget.getCategory().getName());
        details.put("categoryColor", budget.getCategory().getColor());
        details.put("amount", budget.getAmount());
        details.put("spent", budget.getSpent());
        details.put("remaining", budget.getRemaining());
        details.put("percentageUsed", budget.getPercentageUsed());
        details.put("isOverBudget", budget.isOverBudget());
        details.put("month", budget.getMonth());
        details.put("year", budget.getYear());

        // Get expenses for this budget
        LocalDate startOfMonth = LocalDate.of(
            budget.getYear(),
            budget.getMonth(),
            1
        );
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(
            startOfMonth.lengthOfMonth()
        );

        List<Expense> expenses = expenseRepository
            .findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
            .stream()
            .filter(
                e ->
                    e.getCategory() != null &&
                    e.getCategory().getId().equals(budget.getCategory().getId())
            )
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());

        List<Map<String, Object>> expenseList = expenses
            .stream()
            .map(e -> {
                Map<String, Object> exp = new HashMap<>();
                exp.put("id", e.getId());
                exp.put("description", e.getDescription());
                exp.put("amount", e.getAmount());
                exp.put("date", e.getDate().toString());
                return exp;
            })
            .collect(Collectors.toList());

        details.put("expenses", expenseList);
        details.put("transactionCount", expenses.size());

        // Daily average
        int daysInMonth = startOfMonth.lengthOfMonth();
        int currentDay = LocalDate.now().getDayOfMonth();
        int daysElapsed = Math.min(currentDay, daysInMonth);

        if (daysElapsed > 0) {
            BigDecimal dailyAverage = budget
                .getSpent()
                .divide(
                    BigDecimal.valueOf(daysElapsed),
                    2,
                    RoundingMode.HALF_UP
                );
            details.put("dailyAverage", dailyAverage);

            BigDecimal projectedSpending = dailyAverage.multiply(
                BigDecimal.valueOf(daysInMonth)
            );
            details.put("projectedMonthlySpending", projectedSpending);

            if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal projectedPercentage = projectedSpending
                    .multiply(BigDecimal.valueOf(100))
                    .divide(budget.getAmount(), 2, RoundingMode.HALF_UP);
                details.put("projectedPercentage", projectedPercentage);
            }
        }

        return details;
    }

    public List<Map<String, Object>> getBudgetAlerts(Long userId) {
        List<Budget> currentBudgets = getCurrentMonthBudgets(userId);
        List<Map<String, Object>> alerts = new ArrayList<>();

        for (Budget budget : currentBudgets) {
            if (budget.isOverBudget()) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("type", "over_budget");
                alert.put("severity", "high");
                alert.put("categoryName", budget.getCategory().getName());
                alert.put("budgetId", budget.getId());
                alert.put("amount", budget.getAmount());
                alert.put("spent", budget.getSpent());
                alert.put(
                    "over",
                    budget.getSpent().subtract(budget.getAmount())
                );
                alert.put(
                    "message",
                    String.format(
                        "You've exceeded your %s budget by ৳%.2f",
                        budget.getCategory().getName(),
                        budget
                            .getSpent()
                            .subtract(budget.getAmount())
                            .doubleValue()
                    )
                );
                alerts.add(alert);
            } else if (budget.getPercentageUsed() >= 90.0) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("type", "near_limit");
                alert.put("severity", "medium");
                alert.put("categoryName", budget.getCategory().getName());
                alert.put("budgetId", budget.getId());
                alert.put("amount", budget.getAmount());
                alert.put("spent", budget.getSpent());
                alert.put("remaining", budget.getRemaining());
                alert.put(
                    "message",
                    String.format(
                        "%s budget is %.1f%% used. Only ৳%.2f remaining.",
                        budget.getCategory().getName(),
                        budget.getPercentageUsed(),
                        budget.getRemaining().doubleValue()
                    )
                );
                alerts.add(alert);
            } else if (budget.getPercentageUsed() >= 75.0) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("type", "warning");
                alert.put("severity", "low");
                alert.put("categoryName", budget.getCategory().getName());
                alert.put("budgetId", budget.getId());
                alert.put("amount", budget.getAmount());
                alert.put("spent", budget.getSpent());
                alert.put("remaining", budget.getRemaining());
                alert.put(
                    "message",
                    String.format(
                        "%s budget is %.1f%% used.",
                        budget.getCategory().getName(),
                        budget.getPercentageUsed()
                    )
                );
                alerts.add(alert);
            }
        }

        return alerts;
    }
}
