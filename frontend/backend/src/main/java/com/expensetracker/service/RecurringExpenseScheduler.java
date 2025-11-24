package com.expensetracker.service;

import com.expensetracker.features.expense.Expense;
import com.expensetracker.entity.RecurringExpense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.RecurringExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringExpenseScheduler {

    @Autowired
    private RecurringExpenseRepository recurringExpenseRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    /**
     * Runs daily at 1 AM to generate recurring expenses
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void generateRecurringExpenses() {
        System.out.println("Running recurring expense scheduler...");

        LocalDate today = LocalDate.now();
        List<RecurringExpense> dueExpenses = recurringExpenseRepository
                .findByActiveAndNextDueDateLessThanEqual(true, today);

        for (RecurringExpense recurring : dueExpenses) {
            try {
                // Check if expired
                if (recurring.isExpired()) {
                    recurring.setActive(false);
                    recurringExpenseRepository.save(recurring);
                    continue;
                }

                // Create actual expense
                Expense expense = Expense.builder()
                        .user(recurring.getUser())
                        .category(recurring.getCategory())
                        .description(recurring.getDescription())
                        .amount(recurring.getAmount())
                        .date(recurring.getNextDueDate())
                        .build();

                expenseRepository.save(expense);

                // Update next due date
                recurring.updateNextDueDate();
                recurringExpenseRepository.save(recurring);

                System.out.println("Generated recurring expense: " + recurring.getDescription());
            } catch (Exception e) {
                System.err.println("Error generating recurring expense: " + e.getMessage());
            }
        }
    }

    /**
     * Manual trigger for testing
     */
    @Transactional
    public int generateNow() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> dueExpenses = recurringExpenseRepository
                .findByActiveAndNextDueDateLessThanEqual(true, today);

        int count = 0;
        for (RecurringExpense recurring : dueExpenses) {
            if (!recurring.isExpired()) {
                Expense expense = Expense.builder()
                        .user(recurring.getUser())
                        .category(recurring.getCategory())
                        .description(recurring.getDescription())
                        .amount(recurring.getAmount())
                        .date(recurring.getNextDueDate())
                        .build();

                expenseRepository.save(expense);
                recurring.updateNextDueDate();
                recurringExpenseRepository.save(recurring);
                count++;
            }
        }
        return count;
    }
}
