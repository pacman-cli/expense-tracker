package com.expensetracker.features.expense;

import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserDetailsImpl;
import com.expensetracker.features.expense.ExpenseTemplate;
import com.expensetracker.features.expense.ExpenseTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/templates")
public class ExpenseTemplateController {

    @Autowired
    private ExpenseTemplateRepository templateRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<ExpenseTemplate>> getAll(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(templateRepository.findByUserId(userDetails.getId()));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<ExpenseTemplate>> getFavorites(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(templateRepository.findByUserIdAndFavorite(userDetails.getId(), true));
    }

    @GetMapping("/frequent")
    public ResponseEntity<List<ExpenseTemplate>> getFrequent(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<ExpenseTemplate> templates = templateRepository.findByUserIdOrderByUsageCountDesc(userDetails.getId());
        return ResponseEntity.ok(templates.stream().limit(5).toList());
    }

    @PostMapping
    public ResponseEntity<ExpenseTemplate> create(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> request) {

        ExpenseTemplate template = ExpenseTemplate.builder()
                .user(userRepository.findById(userDetails.getId()).orElseThrow())
                .category(request.get("categoryId") != null
                        ? categoryRepository.findById(((Number) request.get("categoryId")).longValue()).orElse(null)
                        : null)
                .name(request.get("name").toString())
                .description(request.get("description").toString())
                .amount(new java.math.BigDecimal(request.get("amount").toString()))
                .favorite(request.containsKey("favorite") ? (Boolean) request.get("favorite") : false)
                .usageCount(0)
                .build();

        return ResponseEntity.ok(templateRepository.save(template));
    }

    @PostMapping("/{id}/use")
    public ResponseEntity<Expense> useTemplate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ExpenseTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Create expense from template
        Expense expense = Expense.builder()
                .user(template.getUser())
                .category(template.getCategory())
                .description(template.getDescription())
                .amount(template.getAmount())
                .date(LocalDate.now())
                .build();

        expense = expenseRepository.save(expense);

        // Increment usage count
        template.incrementUsage();
        templateRepository.save(template);

        return ResponseEntity.ok(expense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ExpenseTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        templateRepository.delete(template);
        return ResponseEntity.ok().build();
    }
}
