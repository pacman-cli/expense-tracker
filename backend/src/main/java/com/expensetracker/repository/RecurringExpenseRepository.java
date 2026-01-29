package com.expensetracker.repository;

import com.expensetracker.entity.RecurringExpense;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
    List<RecurringExpense> findByUserId(Long userId);

    List<RecurringExpense> findByUserIdAndActive(Long userId, Boolean active);

    List<RecurringExpense> findByActiveAndNextDueDateLessThanEqual(Boolean active, LocalDate date);

    // New methods for nudge service
    List<RecurringExpense> findByUser(User user);

    List<RecurringExpense> findByUserAndNextDueDateBefore(User user, LocalDate date);

    List<RecurringExpense> findByUserAndActiveAndNextDueDateBetween(User user, Boolean active, LocalDate start,
            LocalDate end);
}
