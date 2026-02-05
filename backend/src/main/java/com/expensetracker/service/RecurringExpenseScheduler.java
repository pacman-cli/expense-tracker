package com.expensetracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.entity.RecurringExpense;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.RecurringExpenseRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
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
        log.info("Running recurring expense scheduler...");

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

                log.info("Generated recurring expense: {}", recurring.getDescription());
            } catch (Exception e) {
                log.error("Error generating recurring expense: {}", e.getMessage(), e);
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
        log.info("Generated {} recurring expense transactions", count);
        return count;
    }
}
