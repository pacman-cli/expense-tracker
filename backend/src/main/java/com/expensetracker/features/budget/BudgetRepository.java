package com.expensetracker.features.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);

    List<Budget> findByUserIdAndYearAndMonth(Long userId, Integer year, Integer month);

    Optional<Budget> findByUserIdAndCategoryIdAndYearAndMonth(
            Long userId, Long categoryId, Integer year, Integer month);
}
