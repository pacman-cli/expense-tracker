package com.expensetracker.features.income;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserId(Long userId);

    List<Income> findByUserIdAndDateBetween(Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate);
}
