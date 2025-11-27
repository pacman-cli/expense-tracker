package com.expensetracker.controller;

import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.service.AnalyticsService;
import com.expensetracker.service.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(analyticsService.getMonthlyReport(userDetails.getId(), year, month));
    }

    @GetMapping("/yearly")
    public ResponseEntity<Map<String, Object>> getYearlyReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam int year) {
        return ResponseEntity.ok(analyticsService.getYearlyReport(userDetails.getId(), year));
    }

    @GetMapping("/comparison")
    public ResponseEntity<Map<String, Object>> getComparison(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(analyticsService.getComparison(userDetails.getId(), year, month));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getCategoryTrends(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getCategoryTrends(userDetails.getId(), months));
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<Map<String, Object>>> getSpendingByCategory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getSpendingByCategory(userDetails.getId(), days));
    }

    @GetMapping("/export/csv")
    public void exportToCSV(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpServletResponse response) throws IOException {

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusMonths(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userDetails.getId(), start, end);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=expenses_" + start + "_to_" + end + ".csv");

        PrintWriter writer = response.getWriter();
        writer.println("Date,Description,Amount,Category");

        for (Expense expense : expenses) {
            writer.println(String.format("%s,\"%s\",%.2f,%s",
                    expense.getDate(),
                    expense.getDescription().replace("\"", "\"\""),
                    expense.getAmount(),
                    expense.getCategory() != null ? expense.getCategory().getName() : "Uncategorized"));
        }

        writer.flush();
    }
}
