package com.expensetracker.features.income;

import com.expensetracker.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
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
