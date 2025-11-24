package com.expensetracker.features.budget;

import com.expensetracker.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Budget> budgets = budgetService.getBudgetsForUser(userDetails.getId());
        return ResponseEntity.ok(budgets.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/current")
    public ResponseEntity<List<BudgetDTO>> getCurrentMonthBudgets(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Budget> budgets = budgetService.getCurrentMonthBudgets(userDetails.getId());
        return ResponseEntity.ok(budgets.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> createOrUpdateBudget(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> request) {

        Long categoryId = ((Number) request.get("categoryId")).longValue();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        Integer year = request.containsKey("year") ?
                ((Number) request.get("year")).intValue() : LocalDate.now().getYear();
        Integer month = request.containsKey("month") ?
                ((Number) request.get("month")).intValue() : LocalDate.now().getMonthValue();

        Budget budget = budgetService.createOrUpdateBudget(
                userDetails.getId(), categoryId, amount, year, month);

        return ResponseEntity.ok(convertToDTO(budget));
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetDTO> updateBudget(
            @PathVariable Long budgetId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> request) {

        Long categoryId = ((Number) request.get("categoryId")).longValue();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        Integer year = ((Number) request.get("year")).intValue();
        Integer month = ((Number) request.get("month")).intValue();

        Budget budget = budgetService.createOrUpdateBudget(
                userDetails.getId(), categoryId, amount, year, month);

        return ResponseEntity.ok(convertToDTO(budget));
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable Long budgetId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        budgetService.deleteBudget(budgetId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshBudgets(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        LocalDate now = LocalDate.now();
        budgetService.updateBudgetSpent(userDetails.getId(), now.getYear(), now.getMonthValue());
        return ResponseEntity.ok().build();
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
