package com.expensetracker.features.debt;

import com.expensetracker.entity.User;
import com.expensetracker.exception.BusinessException;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserDetailsImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DebtController {

        private final DebtRepository debtRepository;
        private final UserRepository userRepository;

        /**
         * Get all debts for the current user
         */
        @GetMapping
        public ResponseEntity<List<Debt>> getAllDebts(
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                List<Debt> debts = debtRepository.findByUser(user);
                return ResponseEntity.ok(debts);
        }

        /**
         * Get debts by type (LOAN or DEBT)
         */
        @GetMapping("/type/{type}")
        public ResponseEntity<List<Debt>> getDebtsByType(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable String type) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt.DebtType debtType = Debt.DebtType.valueOf(type.toUpperCase());
                List<Debt> debts = debtRepository.findByUserAndType(user, debtType);
                return ResponseEntity.ok(debts);
        }

        /**
         * Get debts by status
         */
        @GetMapping("/status/{status}")
        public ResponseEntity<List<Debt>> getDebtsByStatus(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable String status) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt.DebtStatus debtStatus = Debt.DebtStatus.valueOf(
                                status.toUpperCase());
                List<Debt> debts = debtRepository.findByUserAndStatus(user, debtStatus);
                return ResponseEntity.ok(debts);
        }

        /**
         * Get a specific debt by ID
         */
        @GetMapping("/{id}")
        public ResponseEntity<Debt> getDebtById(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt debt = debtRepository
                                .findById(id)
                                .orElseThrow(() -> new BusinessException("Debt not found"));

                if (!debt.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("Unauthorized access to debt");
                }

                return ResponseEntity.ok(debt);
        }

        /**
         * Create a new debt
         */
        @PostMapping
        public ResponseEntity<Debt> createDebt(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestBody DebtRequest request) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt debt = Debt.builder()
                                .user(user)
                                .title(request.getTitle())
                                .type(request.getType())
                                .principalAmount(request.getPrincipalAmount())
                                .remainingAmount(request.getPrincipalAmount())
                                .interestRate(request.getInterestRate())
                                .creditorDebtor(request.getCreditorDebtor())
                                .contactInfo(request.getContactInfo())
                                .startDate(request.getStartDate())
                                .dueDate(request.getDueDate())
                                .status(Debt.DebtStatus.ACTIVE)
                                .paymentFrequency(
                                                request.getPaymentFrequency() != null
                                                                ? Debt.PaymentFrequency.valueOf(
                                                                                request.getPaymentFrequency()
                                                                                                .toUpperCase())
                                                                : null)
                                .installmentAmount(request.getInstallmentAmount())
                                .isRecurring(
                                                request.getIsRecurring() != null
                                                                ? request.getIsRecurring()
                                                                : false)
                                .priority(
                                                request.getPriority() != null
                                                                ? request.getPriority()
                                                                : Debt.Priority.MEDIUM)
                                .build();

                debt = debtRepository.save(debt);
                return ResponseEntity.status(HttpStatus.CREATED).body(debt);
        }

        /**
         * Update a debt
         */
        @PutMapping("/{id}")
        public ResponseEntity<Debt> updateDebt(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id,
                        @RequestBody DebtRequest request) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt debt = debtRepository
                                .findById(id)
                                .orElseThrow(() -> new BusinessException("Debt not found"));

                if (!debt.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("Unauthorized access to debt");
                }

                if (request.getTitle() != null)
                        debt.setTitle(request.getTitle());
                if (request.getCreditorDebtor() != null)
                        debt.setCreditorDebtor(
                                        request.getCreditorDebtor());
                if (request.getContactInfo() != null)
                        debt.setContactInfo(
                                        request.getContactInfo());
                if (request.getInterestRate() != null)
                        debt.setInterestRate(
                                        request.getInterestRate());
                if (request.getDueDate() != null)
                        debt.setDueDate(request.getDueDate());
                if (request.getPaymentFrequency() != null) {
                        debt.setPaymentFrequency(
                                        Debt.PaymentFrequency.valueOf(
                                                        request.getPaymentFrequency().toUpperCase()));
                }
                if (request.getInstallmentAmount() != null)
                        debt.setInstallmentAmount(
                                        request.getInstallmentAmount());
                if (request.getPriority() != null)
                        debt.setPriority(
                                        request.getPriority());

                debt = debtRepository.save(debt);
                return ResponseEntity.ok(debt);
        }

        /**
         * Delete a debt
         */
        @DeleteMapping("/{id}")
        public ResponseEntity<Map<String, String>> deleteDebt(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt debt = debtRepository
                                .findById(id)
                                .orElseThrow(() -> new BusinessException("Debt not found"));

                if (!debt.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("Unauthorized access to debt");
                }

                debtRepository.delete(debt);
                return ResponseEntity.ok(
                                Map.of("message", "Debt deleted successfully"));
        }

        /**
         * Record a payment for a debt
         */
        @PostMapping("/{id}/payments")
        public ResponseEntity<Debt> recordPayment(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id,
                        @RequestBody PaymentRequest request) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt debt = debtRepository
                                .findById(id)
                                .orElseThrow(() -> new BusinessException("Debt not found"));

                if (!debt.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("Unauthorized access to debt");
                }

                // Update remaining amount
                BigDecimal newRemaining = debt
                                .getRemainingAmount()
                                .subtract(request.getAmount());
                debt.setRemainingAmount(newRemaining);

                // Update status if paid off
                if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
                        debt.setStatus(Debt.DebtStatus.PAID_OFF);
                        debt.setRemainingAmount(BigDecimal.ZERO);
                }

                debt = debtRepository.save(debt);
                return ResponseEntity.ok(debt);
        }

        /**
         * Get debt statistics
         */
        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getDebtStats(
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                List<Debt> allDebts = debtRepository.findByUser(user);

                BigDecimal totalBorrowed = BigDecimal.ZERO;
                BigDecimal totalLent = BigDecimal.ZERO;
                BigDecimal totalRemaining = BigDecimal.ZERO;
                BigDecimal totalPaidOff = BigDecimal.ZERO;
                int activeCount = 0;
                int paidOffCount = 0;

                for (Debt debt : allDebts) {
                        if (debt.getType() == Debt.DebtType.LENT) {
                                totalLent = totalLent.add(debt.getPrincipalAmount());
                        } else {
                                totalBorrowed = totalBorrowed.add(debt.getPrincipalAmount());
                        }

                        totalRemaining = totalRemaining.add(debt.getRemainingAmount());

                        if (debt.getStatus() == Debt.DebtStatus.PAID_OFF) {
                                paidOffCount++;
                                totalPaidOff = totalPaidOff.add(debt.getPrincipalAmount());
                        } else if (debt.getStatus() == Debt.DebtStatus.ACTIVE) {
                                activeCount++;
                        }
                }

                BigDecimal netDebt = totalBorrowed.subtract(totalLent);

                Map<String, Object> stats = new HashMap<>();
                stats.put("totalBorrowed", totalBorrowed);
                stats.put("totalLent", totalLent);
                stats.put("netDebt", netDebt);
                stats.put("totalRemaining", totalRemaining);
                stats.put("totalPaidOff", totalPaidOff);
                stats.put("activeCount", activeCount);
                stats.put("paidOffCount", paidOffCount);
                stats.put("totalCount", allDebts.size());

                return ResponseEntity.ok(stats);
        }

        /**
         * Get upcoming payments
         */
        @GetMapping("/upcoming")
        public ResponseEntity<List<Debt>> getUpcomingPayments(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestParam(defaultValue = "30") int days) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                LocalDate endDate = LocalDate.now().plusDays(days);
                List<Debt> debts = debtRepository.findByUserAndStatusAndDueDateBefore(
                                user,
                                Debt.DebtStatus.ACTIVE,
                                endDate);
                return ResponseEntity.ok(debts);
        }

        /**
         * Get overdue debts
         */
        @GetMapping("/overdue")
        public ResponseEntity<List<Debt>> getOverdueDebts(
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                List<Debt> debts = debtRepository.findByUserAndStatusAndDueDateBefore(
                                user,
                                Debt.DebtStatus.ACTIVE,
                                LocalDate.now());
                return ResponseEntity.ok(debts);
        }

        /**
         * Mark debt as settled
         */
        @PostMapping("/{id}/settle")
        public ResponseEntity<Debt> settleDebt(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                User user = userRepository
                                .findById(userDetails.getId())
                                .orElseThrow(() -> new BusinessException("User not found"));
                Debt debt = debtRepository
                                .findById(id)
                                .orElseThrow(() -> new BusinessException("Debt not found"));

                if (!debt.getUser().getId().equals(user.getId())) {
                        throw new SecurityException("Unauthorized access to debt");
                }

                debt.setStatus(Debt.DebtStatus.PAID_OFF);
                debt.setRemainingAmount(BigDecimal.ZERO);
                debt = debtRepository.save(debt);

                return ResponseEntity.ok(debt);
        }

        // DTOs
        @lombok.Data
        public static class DebtRequest {

                private String title;
                private Debt.DebtType type;
                private BigDecimal principalAmount;
                private BigDecimal interestRate;
                private String creditorDebtor;
                private String contactInfo;
                private LocalDate startDate;
                private LocalDate dueDate;
                private String paymentFrequency;
                private BigDecimal installmentAmount;
                private Boolean isRecurring;
                private Debt.Priority priority;
        }

        @lombok.Data
        public static class PaymentRequest {

                private BigDecimal amount;
                private LocalDate paymentDate;
                private String paymentMethod;
                private String notes;
        }
}
