package com.expensetracker.features.budget;

import com.expensetracker.service.UserDetailsImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<Budget> budgets = budgetService.getBudgetsForUser(
            userDetails.getId()
        );
        return ResponseEntity.ok(
            budgets
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/current")
    public ResponseEntity<List<BudgetDTO>> getCurrentMonthBudgets(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<Budget> budgets = budgetService.getCurrentMonthBudgets(
            userDetails.getId()
        );
        return ResponseEntity.ok(
            budgets
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> createOrUpdateBudget(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestBody Map<String, Object> request
    ) {
        Long categoryId = ((Number) request.get("categoryId")).longValue();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        Integer year = request.containsKey("year")
            ? ((Number) request.get("year")).intValue()
            : LocalDate.now().getYear();
        Integer month = request.containsKey("month")
            ? ((Number) request.get("month")).intValue()
            : LocalDate.now().getMonthValue();

        Budget budget = budgetService.createOrUpdateBudget(
            userDetails.getId(),
            categoryId,
            amount,
            year,
            month
        );

        return ResponseEntity.ok(convertToDTO(budget));
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetDTO> updateBudget(
        @PathVariable Long budgetId,
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestBody Map<String, Object> request
    ) {
        Long categoryId = ((Number) request.get("categoryId")).longValue();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        Integer year = ((Number) request.get("year")).intValue();
        Integer month = ((Number) request.get("month")).intValue();

        Budget budget = budgetService.createOrUpdateBudget(
            userDetails.getId(),
            categoryId,
            amount,
            year,
            month
        );

        return ResponseEntity.ok(convertToDTO(budget));
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<?> deleteBudget(
        @PathVariable Long budgetId,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        budgetService.deleteBudget(budgetId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshBudgets(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        LocalDate now = LocalDate.now();
        budgetService.updateBudgetSpent(
            userDetails.getId(),
            now.getYear(),
            now.getMonthValue()
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<BudgetDTO>> getBudgetHistory(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(defaultValue = "6") int months
    ) {
        List<Budget> history = budgetService.getBudgetHistory(
            userDetails.getId(),
            categoryId,
            months
        );
        return ResponseEntity.ok(
            history
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getBudgetAnalytics(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Map<String, Object> analytics = budgetService.getBudgetAnalytics(
            userDetails.getId()
        );
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/comparison")
    public ResponseEntity<Map<String, Object>> getBudgetComparison(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) Integer month
    ) {
        LocalDate now = LocalDate.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();

        Map<String, Object> comparison = budgetService.getBudgetComparison(
            userDetails.getId(),
            targetYear,
            targetMonth
        );
        return ResponseEntity.ok(comparison);
    }

    @PostMapping("/rollover")
    public ResponseEntity<Map<String, Object>> rolloverBudgets(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestBody Map<String, Object> request
    ) {
        Integer fromYear = ((Number) request.get("fromYear")).intValue();
        Integer fromMonth = ((Number) request.get("fromMonth")).intValue();
        Integer toYear = ((Number) request.get("toYear")).intValue();
        Integer toMonth = ((Number) request.get("toMonth")).intValue();

        int count = budgetService.rolloverBudgets(
            userDetails.getId(),
            fromYear,
            fromMonth,
            toYear,
            toMonth
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("budgetsRolledOver", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{budgetId}/adjust")
    public ResponseEntity<BudgetDTO> adjustBudget(
        @PathVariable Long budgetId,
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestBody Map<String, Object> request
    ) {
        BigDecimal adjustmentAmount = new BigDecimal(
            request.get("amount").toString()
        );
        String type = request.get("type").toString(); // "increase" or "decrease"

        Budget budget = budgetService.adjustBudget(
            budgetId,
            userDetails.getId(),
            adjustmentAmount,
            type
        );

        return ResponseEntity.ok(convertToDTO(budget));
    }

    @PostMapping("/{budgetId}/duplicate")
    public ResponseEntity<BudgetDTO> duplicateBudget(
        @PathVariable Long budgetId,
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @RequestBody Map<String, Object> request
    ) {
        Integer targetYear = ((Number) request.get("year")).intValue();
        Integer targetMonth = ((Number) request.get("month")).intValue();

        Budget budget = budgetService.duplicateBudget(
            budgetId,
            userDetails.getId(),
            targetYear,
            targetMonth
        );

        return ResponseEntity.ok(convertToDTO(budget));
    }

    @GetMapping("/{budgetId}/details")
    public ResponseEntity<Map<String, Object>> getBudgetDetails(
        @PathVariable Long budgetId,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Map<String, Object> details = budgetService.getBudgetDetails(
            budgetId,
            userDetails.getId()
        );
        return ResponseEntity.ok(details);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getBudgetAlerts(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<Map<String, Object>> alerts = budgetService.getBudgetAlerts(
            userDetails.getId()
        );
        return ResponseEntity.ok(alerts);
    }

    private BudgetDTO convertToDTO(Budget budget) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setCategoryName(budget.getCategory().getName());
        dto.setCategoryColor(budget.getCategory().getColor());
        dto.setAmount(budget.getAmount());
        dto.setSpent(budget.getSpent());
        dto.setRemaining(budget.getRemaining());
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        dto.setPercentageUsed(budget.getPercentageUsed());
        dto.setIsOverBudget(budget.isOverBudget());
        return dto;
    }
}
