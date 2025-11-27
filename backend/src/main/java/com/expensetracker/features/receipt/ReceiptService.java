package com.expensetracker.features.receipt;

import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ExpenseRepository expenseRepository;

    private static final String UPLOAD_DIR = "uploads/receipts/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
        "jpg",
        "jpeg",
        "png",
        "pdf"
    );

    // Regex patterns for OCR text extraction
    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
        "(?:USD|BDT|\\$|৳)?\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)",
        Pattern.CASE_INSENSITIVE
    );
    private static final Pattern DATE_PATTERN = Pattern.compile(
        "\\b(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{4}[/-]\\d{1,2}[/-]\\d{1,2})\\b"
    );
    private static final Pattern MERCHANT_PATTERN = Pattern.compile(
        "^([A-Z][A-Za-z\\s&',.-]+)$",
        Pattern.MULTILINE
    );

    /**
     * Upload and process a receipt
     */
    public Receipt uploadReceipt(User user, MultipartFile file)
        throws IOException {
        // Validate file
        validateFile(file);

        // Save file
        String fileName = generateFileName(file.getOriginalFilename());
        String filePath = saveFile(file, fileName);

        // Create receipt record
        Receipt receipt = Receipt.builder()
            .user(user)
            .imageUrl(filePath)
            .status(Receipt.ProcessingStatus.PENDING)
            .build();

        receipt = receiptRepository.save(receipt);

        // Trigger async OCR processing (in production, use message queue)
        processReceiptAsync(receipt);

        return receipt;
    }

    /**
     * Process receipt with OCR (simplified version - in production use Tesseract, Google Vision, AWS Textract)
     */
    private void processReceiptAsync(Receipt receipt) {
        try {
            receipt.setStatus(Receipt.ProcessingStatus.PROCESSING);
            receiptRepository.save(receipt);

            // Simulate OCR processing
            String ocrText = performOCR(receipt.getImageUrl());
            receipt.setOcrText(ocrText);

            // Extract information from OCR text
            extractReceiptData(receipt, ocrText);

            receipt.setStatus(Receipt.ProcessingStatus.COMPLETED);
            log.info("Receipt {} processed successfully", receipt.getId());
        } catch (Exception e) {
            log.error("Failed to process receipt {}", receipt.getId(), e);
            receipt.setStatus(Receipt.ProcessingStatus.FAILED);
            receipt.setErrorMessage(e.getMessage());
        }

        receiptRepository.save(receipt);
    }

    /**
     * Perform OCR on receipt image (mock implementation)
     * In production, integrate with:
     * - Google Cloud Vision API
     * - AWS Textract
     * - Azure Computer Vision
     * - Tesseract OCR
     */
    private String performOCR(String imagePath) {
        // Mock OCR result - replace with actual OCR library
        return """
        WALMART SUPERCENTER
        Store #1234
        123 Main Street
        City, State 12345

        Date: 12/15/2024
        Time: 14:30:25

        GROCERIES
        Milk                    $4.99
        Bread                   $2.49
        Eggs                    $3.99
        Chicken                $12.99

        SUBTOTAL              $24.46
        TAX                    $2.20
        TOTAL                 $26.66

        VISA ****1234
        Auth: 123456

        Thank you for shopping!
        """;
    }

    /**
     * Extract structured data from OCR text
     */
    private void extractReceiptData(Receipt receipt, String ocrText) {
        // Extract merchant name
        String merchantName = extractMerchantName(ocrText);
        receipt.setMerchantName(merchantName);

        // Extract amount
        BigDecimal amount = extractAmount(ocrText);
        receipt.setExtractedAmount(amount);

        // Extract date
        LocalDateTime date = extractDate(ocrText);
        receipt.setExtractedDate(date);

        // Predict category based on merchant
        String category = predictCategory(merchantName, ocrText);
        receipt.setExtractedCategory(category);

        // Calculate confidence score
        Integer confidence = calculateConfidence(receipt);
        receipt.setConfidence(confidence);

        // Set status based on confidence
        if (confidence < 70) {
            receipt.setStatus(Receipt.ProcessingStatus.MANUAL_REVIEW_NEEDED);
        }
    }

    /**
     * Extract merchant name from OCR text
     */
    private String extractMerchantName(String ocrText) {
        String[] lines = ocrText.split("\\n");
        for (int i = 0; i < Math.min(5, lines.length); i++) {
            String line = lines[i].trim();
            if (!line.isEmpty() && line.length() > 3 && line.length() < 100) {
                // Simple heuristic: first non-empty line with reasonable length
                return line;
            }
        }
        return "Unknown Merchant";
    }

    /**
     * Extract total amount from OCR text
     */
    private BigDecimal extractAmount(String ocrText) {
        // Look for "TOTAL" followed by amount
        Pattern totalPattern = Pattern.compile(
            "TOTAL[:\\s]*(\\$|৳)?\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = totalPattern.matcher(ocrText);

        if (matcher.find()) {
            String amountStr = matcher.group(2).replace(",", "");
            return new BigDecimal(amountStr);
        }

        // Fallback: find largest amount in text
        BigDecimal maxAmount = BigDecimal.ZERO;
        Matcher amountMatcher = AMOUNT_PATTERN.matcher(ocrText);
        while (amountMatcher.find()) {
            String amountStr = amountMatcher.group(1).replace(",", "");
            BigDecimal amount = new BigDecimal(amountStr);
            if (amount.compareTo(maxAmount) > 0) {
                maxAmount = amount;
            }
        }

        return maxAmount.compareTo(BigDecimal.ZERO) > 0 ? maxAmount : null;
    }

    /**
     * Extract date from OCR text
     */
    private LocalDateTime extractDate(String ocrText) {
        Matcher matcher = DATE_PATTERN.matcher(ocrText);
        if (matcher.find()) {
            String dateStr = matcher.group(1);
            try {
                // Try different date formats
                DateTimeFormatter[] formatters = {
                    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                    DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                    DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                    DateTimeFormatter.ofPattern("M/d/yy"),
                    DateTimeFormatter.ofPattern("d/M/yy"),
                };

                for (DateTimeFormatter formatter : formatters) {
                    try {
                        return LocalDateTime.parse(
                            dateStr + " 00:00:00",
                            DateTimeFormatter.ofPattern("M/d/yyyy HH:mm:ss")
                        );
                    } catch (Exception e) {
                        continue;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse date: {}", dateStr);
            }
        }
        return LocalDateTime.now(); // Default to current date if not found
    }

    /**
     * Predict category based on merchant name and OCR text
     */
    private String predictCategory(String merchantName, String ocrText) {
        String lowerText = (merchantName + " " + ocrText).toLowerCase();

        if (
            lowerText.contains("walmart") ||
            lowerText.contains("grocery") ||
            lowerText.contains("supermarket") ||
            lowerText.contains("food")
        ) {
            return "Groceries";
        } else if (
            lowerText.contains("restaurant") ||
            lowerText.contains("cafe") ||
            lowerText.contains("pizza") ||
            lowerText.contains("burger")
        ) {
            return "Dining";
        } else if (
            lowerText.contains("gas") ||
            lowerText.contains("fuel") ||
            lowerText.contains("shell") ||
            lowerText.contains("exxon")
        ) {
            return "Transportation";
        } else if (
            lowerText.contains("pharmacy") ||
            lowerText.contains("medical") ||
            lowerText.contains("hospital") ||
            lowerText.contains("doctor")
        ) {
            return "Healthcare";
        } else if (
            lowerText.contains("amazon") ||
            lowerText.contains("shopping") ||
            lowerText.contains("store")
        ) {
            return "Shopping";
        } else if (
            lowerText.contains("electric") ||
            lowerText.contains("utility") ||
            lowerText.contains("water") ||
            lowerText.contains("internet")
        ) {
            return "Utilities";
        }

        return "Other";
    }

    /**
     * Calculate confidence score for OCR extraction
     */
    private Integer calculateConfidence(Receipt receipt) {
        int score = 100;

        // Reduce confidence if data is missing
        if (
            receipt.getMerchantName() == null ||
            receipt.getMerchantName().contains("Unknown")
        ) {
            score -= 20;
        }
        if (receipt.getExtractedAmount() == null) {
            score -= 30;
        }
        if (receipt.getExtractedDate() == null) {
            score -= 15;
        }
        if (
            receipt.getExtractedCategory() == null ||
            receipt.getExtractedCategory().equals("Other")
        ) {
            score -= 10;
        }

        // Ensure score is within 0-100
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Link receipt to expense
     */
    public Receipt linkToExpense(Long receiptId, Long expenseId, User user) {
        Receipt receipt = receiptRepository
            .findById(receiptId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Receipt not found")
            );

        if (!receipt.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to receipt");
        }

        Expense expense = expenseRepository
            .findById(expenseId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Expense not found")
            );

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to expense");
        }

        receipt.setExpense(expense);
        return receiptRepository.save(receipt);
    }

    /**
     * Create expense from receipt
     */
    public Expense createExpenseFromReceipt(Long receiptId, User user) {
        Receipt receipt = receiptRepository
            .findById(receiptId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Receipt not found")
            );

        if (!receipt.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to receipt");
        }

        // Create expense from receipt data
        Expense expense = Expense.builder()
            .user(user)
            .description(
                receipt.getMerchantName() != null
                    ? receipt.getMerchantName()
                    : "Expense from receipt"
            )
            .amount(
                receipt.getExtractedAmount() != null
                    ? receipt.getExtractedAmount()
                    : BigDecimal.ZERO
            )
            .date(
                receipt.getExtractedDate() != null
                    ? receipt.getExtractedDate().toLocalDate()
                    : null
            )
            .build();

        expense = expenseRepository.save(expense);

        // Link receipt to expense
        receipt.setExpense(expense);
        receiptRepository.save(receipt);

        return expense;
    }

    /**
     * Get all receipts for user
     */
    @Transactional(readOnly = true)
    public Page<Receipt> getUserReceipts(User user, Pageable pageable) {
        return receiptRepository.findByUser(user, pageable);
    }

    /**
     * Get all receipts for user without pagination
     */
    @Transactional(readOnly = true)
    public List<Receipt> getUserReceipts(User user) {
        return receiptRepository.findByUserAndExpenseIsNull(user);
    }

    /**
     * Get receipt by ID
     */
    @Transactional(readOnly = true)
    public Receipt getReceipt(Long id, User user) {
        Receipt receipt = receiptRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Receipt not found")
            );

        if (!receipt.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to receipt");
        }

        return receipt;
    }

    /**
     * Get receipts needing manual review
     */
    @Transactional(readOnly = true)
    public List<Receipt> getReceiptsNeedingReview(User user) {
        return receiptRepository.findByUserAndStatus(
            user,
            Receipt.ProcessingStatus.MANUAL_REVIEW_NEEDED
        );
    }

    /**
     * Get unlinked receipts
     */
    @Transactional(readOnly = true)
    public List<Receipt> getUnlinkedReceipts(User user) {
        return receiptRepository.findByUserAndExpenseIsNull(user);
    }

    /**
     * Update receipt manually
     */
    public Receipt updateReceipt(
        Long id,
        User user,
        String merchantName,
        BigDecimal amount,
        LocalDateTime date,
        String category
    ) {
        Receipt receipt = getReceipt(id, user);

        if (merchantName != null) receipt.setMerchantName(merchantName);
        if (amount != null) receipt.setExtractedAmount(amount);
        if (date != null) receipt.setExtractedDate(date);
        if (category != null) receipt.setExtractedCategory(category);

        // Recalculate confidence
        receipt.setConfidence(calculateConfidence(receipt));
        receipt.setStatus(Receipt.ProcessingStatus.COMPLETED);

        return receiptRepository.save(receipt);
    }

    /**
     * Delete receipt
     */
    public void deleteReceipt(Long id, User user) {
        Receipt receipt = getReceipt(id, user);

        // Delete file
        try {
            Path filePath = Paths.get(receipt.getImageUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error(
                "Failed to delete receipt file: {}",
                receipt.getImageUrl(),
                e
            );
        }

        receiptRepository.delete(receipt);
    }

    /**
     * Get receipt statistics
     */
    @Transactional(readOnly = true)
    public ReceiptStatistics getStatistics(User user) {
        List<Object[]> stats = receiptRepository.getReceiptStatisticsByUser(
            user
        );

        long total = receiptRepository.count();
        long completed = receiptRepository.countByUserAndStatus(
            user,
            Receipt.ProcessingStatus.COMPLETED
        );
        long pending = receiptRepository.countByUserAndStatus(
            user,
            Receipt.ProcessingStatus.PENDING
        );
        long failed = receiptRepository.countByUserAndStatus(
            user,
            Receipt.ProcessingStatus.FAILED
        );
        long needsReview = receiptRepository.countByUserAndStatus(
            user,
            Receipt.ProcessingStatus.MANUAL_REVIEW_NEEDED
        );

        return new ReceiptStatistics(
            total,
            completed,
            pending,
            failed,
            needsReview
        );
    }

    // Helper methods

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                "File size exceeds maximum limit of 10MB"
            );
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                "File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS
            );
        }
    }

    private String generateFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + "." + extension;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : "";
    }

    private String saveFile(MultipartFile file, String fileName)
        throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(
            file.getInputStream(),
            filePath,
            StandardCopyOption.REPLACE_EXISTING
        );

        return filePath.toString();
    }

    // DTO for statistics
    public record ReceiptStatistics(
        long total,
        long completed,
        long pending,
        long failed,
        long needsReview
    ) {}

    /**
     * Get receipt by ID for a user
     */
    public Receipt getReceiptById(User user, Long id) {
        Receipt receipt = receiptRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Receipt not found")
            );

        if (!receipt.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to receipt");
        }

        return receipt;
    }

    /**
     * Process a receipt manually
     */
    @Transactional
    public Receipt processReceipt(User user, Long id) {
        Receipt receipt = getReceiptById(user, id);

        if (receipt.getStatus() == Receipt.ProcessingStatus.PROCESSING) {
            throw new IllegalStateException(
                "Receipt is already being processed"
            );
        }

        receipt.setStatus(Receipt.ProcessingStatus.PROCESSING);
        receipt = receiptRepository.save(receipt);

        // Process asynchronously
        processReceiptAsync(receipt);

        return receipt;
    }

    /**
     * Create expense from receipt with custom data
     */
    @Transactional
    public Receipt createExpenseFromReceipt(
        User user,
        Long id,
        Map<String, Object> expenseData
    ) {
        Receipt receipt = getReceiptById(user, id);

        // Extract expense data from the map
        String description = expenseData.get("description") != null
            ? expenseData.get("description").toString()
            : receipt.getMerchantName();

        BigDecimal amount = expenseData.get("amount") != null
            ? new BigDecimal(expenseData.get("amount").toString())
            : receipt.getExtractedAmount();

        // Create expense
        Expense expense = Expense.builder()
            .user(user)
            .description(description)
            .amount(amount)
            .date(
                receipt.getExtractedDate() != null
                    ? receipt.getExtractedDate().toLocalDate()
                    : LocalDate.now()
            )
            .build();

        expense = expenseRepository.save(expense);

        // Link receipt to expense
        receipt.setLinkedExpenseId(expense.getId());
        receipt = receiptRepository.save(receipt);

        return receipt;
    }

    /**
     * Update receipt with custom data
     */
    @Transactional
    public Receipt updateReceipt(
        User user,
        Long id,
        Map<String, Object> updates
    ) {
        Receipt receipt = getReceiptById(user, id);

        if (updates.containsKey("merchantName")) {
            receipt.setMerchantName(updates.get("merchantName").toString());
        }
        if (updates.containsKey("amount")) {
            receipt.setExtractedAmount(
                new BigDecimal(updates.get("amount").toString())
            );
        }
        if (updates.containsKey("category")) {
            receipt.setExtractedCategory(updates.get("category").toString());
        }

        return receiptRepository.save(receipt);
    }

    /**
     * Get receipts by status
     */
    public List<Receipt> getReceiptsByStatus(
        User user,
        Receipt.ProcessingStatus status
    ) {
        return receiptRepository.findByUserAndStatus(user, status);
    }

    /**
     * Get receipt statistics
     */
    public Map<String, Object> getReceiptStats(User user) {
        ReceiptStatistics stats = getStatistics(user);

        return Map.of(
            "total",
            stats.total(),
            "completed",
            stats.completed(),
            "pending",
            stats.pending(),
            "failed",
            stats.failed(),
            "needsReview",
            stats.needsReview()
        );
    }

    /**
     * Reprocess a failed receipt
     */
    @Transactional
    public Receipt reprocessReceipt(User user, Long id) {
        Receipt receipt = getReceiptById(user, id);

        if (receipt.getStatus() != Receipt.ProcessingStatus.FAILED) {
            throw new IllegalStateException(
                "Only failed receipts can be reprocessed"
            );
        }

        receipt.setStatus(Receipt.ProcessingStatus.PENDING);
        receipt = receiptRepository.save(receipt);

        // Process asynchronously
        processReceiptAsync(receipt);

        return receipt;
    }

    /**
     * Bulk upload receipts
     */
    @Transactional
    public List<Receipt> bulkUploadReceipts(User user, MultipartFile[] files) {
        List<Receipt> receipts = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                Receipt receipt = uploadReceipt(user, file);
                receipts.add(receipt);
            } catch (Exception e) {
                log.error(
                    "Failed to upload file: {}",
                    file.getOriginalFilename(),
                    e
                );
            }
        }

        return receipts;
    }

    /**
     * Search receipts
     */
    public List<Receipt> searchReceipts(
        User user,
        String merchantName,
        Double minAmount,
        Double maxAmount,
        String startDate,
        String endDate
    ) {
        List<Receipt> receipts = getUserReceipts(user);

        return receipts
            .stream()
            .filter(r -> {
                boolean matches = true;

                if (merchantName != null && !merchantName.isEmpty()) {
                    matches =
                        matches &&
                        r.getMerchantName() != null &&
                        r
                            .getMerchantName()
                            .toLowerCase()
                            .contains(merchantName.toLowerCase());
                }

                if (minAmount != null && r.getExtractedAmount() != null) {
                    matches =
                        matches &&
                        r.getExtractedAmount().doubleValue() >= minAmount;
                }

                if (maxAmount != null && r.getExtractedAmount() != null) {
                    matches =
                        matches &&
                        r.getExtractedAmount().doubleValue() <= maxAmount;
                }

                // Date filtering can be added here if needed

                return matches;
            })
            .collect(Collectors.toList());
    }
}
