package com.expensetracker.features.expense;

import com.expensetracker.entity.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
        Page<Expense> findByUserId(Long userId, Pageable pageable);

        List<Expense> findByUserIdAndDateBetween(
                        Long userId,
                        LocalDate startDate,
                        LocalDate endDate);

        List<Expense> findByUserIdAndCategoryIdAndDateBetween(
                        Long userId,
                        Long categoryId,
                        LocalDate startDate,
                        LocalDate endDate);

        List<Expense> findByUserAndDateAfter(User user, LocalDate date);

        List<Expense> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
}
