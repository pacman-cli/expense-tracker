package com.expensetracker.features.prediction;

import com.expensetracker.entity.User;
import com.expensetracker.features.category.Category;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    public List<Prediction> getPredictions(User user) {
        return predictionRepository.findByUserOrderByPredictionDateDesc(user);
    }

    @Transactional
    public void generatePredictions(User user) {
        // Clear existing predictions
        predictionRepository.deleteAll(predictionRepository.findByUser(user));

        List<Category> categories = categoryRepository.findByUserId(user.getId());

        // Get expense history for the last 3 months
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<Expense> recentExpenses = expenseRepository.findByUserAndDateAfter(user, threeMonthsAgo);

        if (recentExpenses.isEmpty()) {
            // If no expense history, generate minimal predictions
            generateDefaultPredictions(user, categories);
            return;
        }

        // Group expenses by category
        Map<String, List<Expense>> expensesByCategory = recentExpenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(e -> e.getCategory().getName()));

        double totalHistoricalSpend = 0;

        // Generate predictions for each category with expense history
        for (Map.Entry<String, List<Expense>> entry : expensesByCategory.entrySet()) {
            String categoryName = entry.getKey();
            List<Expense> categoryExpenses = entry.getValue();

            // Calculate average monthly spending
            double totalSpent = categoryExpenses.stream()
                    .mapToDouble(e -> e.getAmount().doubleValue())
                    .sum();
            totalHistoricalSpend += totalSpent;

            double monthlyAverage = totalSpent / 3.0; // 3 months

            // Calculate trend (comparing first half vs second half)
            List<Expense> firstHalf = new ArrayList<>();
            List<Expense> secondHalf = new ArrayList<>();
            LocalDate midpoint = threeMonthsAgo.plusMonths(1).plusDays(15);

            for (Expense exp : categoryExpenses) {
                if (exp.getDate().isBefore(midpoint)) {
                    firstHalf.add(exp);
                } else {
                    secondHalf.add(exp);
                }
            }

            double firstHalfAvg = firstHalf.isEmpty() ? 0
                    : firstHalf.stream().mapToDouble(e -> e.getAmount().doubleValue()).average().orElse(0);
            double secondHalfAvg = secondHalf.isEmpty() ? 0
                    : secondHalf.stream().mapToDouble(e -> e.getAmount().doubleValue()).average().orElse(0);

            // Adjust prediction based on trend
            double trendFactor = 1.0;
            String trendInsight = "";
            if (secondHalfAvg > firstHalfAvg * 1.2) {
                trendFactor = 1.15; // Increasing trend
                trendInsight = " Your spending in this category is trending upward.";
            } else if (secondHalfAvg < firstHalfAvg * 0.8) {
                trendFactor = 0.85; // Decreasing trend
                trendInsight = " Great job! Your spending is trending downward.";
            }

            double predictedAmount = monthlyAverage * trendFactor;

            // Calculate confidence based on consistency
            double stdDev = calculateStdDev(categoryExpenses);
            double confidence = Math.max(60, Math.min(95, 90 - (stdDev / monthlyAverage * 100)));

            String insights = String.format(
                    "Based on %d transactions averaging ৳%.2f/month over the last 3 months.%s",
                    categoryExpenses.size(),
                    monthlyAverage,
                    trendInsight);

            Prediction prediction = Prediction.builder()
                    .user(user)
                    .categoryName(categoryName)
                    .predictionDate(LocalDate.now().plusMonths(1))
                    .predictedAmount(predictedAmount)
                    .actualAmount(null)
                    .confidence(confidence)
                    .predictionType("CATEGORY_EXPENSE")
                    .predictionPeriod("MONTHLY")
                    .algorithmUsed("Historical Average with Trend Analysis")
                    .insights(insights)
                    .isAccurate(null)
                    .accuracyPercentage(null)
                    .variance(null)
                    .build();

            predictionRepository.save(prediction);
        }

        // Add total expense prediction
        double predictedTotal = totalHistoricalSpend / 3.0; // Monthly average
        Prediction totalPrediction = Prediction.builder()
                .user(user)
                .categoryName("Total Expenses")
                .predictionDate(LocalDate.now().plusMonths(1).withDayOfMonth(1))
                .predictedAmount(predictedTotal)
                .actualAmount(null)
                .confidence(85.0)
                .predictionType("TOTAL_EXPENSE")
                .predictionPeriod("MONTHLY")
                .algorithmUsed("Aggregate Historical Analysis")
                .insights(String.format("Based on %d total transactions in the last 3 months", recentExpenses.size()))
                .isAccurate(null)
                .accuracyPercentage(null)
                .variance(null)
                .build();
        predictionRepository.save(totalPrediction);
    }

    private void generateDefaultPredictions(User user, List<Category> categories) {
        // Generate minimal predictions when no history exists
        Prediction totalPrediction = Prediction.builder()
                .user(user)
                .categoryName("Total Expenses")
                .predictionDate(LocalDate.now().plusMonths(1).withDayOfMonth(1))
                .predictedAmount(5000.0)
                .actualAmount(null)
                .confidence(50.0)
                .predictionType("TOTAL_EXPENSE")
                .predictionPeriod("MONTHLY")
                .algorithmUsed("Default Estimation")
                .insights("No historical data available. Start tracking expenses for better predictions!")
                .isAccurate(null)
                .accuracyPercentage(null)
                .variance(null)
                .build();
        predictionRepository.save(totalPrediction);
    }

    private double calculateStdDev(List<Expense> expenses) {
        if (expenses.size() < 2)
            return 0;

        double mean = expenses.stream()
                .mapToDouble(e -> e.getAmount().doubleValue())
                .average()
                .orElse(0);

        double variance = expenses.stream()
                .mapToDouble(e -> Math.pow(e.getAmount().doubleValue() - mean, 2))
                .average()
                .orElse(0);

        return Math.sqrt(variance);
    }

    @Transactional
    public void deletePredictions(User user) {
        List<Prediction> userPredictions = predictionRepository.findByUser(user);
        predictionRepository.deleteAll(userPredictions);
    }

    public Map<String, Object> getAccuracyStats(User user) {
        List<Prediction> predictions = predictionRepository.findByUser(user);

        long totalPredictions = predictions.size();
        long accuratePredictions = predictions.stream()
                .filter(p -> p.getIsAccurate() != null && p.getIsAccurate())
                .count();

        double accuracyRate = totalPredictions > 0 ? (double) accuratePredictions / totalPredictions * 100 : 0;

        double averageAccuracy = predictions.stream()
                .filter(p -> p.getAccuracyPercentage() != null)
                .mapToDouble(Prediction::getAccuracyPercentage)
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPredictions", totalPredictions);
        stats.put("accuratePredictions", accuratePredictions);
        stats.put("accuracyRate", accuracyRate);
        stats.put("averageAccuracy", averageAccuracy);

        return stats;
    }
}
