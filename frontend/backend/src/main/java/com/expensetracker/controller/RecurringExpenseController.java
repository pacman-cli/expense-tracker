package com.expensetracker.controller;

import com.expensetracker.dto.RecurringExpenseDTO;
import com.expensetracker.entity.RecurringExpense;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.repository.RecurringExpenseRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.RecurringExpenseScheduler;
import com.expensetracker.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/recurring-expenses")
public class RecurringExpenseController {

    @Autowired
    private RecurringExpenseRepository recurringExpenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RecurringExpenseScheduler scheduler;

    @GetMapping
    public ResponseEntity<List<RecurringExpenseDTO>> getAll(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<RecurringExpense> expenses = recurringExpenseRepository.findByUserId(userDetails.getId());
        return ResponseEntity.ok(expenses.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<RecurringExpenseDTO>> getActive(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<RecurringExpense> expenses = recurringExpenseRepository.findByUserIdAndActive(userDetails.getId(), true);
        return ResponseEntity.ok(expenses.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<RecurringExpenseDTO> create(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody RecurringExpenseDTO dto) {

        RecurringExpense expense = RecurringExpense.builder()
                .user(userRepository.findById(userDetails.getId()).orElseThrow())
                .category(dto.getCategoryId() != null ?
                        categoryRepository.findById(dto.getCategoryId()).orElse(null) : null)
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .frequency(RecurringExpense.Frequency.valueOf(dto.getFrequency()))
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .nextDueDate(dto.getStartDate())
                .active(true)
                .build();

        expense = recurringExpenseRepository.save(expense);
        return ResponseEntity.ok(convertToDTO(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringExpenseDTO> update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody RecurringExpenseDTO dto) {

        RecurringExpense expense = recurringExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring expense not found"));

        if (!expense.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (dto.getCategoryId() != null) {
            expense.setCategory(categoryRepository.findById(dto.getCategoryId()).orElse(null));
        }
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setFrequency(RecurringExpense.Frequency.valueOf(dto.getFrequency()));
        expense.setEndDate(dto.getEndDate());
        expense.setActive(dto.getActive());

        expense = recurringExpenseRepository.save(expense);
        return ResponseEntity.ok(convertToDTO(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        RecurringExpense expense = recurringExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring expense not found"));

        if (!expense.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        recurringExpenseRepository.delete(expense);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/generate-now")
    public ResponseEntity<Map<String, Integer>> generateNow() {
        int count = scheduler.generateNow();
        return ResponseEntity.ok(Map.of("generated", count));
    }

    private RecurringExpenseDTO convertToDTO(RecurringExpense expense) {
        RecurringExpenseDTO dto = new RecurringExpenseDTO();
        dto.setId(expense.getId());
        dto.setCategoryId(expense.getCategory() != null ? expense.getCategory().getId() : null);
        dto.setCategoryName(expense.getCategory() != null ? expense.getCategory().getName() : null);
        dto.setCategoryColor(expense.getCategory() != null ? expense.getCategory().getColor() : null);
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setFrequency(expense.getFrequency().name());
        dto.setStartDate(expense.getStartDate());
        dto.setEndDate(expense.getEndDate());
        dto.setNextDueDate(expense.getNextDueDate());
        dto.setActive(expense.getActive());
        return dto;
    }
}
