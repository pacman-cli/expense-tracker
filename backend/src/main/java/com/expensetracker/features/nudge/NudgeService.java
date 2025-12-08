package com.expensetracker.features.nudge;

import com.expensetracker.entity.RecurringExpense;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.Category;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.RecurringExpenseRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NudgeService {

    private final NudgeRepository nudgeRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;

    public List<Nudge> getNudges(User user) {
        return nudgeRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Nudge> getUnreadNudges(User user) {
        return nudgeRepository.findByUserAndIsReadOrderByCreatedAtDesc(
            user,
            false
        );
    }

    public Nudge markAsRead(User user, Long nudgeId) {
        Nudge nudge = nudgeRepository
            .findById(nudgeId)
            .orElseThrow(() -> new RuntimeException("Nudge not found"));

        if (!nudge.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        nudge.setIsRead(true);
        return nudgeRepository.save(nudge);
    }

    public void dismissNudge(User user, Long nudgeId) {
        Nudge nudge = nudgeRepository
            .findById(nudgeId)
            .orElseThrow(() -> new RuntimeException("Nudge not found"));

        if (!nudge.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized");
        }

        nudgeRepository.delete(nudge);
    }

    public Map<String, Object> getNudgeStats(User user) {
        Long unreadCount = nudgeRepository.countByUserAndIsRead(user, false);
        Long totalCount = (long) nudgeRepository
            .findByUserOrderByCreatedAtDesc(user)
            .size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("unreadCount", unreadCount);
        stats.put("totalCount", totalCount);
        stats.put("readCount", totalCount - unreadCount);

        return stats;
    }

    public int generateNudges(User user) {
        log.info("Generating nudges for user: {}", user.getId());

        int nudgesGenerated = 0;

        try {
            // Generate different types of nudges
            nudgesGenerated += generateBudgetAlerts(user);
        } catch (Exception e) {
            log.error(
                "Error generating budget alerts for user {}: {}",
                user.getId(),
                e.getMessage(),
                e
            );
        }

        try {
            nudgesGenerated += generateUnusualSpendingAlerts(user);
        } catch (Exception e) {
            log.error(
                "Error generating unusual spending alerts for user {}: {}",
                user.getId(),
                e.getMessage(),
                e
            );
        }

        try {
            nudgesGenerated += generateBillReminders(user);
        } catch (Exception e) {
            log.error(
                "Error generating bill reminders for user {}: {}",
                user.getId(),
                e.getMessage(),
                e
            );
        }

        try {
            nudgesGenerated += generateSavingsOpportunities(user);
        } catch (Exception e) {
            log.error(
                "Error generating savings opportunities for user {}: {}",
                user.getId(),
                e.getMessage(),
                e
            );
        }

        try {
            nudgesGenerated += generateSpendingInsights(user);
        } catch (Exception e) {
            log.error(
                "Error generating spending insights for user {}: {}",
                user.getId(),
                e.getMessage(),
                e
            );
        }

        // If no nudges were generated, create a welcome/helpful nudge
        if (nudgesGenerated == 0) {
            nudgesGenerated += generateWelcomeNudge(user);
        }

        log.info(
            "Finished generating {} nudges for user: {}",
            nudgesGenerated,
            user.getId()
        );
        
        return nudgesGenerated;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int generateBudgetAlerts(User user) {
        log.debug("Generating budget alerts for user: {}", user.getId());
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate now = LocalDate.now();

        List<Category> categories = categoryRepository.findByUserId(
            user.getId()
        );
        log.debug(
            "Found {} categories for user: {}",
            categories.size(),
            user.getId()
        );

        int count = 0;

        for (Category category : categories) {
            List<Expense> monthlyExpenses =
                expenseRepository.findByUserIdAndCategoryIdAndDateBetween(
                    user.getId(),
                    category.getId(),
                    startOfMonth,
                    now
                );

            if (monthlyExpenses.isEmpty()) {
                continue;
            }

            BigDecimal totalSpent = monthlyExpenses
                .stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Alert if spending in a category exceeds 10,000 BDT this month
            if (totalSpent.doubleValue() > 10000) {
                Nudge nudge = Nudge.builder()
                    .user(user)
                    .type(Nudge.NudgeType.BUDGET_ALERT)
                    .title("High Spending Alert")
                    .message(
                        String.format(
                            "You've spent ৳%.2f on %s this month across %d transactions. Consider reviewing your expenses.",
                            totalSpent,
                            category.getName(),
                            monthlyExpenses.size()
                        )
                    )
                    .priority(
                        totalSpent.doubleValue() > 20000
                            ? Nudge.Priority.URGENT
                            : Nudge.Priority.HIGH
                    )
                    .actionUrl("/expenses")
                    .isActionable(true)
                    .build();
                nudgeRepository.save(nudge);
                count++;
            }
        }
        return count;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int generateUnusualSpendingAlerts(User user) {
        log.debug(
            "Generating unusual spending alerts for user: {}",
            user.getId()
        );
        LocalDate lastWeek = LocalDate.now().minusWeeks(1);
        LocalDate now = LocalDate.now();
        LocalDate previousWeek = lastWeek.minusWeeks(1);

        List<Expense> currentWeekExpenses =
            expenseRepository.findByUserIdAndDateBetween(
                user.getId(),
                lastWeek,
                now
            );
        List<Expense> previousWeekExpenses =
            expenseRepository.findByUserIdAndDateBetween(
                user.getId(),
                previousWeek,
                lastWeek
            );

        BigDecimal currentTotal = currentWeekExpenses
            .stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal previousTotal = previousWeekExpenses
            .stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (previousTotal.compareTo(BigDecimal.ZERO) > 0) {
            double increase =
                ((currentTotal.doubleValue() - previousTotal.doubleValue()) /
                    previousTotal.doubleValue()) *
                100;

            if (increase > 50) {
                Nudge nudge = Nudge.builder()
                    .user(user)
                    .type(Nudge.NudgeType.UNUSUAL_SPENDING)
                    .title("Unusual Spending Detected")
                    .message(
                        String.format(
                            "Your spending increased by %.0f%% this week (৳%.2f vs ৳%.2f last week). Review your recent expenses.",
                            increase,
                            currentTotal,
                            previousTotal
                        )
                    )
                    .priority(Nudge.Priority.HIGH)
                    .actionUrl("/dashboard")
                    .isActionable(true)
                    .build();
                nudgeRepository.save(nudge);
                return 1;
            }
        }
        return 0;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int generateBillReminders(User user) {
        log.debug("Generating bill reminders for user: {}", user.getId());
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusWeeks(1);

        List<RecurringExpense> upcomingBills =
            recurringExpenseRepository.findByUserAndActiveAndNextDueDateBetween(
                user,
                true,
                today,
                nextWeek
            );

        int count = 0;

        for (RecurringExpense bill : upcomingBills) {
            long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(
                today,
                bill.getNextDueDate()
            );

            Nudge.Priority priority = daysUntil <= 3
                ? Nudge.Priority.HIGH
                : Nudge.Priority.MEDIUM;

            Nudge nudge = Nudge.builder()
                .user(user)
                .type(Nudge.NudgeType.BILL_REMINDER)
                .title("Upcoming Bill")
                .message(
                    String.format(
                        "%s payment of ৳%.2f due in %d days (%s)",
                        bill.getDescription(),
                        bill.getAmount(),
                        daysUntil,
                        bill
                            .getNextDueDate()
                            .format(DateTimeFormatter.ofPattern("MMM dd"))
                    )
                )
                .priority(priority)
                .actionUrl("/recurring")
                .isActionable(true)
                .build();
            nudgeRepository.save(nudge);
            count++;
        }
        return count;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int generateSavingsOpportunities(User user) {
        log.debug(
            "Generating savings opportunities for user: {}",
            user.getId()
        );
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDate now = LocalDate.now();

        List<Category> categories = categoryRepository.findByUserId(
            user.getId()
        );

        int count = 0;

        for (Category category : categories) {
            List<Expense> categoryExpenses =
                expenseRepository.findByUserIdAndCategoryIdAndDateBetween(
                    user.getId(),
                    category.getId(),
                    lastMonth,
                    now
                );

            if (categoryExpenses.size() >= 5) {
                BigDecimal total = categoryExpenses
                    .stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Suggest savings if spending is high
                if (total.doubleValue() > 5000) {
                    Nudge nudge = Nudge.builder()
                        .user(user)
                        .type(Nudge.NudgeType.SAVINGS_OPPORTUNITY)
                        .title("Savings Opportunity")
                        .message(
                            String.format(
                                "You spent ৳%.2f on %s in the last month. Consider setting a budget to reduce expenses by 10-20%%.",
                                total,
                                category.getName()
                            )
                        )
                        .priority(Nudge.Priority.LOW)
                        .actionUrl("/categories")
                        .isActionable(true)
                        .build();
                    nudgeRepository.save(nudge);
                    count++;
                }
            }
        }
        return count;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int generateSpendingInsights(User user) {
        log.debug("Generating spending insights for user: {}", user.getId());
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDate now = LocalDate.now();

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(
            user.getId(),
            lastMonth,
            now
        );

        if (expenses.isEmpty()) {
            return 0;
        }

        BigDecimal total = expenses
            .stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by category
        Map<String, BigDecimal> categoryTotals = expenses
            .stream()
            .filter(e -> e.getCategory() != null)
            .collect(
                Collectors.groupingBy(
                    e -> e.getCategory().getName(),
                    Collectors.reducing(
                        BigDecimal.ZERO,
                        Expense::getAmount,
                        BigDecimal::add
                    )
                )
            );

        if (!categoryTotals.isEmpty()) {
            String topCategory = categoryTotals
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");

            BigDecimal topAmount = categoryTotals.get(topCategory);

            Nudge nudge = Nudge.builder()
                .user(user)
                .type(Nudge.NudgeType.SPENDING_INSIGHT)
                .title("Monthly Spending Summary")
                .message(
                    String.format(
                        "Last month: %d transactions totaling ৳%.2f. Top category: %s (৳%.2f, %.0f%% of total)",
                        expenses.size(),
                        total,
                        topCategory,
                        topAmount,
                        ((topAmount.doubleValue() / total.doubleValue()) * 100)
                    )
                )
                .priority(Nudge.Priority.LOW)
                .actionUrl("/dashboard")
                .isActionable(true)
                .build();
            nudgeRepository.save(nudge);
            return 1;
        }
        return 0;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int generateWelcomeNudge(User user) {
        log.debug("Generating welcome nudge for user: {}", user.getId());
        
        // Check if user has any expenses
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDate now = LocalDate.now();
        List<Expense> recentExpenses = expenseRepository.findByUserIdAndDateBetween(
            user.getId(),
            lastMonth,
            now
        );

        if (recentExpenses.isEmpty()) {
            // User has no expenses - suggest adding some
            Nudge nudge = Nudge.builder()
                .user(user)
                .type(Nudge.NudgeType.SPENDING_INSIGHT)
                .title("Welcome to Smart Nudges!")
                .message(
                    "Start tracking your expenses to receive personalized financial insights and alerts. Add your first expense to get started!"
                )
                .priority(Nudge.Priority.LOW)
                .actionUrl("/expenses")
                .isActionable(true)
                .build();
            nudgeRepository.save(nudge);
            return 1;
        } else {
            // User has expenses but didn't meet thresholds - provide encouragement
            BigDecimal total = recentExpenses
                .stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Nudge nudge = Nudge.builder()
                .user(user)
                .type(Nudge.NudgeType.SPENDING_INSIGHT)
                .title("Keep Tracking!")
                .message(
                    String.format(
                        "You've tracked %d expenses totaling ৳%.2f. Continue adding expenses to receive personalized budget alerts and savings tips!",
                        recentExpenses.size(),
                        total
                    )
                )
                .priority(Nudge.Priority.LOW)
                .actionUrl("/dashboard")
                .isActionable(true)
                .build();
            nudgeRepository.save(nudge);
            return 1;
        }
    }
}
