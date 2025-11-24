package com.expensetracker.features.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseTemplateRepository extends JpaRepository<ExpenseTemplate, Long> {
    List<ExpenseTemplate> findByUserId(Long userId);

    List<ExpenseTemplate> findByUserIdAndFavorite(Long userId, Boolean favorite);

    List<ExpenseTemplate> findByUserIdOrderByUsageCountDesc(Long userId);
}
