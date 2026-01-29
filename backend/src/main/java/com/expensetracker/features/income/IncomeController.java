package com.expensetracker.features.income;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expensetracker.service.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeDTO>> getUserIncomes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(incomeService.getUserIncomes(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<IncomeDTO> createIncome(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody IncomeDTO incomeDTO) {
        return ResponseEntity.ok(incomeService.createIncome(userDetails.getId(), incomeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        incomeService.deleteIncome(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }
}
