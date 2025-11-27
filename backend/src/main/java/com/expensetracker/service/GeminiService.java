package com.expensetracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.objectMapper = objectMapper;
    }

    /**
     * Suggest category for an expense based on description
     */
    public String suggestCategory(String description, List<String> availableCategories) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Uncategorized";
        }

        String prompt = String.format(
                "Based on this expense description: '%s'\n" +
                        "Suggest the most appropriate category from: %s\n" +
                        "Reply with ONLY the category name, nothing else.",
                description, String.join(", ", availableCategories));

        try {
            // call the api
            String response = callGeminiAPI(prompt);
            return response.trim();
        } catch (Exception e) {
            System.err.println("Error calling Gemini API for categorization: " + e.getMessage());
            return "Uncategorized";
        }
    }

    /**
     * Get AI insights about spending patterns
     */
    public Map<String, Object> getSpendingInsights(Map<String, Double> categoryTotals, double totalSpending) {
        if (apiKey == null || apiKey.isEmpty()) {
            return getDefaultInsights();
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("Analyze these monthly expenses and provide brief insights:\n");
        prompt.append(String.format("Total Spending: $%.2f\n", totalSpending));
        prompt.append("Category Breakdown:\n");

        categoryTotals.forEach((category, amount) -> prompt.append(String.format("- %s: $%.2f (%.1f%%)\n",
                category, amount, (amount / totalSpending) * 100)));

        prompt.append("\nProvide 3 bullet points:\n");
        prompt.append("1. Main spending insight\n");
        prompt.append("2. Potential savings opportunity\n");
        prompt.append("3. Budget recommendation\n");
        prompt.append("Keep each point under 15 words.");

        try {
            String response = callGeminiAPI(prompt.toString());
            Map<String, Object> insights = new HashMap<>();
            insights.put("analysis", response);
            insights.put("totalSpending", totalSpending);
            insights.put("topCategory", getTopCategory(categoryTotals));
            return insights;
        } catch (Exception e) {
            System.err.println("Error getting AI insights: " + e.getMessage());
            return getDefaultInsights();
        }
    }

    /**
     * Detect anomalies in expenses
     */
    public boolean isAnomalous(double amount, String category, double avgForCategory) {
        if (avgForCategory == 0)
            return false;
        double deviation = Math.abs(amount - avgForCategory) / avgForCategory;
        return deviation > 1.5; // 150% above average
    }

    /**
     * Get budget recommendations using AI
     */
    public Map<String, Double> suggestBudgets(Map<String, Double> pastSpending) {
        Map<String, Double> suggestions = new HashMap<>();

        // Simple rule-based approach with 10% buffer
        pastSpending.forEach((category, avgSpending) -> {
            double recommendedBudget = avgSpending * 1.1;
            suggestions.put(category, Math.round(recommendedBudget * 100.0) / 100.0);
        });

        return suggestions;
    }

    // Private helper methods

    private String callGeminiAPI(String prompt) {
        String endpoint = "/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> request = new HashMap<>();
        Map<String, Object> contentObj = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        contentObj.put("parts", List.of(part));
        request.put("contents", List.of(contentObj));

        try {
            String response = webClient.post()
                    .uri(endpoint)
                    .header("Content-Type", "application/json")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse response
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode parts = contentNode.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            return "";
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API", e);
        }
    }

    private Map<String, Object> getDefaultInsights() {
        Map<String, Object> insights = new HashMap<>();
        insights.put("analysis", "Configure Gemini API key to get AI-powered insights.");
        insights.put("totalSpending", 0.0);
        insights.put("topCategory", "N/A");
        return insights;
    }

    private String getTopCategory(Map<String, Double> categoryTotals) {
        return categoryTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }
}
