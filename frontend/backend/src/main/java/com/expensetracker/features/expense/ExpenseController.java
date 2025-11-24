package com.expensetracker.features.expense;

import com.expensetracker.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    public Page<ExpenseDTO> getAllExpenses(Authentication authentication, Pageable pageable) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return expenseService.getAllExpenses(userDetails.getId(), pageable);
    }

    @PostMapping
    public ExpenseDTO createExpense(Authentication authentication, @RequestBody ExpenseDTO expenseDTO) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return expenseService.createExpense(userDetails.getId(), expenseDTO);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        expenseService.deleteExpense(id, userDetails.getId());
    }
}
