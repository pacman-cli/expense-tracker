package com.expensetracker.service;

import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public Map<String, Object> getMonthlyReport(Long userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        Map<String, Object> report = new HashMap<>();
        report.put("period", YearMonth.of(year, month).toString());
        report.put("totalExpenses", calculateTotal(expenses));
        report.put("transactionCount", expenses.size());
        report.put("categoryBreakdown", getCategoryBreakdown(expenses));
        report.put("dailyTotals", getDailyTotals(expenses, startDate, endDate));
        report.put("averagePerDay", calculateAveragePerDay(expenses, startDate, endDate));
        report.put("topExpenses", getTopExpenses(expenses, 5));
        report.put("weekdayVsWeekend", getWeekdayVsWeekend(expenses));

        return report;
    }

    public Map<String, Object> getYearlyReport(Long userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        Map<String, Object> report = new HashMap<>();
        report.put("year", year);
        report.put("totalExpenses", calculateTotal(expenses));
        report.put("transactionCount", expenses.size());
        report.put("monthlyTotals", getMonthlyTotals(expenses, year));
        report.put("categoryBreakdown", getCategoryBreakdown(expenses));
        report.put("averagePerMonth", calculateTotal(expenses).divide(BigDecimal.valueOf(12), 2, BigDecimal.ROUND_HALF_UP));

        return report;
    }

    public Map<String, Object> getComparison(Long userId, int year, int month) {
        LocalDate currentStart = LocalDate.of(year, month, 1);
        LocalDate currentEnd = currentStart.withDayOfMonth(currentStart.lengthOfMonth());
        LocalDate previousStart = currentStart.minusMonths(1);
        LocalDate previousEnd = previousStart.withDayOfMonth(previousStart.lengthOfMonth());

        List<Expense> currentExpenses = expenseRepository.findByUserIdAndDateBetween(userId, currentStart, currentEnd);
        List<Expense> previousExpenses = expenseRepository.findByUserIdAndDateBetween(userId, previousStart, previousEnd);

        BigDecimal currentTotal = calculateTotal(currentExpenses);
        BigDecimal previousTotal = calculateTotal(previousExpenses);
        BigDecimal change = currentTotal.subtract(previousTotal);
        Double percentageChange = previousTotal.compareTo(BigDecimal.ZERO) > 0 ?
                change.divide(previousTotal, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0;

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("current", Map.of(
                "period", YearMonth.of(year, month).toString(),
                "total", currentTotal,
                "count", currentExpenses.size()
        ));
        comparison.put("previous", Map.of(
                "period", YearMonth.of(previousStart.getYear(), previousStart.getMonthValue()).toString(),
                "total", previousTotal,
                "count", previousExpenses.size()
        ));
        comparison.put("change", change);
        comparison.put("percentageChange", percentageChange);

        return comparison;
    }

    public List<Map<String, Object>> getCategoryTrends(Long userId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        Map<String, Map<YearMonth, BigDecimal>> categoryMonthly = new HashMap<>();

        for (Expense expense : expenses) {
            String category = expense.getCategory() != null ? expense.getCategory().getName() : "Uncategorized";
            YearMonth month = YearMonth.from(expense.getDate());

            categoryMonthly.computeIfAbsent(category, k -> new HashMap<>())
                    .merge(month, expense.getAmount(), BigDecimal::add);
        }

        return categoryMonthly.entrySet().stream()
                .map(entry -> Map.of(
                        "category", (Object) entry.getKey(),
                        "monthlyData", (Object) entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    // Helper methods

    private BigDecimal calculateTotal(List<Expense> expenses) {
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, BigDecimal> getCategoryBreakdown(List<Expense> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory().getName() : "Uncategorized",
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    private Map<LocalDate, BigDecimal> getDailyTotals(List<Expense> expenses, LocalDate start, LocalDate end) {
        Map<LocalDate, BigDecimal> dailyTotals = new TreeMap<>();

        // Initialize all dates with zero
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            dailyTotals.put(date, BigDecimal.ZERO);
        }

        // Fill in actual values
        expenses.forEach(e -> dailyTotals.merge(e.getDate(), e.getAmount(), BigDecimal::add));

        return dailyTotals;
    }

    private Map<String, BigDecimal> getMonthlyTotals(List<Expense> expenses, int year) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDate()).toString(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    private BigDecimal calculateAveragePerDay(List<Expense> expenses, LocalDate start, LocalDate end) {
        long days = end.toEpochDay() - start.toEpochDay() + 1;
        BigDecimal total = calculateTotal(expenses);
        return days > 0 ? total.divide(BigDecimal.valueOf(days), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
    }

    private List<Map<String, Object>> getTopExpenses(List<Expense> expenses, int limit) {
        return expenses.stream()
                .sorted(Comparator.comparing(Expense::getAmount).reversed())
                .limit(limit)
                .map(e -> Map.of(
                        "description", (Object) e.getDescription(),
                        "amount", (Object) e.getAmount(),
                        "date", (Object) e.getDate(),
                        "category", (Object) (e.getCategory() != null ? e.getCategory().getName() : "Uncategorized")
                ))
                .collect(Collectors.toList());
    }

    private Map<String, Object> getWeekdayVsWeekend(List<Expense> expenses) {
        BigDecimal weekdayTotal = BigDecimal.ZERO;
        BigDecimal weekendTotal = BigDecimal.ZERO;
        int weekdayCount = 0;
        int weekendCount = 0;

        for (Expense expense : expenses) {
            DayOfWeek day = expense.getDate().getDayOfWeek();
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
                weekendTotal = weekendTotal.add(expense.getAmount());
                weekendCount++;
            } else {
                weekdayTotal = weekdayTotal.add(expense.getAmount());
                weekdayCount++;
            }
        }

        return Map.of(
                "weekday", Map.of("total", weekdayTotal, "count", weekdayCount),
                "weekend", Map.of("total", weekendTotal, "count", weekendCount)
        );
    }
}
