package com.expensetracker.repository;

import com.expensetracker.entity.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
    List<RecurringExpense> findByUserId(Long userId);
    
    List<RecurringExpense> findByUserIdAndActive(Long userId, Boolean active);
    
    List<RecurringExpense> findByActiveAndNextDueDateLessThanEqual(Boolean active, LocalDate date);
}
