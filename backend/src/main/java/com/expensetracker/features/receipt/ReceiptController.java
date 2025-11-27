package com.expensetracker.features.receipt;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserDetailsImpl;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReceiptController {

    private final ReceiptService receiptService;
    private final UserRepository userRepository;

    /**
     * Upload a new receipt
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Receipt> uploadReceipt(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = userRepository
                    .findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Receipt receipt = receiptService.uploadReceipt(user, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(receipt);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to upload receipt: " + e.getMessage());
        }
    }

    /**
     * Get all receipts for the current user
     */
    @GetMapping
    public ResponseEntity<List<Receipt>> getAllReceipts(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Receipt> receipts = receiptService.getUserReceipts(user);
        return ResponseEntity.ok(receipts);
    }

    /**
     * Get a specific receipt by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Receipt> getReceiptById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Receipt receipt = receiptService.getReceiptById(user, id);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Process a receipt with OCR
     */
    @PostMapping("/{id}/process")
    public ResponseEntity<Receipt> processReceipt(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Receipt receipt = receiptService.processReceipt(user, id);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Create an expense from a receipt
     */
    @PostMapping("/{id}/create-expense")
    public ResponseEntity<Map<String, Object>> createExpenseFromReceipt(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, Object> expenseData) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Receipt receipt = receiptService.createExpenseFromReceipt(
                user,
                id,
                expenseData);
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Expense created successfully from receipt",
                        "receipt",
                        receipt));
    }

    /**
     * Update receipt data manually
     */
    @PutMapping("/{id}")
    public ResponseEntity<Receipt> updateReceipt(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Receipt receipt = receiptService.updateReceipt(user, id, updates);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Delete a receipt
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReceipt(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        receiptService.deleteReceipt(id, user);
        return ResponseEntity.ok(
                Map.of("message", "Receipt deleted successfully"));
    }

    /**
     * Get receipts by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Receipt>> getReceiptsByStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String status) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Receipt.ProcessingStatus receiptStatus = Receipt.ProcessingStatus.valueOf(
                status.toUpperCase());
        List<Receipt> receipts = receiptService.getReceiptsByStatus(
                user,
                receiptStatus);
        return ResponseEntity.ok(receipts);
    }

    /**
     * Get receipt statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getReceiptStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> stats = receiptService.getReceiptStats(user);
        return ResponseEntity.ok(stats);
    }

    /**
     * Reprocess failed receipts
     */
    @PostMapping("/{id}/reprocess")
    public ResponseEntity<Receipt> reprocessReceipt(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Receipt receipt = receiptService.reprocessReceipt(user, id);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Bulk upload receipts
     */
    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> bulkUploadReceipts(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("files") MultipartFile[] files) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Receipt> receipts = receiptService.bulkUploadReceipts(user, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message",
                        "Receipts uploaded successfully",
                        "count",
                        receipts.size(),
                        "receipts",
                        receipts));
    }

    /**
     * Search receipts
     */
    @GetMapping("/search")
    public ResponseEntity<List<Receipt>> searchReceipts(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String merchantName,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Receipt> receipts = receiptService.searchReceipts(
                user,
                merchantName,
                minAmount,
                maxAmount,
                startDate,
                endDate);
        return ResponseEntity.ok(receipts);
    }
}
