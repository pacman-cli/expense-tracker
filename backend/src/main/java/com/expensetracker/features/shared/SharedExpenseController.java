package com.expensetracker.features.shared;

import com.expensetracker.service.UserDetailsImpl;
import com.expensetracker.exception.BusinessException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/shared-expenses")
@Slf4j
public class SharedExpenseController {

    @Autowired
    private SharedExpenseService sharedExpenseService;

    /**
     * Get all shared expenses for the authenticated user
     */
    @GetMapping
    public ResponseEntity<?> getAllSharedExpenses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            log.info(
                    "GET /api/shared-expenses - User: {}",
                    userDetails.getId());
            List<SharedExpense> expenses = sharedExpenseService.getSharedExpenses(userDetails.getId());
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            log.error(
                    "Error fetching shared expenses for user {}: {}",
                    userDetails.getId(),
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get a specific shared expense by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSharedExpenseById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            log.info(
                    "GET /api/shared-expenses/{} - User: {}",
                    id,
                    userDetails.getId());
            SharedExpense expense = sharedExpenseService.getSharedExpenseById(
                    userDetails.getId(),
                    id);
            return ResponseEntity.ok(expense);
        } catch (BusinessException e) {
            log.error(
                    "Error fetching shared expense {} for user {}: {}",
                    id,
                    userDetails.getId(),
                    e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error(
                    "Unexpected error fetching shared expense {}: {}",
                    id,
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Create a new shared expense
     */
    @PostMapping
    public ResponseEntity<?> createSharedExpense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody SharedExpenseDTO dto) {
        try {
            log.info(
                    "POST /api/shared-expenses - User: {}, ExpenseId: {}",
                    userDetails.getId(),
                    dto.getExpenseId());

            // Validate required fields
            if (dto.getExpenseId() == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Expense ID is required"));
            }
            if (dto.getSplitType() == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Split type is required"));
            }
            if (dto.getParticipants() == null || dto.getParticipants().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("At least one participant is required"));
            }

            SharedExpense createdExpense = sharedExpenseService.createSharedExpense(
                    userDetails.getId(),
                    dto);
            log.info(
                    "Successfully created shared expense with ID: {}",
                    createdExpense.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    createdExpense);
        } catch (BusinessException e) {
            log.error(
                    "Error creating shared expense for user {}: {}",
                    userDetails.getId(),
                    e.getMessage());
            return ResponseEntity.badRequest().body(
                    createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error(
                    "Unexpected error creating shared expense: {}",
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse("Failed to create shared expense"));
        }
    }

    /**
     * Update an existing shared expense
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSharedExpense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody SharedExpenseDTO dto) {
        try {
            log.info(
                    "PUT /api/shared-expenses/{} - User: {}",
                    id,
                    userDetails.getId());

            SharedExpense updatedExpense = sharedExpenseService.updateSharedExpense(
                    userDetails.getId(),
                    id,
                    dto);
            log.info("Successfully updated shared expense with ID: {}", id);
            return ResponseEntity.ok(updatedExpense);
        } catch (BusinessException e) {
            log.error(
                    "Error updating shared expense {} for user {}: {}",
                    id,
                    userDetails.getId(),
                    e.getMessage());
            return ResponseEntity.badRequest().body(
                    createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error(
                    "Unexpected error updating shared expense {}: {}",
                    id,
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse("Failed to update shared expense"));
        }
    }

    /**
     * Delete a shared expense
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSharedExpense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            log.info(
                    "DELETE /api/shared-expenses/{} - User: {}",
                    id,
                    userDetails.getId());

            sharedExpenseService.deleteSharedExpense(userDetails.getId(), id);
            log.info("Successfully deleted shared expense with ID: {}", id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shared expense deleted successfully");
            response.put("id", id);

            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            log.error(
                    "Error deleting shared expense {} for user {}: {}",
                    id,
                    userDetails.getId(),
                    e.getMessage());
            return ResponseEntity.badRequest().body(
                    createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error(
                    "Unexpected error deleting shared expense {}: {}",
                    id,
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse("Failed to delete shared expense"));
        }
    }

    /**
     * Mark a participant's share as paid
     */
    @PostMapping("/{expenseId}/participants/{participantId}/pay")
    public ResponseEntity<?> markParticipantAsPaid(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long expenseId,
            @PathVariable Long participantId) {
        try {
            log.info(
                    "POST /api/shared-expenses/{}/participants/{}/pay - User: {}",
                    expenseId,
                    participantId,
                    userDetails.getId());

            SharedExpense updatedExpense = sharedExpenseService.markParticipantAsPaid(
                    userDetails.getId(),
                    expenseId,
                    participantId);
            log.info(
                    "Successfully marked participant {} as paid for expense {}",
                    participantId,
                    expenseId);

            return ResponseEntity.ok(updatedExpense);
        } catch (BusinessException e) {
            log.error("Error marking participant as paid: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error(
                    "Unexpected error marking participant as paid: {}",
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse("Failed to mark participant as paid"));
        }
    }

    /**
     * Settle an entire shared expense (mark all participants as paid)
     */
    @PostMapping("/{id}/settle")
    public ResponseEntity<?> settleSharedExpense(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            log.info(
                    "POST /api/shared-expenses/{}/settle - User: {}",
                    id,
                    userDetails.getId());

            SharedExpense settledExpense = sharedExpenseService.settleSharedExpense(
                    userDetails.getId(),
                    id);
            log.info("Successfully settled shared expense with ID: {}", id);

            return ResponseEntity.ok(settledExpense);
        } catch (BusinessException e) {
            log.error(
                    "Error settling shared expense {}: {}",
                    id,
                    e.getMessage());
            return ResponseEntity.badRequest().body(
                    createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error(
                    "Unexpected error settling shared expense {}: {}",
                    id,
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse("Failed to settle shared expense"));
        }
    }

    /**
     * Get summary of shared expenses (amounts owed/owing)
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getSharedExpenseSummary(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            log.info(
                    "GET /api/shared-expenses/summary - User: {}",
                    userDetails.getId());

            SharedExpenseService.SharedExpenseSummary summary = sharedExpenseService.getSharedExpenseSummary(
                    userDetails.getId());

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error(
                    "Error fetching summary for user {}: {}",
                    userDetails.getId(),
                    e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    createErrorResponse("Failed to fetch summary"));
        }
    }

    /**
     * Helper method to create standardized error responses
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}
