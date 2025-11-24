package com.expensetracker.controller;

import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.service.UserDetailsImpl;
import com.expensetracker.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Get AI-powered spending insights
     */
    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();

        // Get expenses for current month
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);

        // Calculate category totals
        Map<String, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory().getName() : "Uncategorized",
                        Collectors.summingDouble(e -> e.getAmount().doubleValue())
                ));

        double totalSpending = expenses.stream()
                .mapToDouble(e -> e.getAmount().doubleValue())
                .sum();

        Map<String, Object> insights = geminiService.getSpendingInsights(categoryTotals, totalSpending);
        insights.put("period", startOfMonth + " to " + endOfMonth);
        insights.put("transactionCount", expenses.size());

        return ResponseEntity.ok(insights);
    }

    /**
     * Get category suggestion for a description
     */
    @PostMapping("/categorize")
    public ResponseEntity<?> suggestCategory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {

        Long userId = userDetails.getId();
        String description = request.get("description");

        // Get available categories
        List<String> categories = categoryRepository.findByUserId(userId).stream()
                .map(c -> c.getName())
                .collect(Collectors.toList());

        if (categories.isEmpty()) {
            categories = List.of("Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Other");
        }

        String suggestedCategory = geminiService.suggestCategory(description, categories);

        Map<String, String> response = new HashMap<>();
        response.put("suggestedCategory", suggestedCategory);

        return ResponseEntity.ok(response);
    }

    /**
     * Detect anomalous expenses
     */
    @GetMapping("/anomalies")
    public ResponseEntity<?> detectAnomalies(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();

        // Get last 3 months of expenses
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, threeMonthsAgo, LocalDate.now());

        // Calculate average per category
        Map<String, Double> categoryAverages = expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.averagingDouble(e -> e.getAmount().doubleValue())
                ));

        // Find anomalies in current month
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        List<Map<String, Object>> anomalies = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, LocalDate.now())
                .stream()
                .filter(e -> e.getCategory() != null)
                .filter(e -> {
                    String categoryName = e.getCategory().getName();
                    double avg = categoryAverages.getOrDefault(categoryName, 0.0);
                    return geminiService.isAnomalous(e.getAmount().doubleValue(), categoryName, avg);
                })
                .map(e -> {
                    Map<String, Object> anomaly = new HashMap<>();
                    anomaly.put("id", e.getId());
                    anomaly.put("description", e.getDescription());
                    anomaly.put("amount", e.getAmount());
                    anomaly.put("date", e.getDate());
                    anomaly.put("category", e.getCategory().getName());
                    return anomaly;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("anomalies", anomalies);
        response.put("count", anomalies.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get budget recommendations
     */
    @GetMapping("/budget-advice")
    public ResponseEntity<?> getBudgetAdvice(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();

        // Calculate average spending per category over last 3 months
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, threeMonthsAgo, LocalDate.now());

        Map<String, Double> avgSpending = expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.averagingDouble(e -> e.getAmount().doubleValue())
                ));

        Map<String, Double> recommendations = geminiService.suggestBudgets(avgSpending);

        Map<String, Object> response = new HashMap<>();
        response.put("recommendations", recommendations);
        response.put("basedOnMonths", 3);

        return ResponseEntity.ok(response);
    }
}
