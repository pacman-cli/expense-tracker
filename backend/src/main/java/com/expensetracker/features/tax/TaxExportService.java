package com.expensetracker.features.tax;

import com.expensetracker.entity.User;
import com.expensetracker.exception.BusinessException;
import com.expensetracker.features.category.Category;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaxExportService {

    private final TaxExportRepository taxExportRepository;
    private final UserRepository userRepository;
    private final com.expensetracker.features.expense.ExpenseRepository expenseRepository;
    private final com.expensetracker.features.category.CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    // Categories typically considered tax-deductible (can be customized per
    // country)
    private static final Set<String> DEDUCTIBLE_CATEGORIES = Set.of(
            "Business", "Office Supplies", "Travel", "Professional Services",
            "Medical", "Charitable Donations", "Education", "Insurance",
            "Home Office", "Utilities", "Internet", "Phone");

    @Transactional(readOnly = true)
    public List<TaxExport> getTaxExports(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
        return taxExportRepository.findRecentExports(user, org.springframework.data.domain.PageRequest.of(0, 100));
    }

    @Transactional(readOnly = true)
    public TaxExport getTaxExportById(Long userId, Long exportId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));
        TaxExport export = taxExportRepository.findById(exportId)
                .orElseThrow(() -> new BusinessException("Tax export not found"));

        if (!export.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Unauthorized access to tax export");
        }

        return export;
    }

    @Transactional
    public TaxExport generateTaxExport(Long userId, TaxExportRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        log.info("Generating tax export for user {} with params: {}", userId, request);

        // Validate dates
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate()
                : LocalDate.of(request.getTaxYear(), 1, 1);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate()
                : LocalDate.of(request.getTaxYear(), 12, 31);

        if (startDate.isAfter(endDate)) {
            throw new BusinessException("Start date cannot be after end date");
        }

        // Fetch expenses in date range
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);

        if (expenses.isEmpty()) {
            log.warn("No expenses found for user {} in date range {} to {}", userId, startDate, endDate);
        }

        // Calculate tax summary
        TaxSummary summary = calculateTaxSummary(expenses, request);

        // Create tax export entity
        TaxExport export = TaxExport.builder()
                .user(user)
                .taxYear(request.getTaxYear())
                .startDate(startDate)
                .endDate(endDate)
                .format(request.getFormat())
                .exportType(request.getExportType())
                .fileName(generateFileName(user, request))
                .fileSize(0L) // Will be set when file is generated
                .status(TaxExport.ExportStatus.COMPLETED) // Simplified - generate immediately
                .totalIncome(summary.getTotalIncome())
                .totalExpenses(summary.getTotalExpenses())
                .totalDeductibleExpenses(summary.getTotalDeductibleExpenses())
                .totalNonDeductibleExpenses(summary.getTotalNonDeductibleExpenses())
                .netTaxableIncome(summary.getNetTaxableIncome())
                .totalTransactions(summary.getTotalTransactions())
                .deductibleTransactions(summary.getDeductibleTransactions())
                .medicalExpenses(summary.getMedicalExpenses())
                .charitableDonations(summary.getCharitableDonations())
                .businessExpenses(summary.getBusinessExpenses())
                .includeReceipts(request.getIncludeReceipts() != null ? request.getIncludeReceipts() : false)
                .includeNotes(request.getIncludeNotes() != null ? request.getIncludeNotes() : true)
                .generatedAt(LocalDate.now())
                .downloadCount(0)
                .generatedBy("System")
                .build();

        // Store category breakdowns and other data as JSON
        try {
            export.setDeductibleCategories(objectMapper.writeValueAsString(summary.getCategoryBreakdown()));
            export.setIncludedCategories(objectMapper.writeValueAsString(request.getIncludedCategories()));
        } catch (JsonProcessingException e) {
            log.error("Error converting data to JSON", e);
        }

        // Generate the actual file data (stored in memory for now)
        String fileData = generateExportFileData(expenses, summary, request);
        export.setFileUrl("data:text/plain;base64," + Base64.getEncoder().encodeToString(fileData.getBytes()));
        export.setFileSize((long) fileData.length());

        return taxExportRepository.save(export);
    }

    @Transactional
    public void deleteTaxExport(Long userId, Long exportId) {
        TaxExport export = getTaxExportById(userId, exportId);
        taxExportRepository.delete(export);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> previewTaxSummary(Long userId, Integer taxYear, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        LocalDate start = startDate != null ? startDate : LocalDate.of(taxYear, 1, 1);
        LocalDate end = endDate != null ? endDate : LocalDate.of(taxYear, 12, 31);

        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, start, end);
        TaxSummary summary = calculateTaxSummary(expenses, null);

        Map<String, Object> preview = new HashMap<>();
        preview.put("taxYear", taxYear);
        preview.put("startDate", start);
        preview.put("endDate", end);
        preview.put("totalExpenses", summary.getTotalExpenses());
        preview.put("totalDeductibleExpenses", summary.getTotalDeductibleExpenses());
        preview.put("totalNonDeductibleExpenses", summary.getTotalNonDeductibleExpenses());
        preview.put("totalTransactions", summary.getTotalTransactions());
        preview.put("deductibleTransactions", summary.getDeductibleTransactions());
        preview.put("categoryBreakdown", summary.getCategoryBreakdown());
        preview.put("estimatedTaxSavings", summary.getTotalDeductibleExpenses().multiply(new BigDecimal("0.25"))); // 25%
                                                                                                                   // estimated
                                                                                                                   // tax
                                                                                                                   // rate

        return preview;
    }

    private TaxSummary calculateTaxSummary(List<Expense> expenses, TaxExportRequest request) {
        TaxSummary summary = new TaxSummary();

        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal totalDeductible = BigDecimal.ZERO;
        BigDecimal medicalExpenses = BigDecimal.ZERO;
        BigDecimal charitableExpenses = BigDecimal.ZERO;
        BigDecimal businessExpenses = BigDecimal.ZERO;
        int deductibleCount = 0;

        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();

        for (Expense expense : expenses) {
            totalExpenses = totalExpenses.add(expense.getAmount());

            String categoryName = expense.getCategory() != null ? expense.getCategory().getName() : "Uncategorized";
            categoryBreakdown.merge(categoryName, expense.getAmount(), BigDecimal::add);

            // Determine if deductible
            boolean isDeductible = isExpenseDeductible(expense, request);
            if (isDeductible) {
                totalDeductible = totalDeductible.add(expense.getAmount());
                deductibleCount++;

                // Categorize special deductible types
                if (categoryName.equalsIgnoreCase("Medical") || categoryName.contains("Health")) {
                    medicalExpenses = medicalExpenses.add(expense.getAmount());
                } else if (categoryName.equalsIgnoreCase("Charitable Donations") || categoryName.contains("Charity")) {
                    charitableExpenses = charitableExpenses.add(expense.getAmount());
                } else if (categoryName.equalsIgnoreCase("Business") || categoryName.contains("Business")) {
                    businessExpenses = businessExpenses.add(expense.getAmount());
                }
            }
        }

        summary.setTotalExpenses(totalExpenses);
        summary.setTotalDeductibleExpenses(totalDeductible);
        summary.setTotalNonDeductibleExpenses(totalExpenses.subtract(totalDeductible));
        summary.setTotalTransactions(expenses.size());
        summary.setDeductibleTransactions(deductibleCount);
        summary.setMedicalExpenses(medicalExpenses);
        summary.setCharitableDonations(charitableExpenses);
        summary.setBusinessExpenses(businessExpenses);
        summary.setCategoryBreakdown(categoryBreakdown);
        summary.setNetTaxableIncome(BigDecimal.ZERO.subtract(totalDeductible)); // Negative = reduces taxable income

        return summary;
    }

    private boolean isExpenseDeductible(Expense expense, TaxExportRequest request) {
        if (expense.getCategory() == null) {
            return false;
        }

        String categoryName = expense.getCategory().getName();

        // If specific categories included, check against that list
        if (request != null && request.getIncludedCategories() != null && !request.getIncludedCategories().isEmpty()) {
            return request.getIncludedCategories().contains(categoryName);
        }

        // Otherwise use default deductible categories
        return DEDUCTIBLE_CATEGORIES.stream()
                .anyMatch(deductible -> categoryName.toLowerCase().contains(deductible.toLowerCase()));
    }

    private String generateFileName(User user, TaxExportRequest request) {
        String formatExt = switch (request.getFormat()) {
            case PDF -> "pdf";
            case CSV -> "csv";
            case EXCEL -> "xlsx";
            case JSON -> "json";
            default -> "txt";
        };

        return String.format("tax_export_%d_%s_%s.%s",
                request.getTaxYear(),
                user.getEmail().replaceAll("[^a-zA-Z0-9]", "_"),
                LocalDate.now().toString(),
                formatExt);
    }

    private String generateExportFileData(List<Expense> expenses, TaxSummary summary, TaxExportRequest request) {
        return switch (request.getFormat()) {
            case CSV -> generateCSV(expenses, summary, request);
            case JSON -> generateJSON(expenses, summary, request);
            default -> generateCSV(expenses, summary, request); // Default to CSV
        };
    }

    private String generateCSV(List<Expense> expenses, TaxSummary summary, TaxExportRequest request) {
        StringBuilder csv = new StringBuilder();

        // Header
        csv.append("# Tax Export Report\n");
        csv.append(String.format("# Tax Year: %d\n", request.getTaxYear()));
        csv.append(String.format("# Date Range: %s to %s\n", request.getStartDate(), request.getEndDate()));
        csv.append(String.format("# Generated: %s\n", LocalDate.now()));
        csv.append("\n");

        // Summary
        csv.append("# SUMMARY\n");
        csv.append(String.format("Total Expenses,%s\n", summary.getTotalExpenses()));
        csv.append(String.format("Deductible Expenses,%s\n", summary.getTotalDeductibleExpenses()));
        csv.append(String.format("Non-Deductible Expenses,%s\n", summary.getTotalNonDeductibleExpenses()));
        csv.append(String.format("Total Transactions,%d\n", summary.getTotalTransactions()));
        csv.append(String.format("Deductible Transactions,%d\n", summary.getDeductibleTransactions()));
        csv.append("\n");

        // Expense Details
        csv.append("Date,Description,Category,Amount,Deductible\n");
        for (Expense expense : expenses) {
            String categoryName = expense.getCategory() != null ? expense.getCategory().getName() : "None";
            boolean deductible = isExpenseDeductible(expense, request);

            csv.append(String.format("%s,\"%s\",%s,%s,%s\n",
                    expense.getDate(),
                    expense.getDescription().replace("\"", "\"\""),
                    categoryName,
                    expense.getAmount(),
                    deductible ? "Yes" : "No"));
        }

        return csv.toString();
    }

    private String generateJSON(List<Expense> expenses, TaxSummary summary, TaxExportRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("taxYear", request.getTaxYear());
        data.put("dateRange", Map.of("start", request.getStartDate(), "end", request.getEndDate()));
        data.put("generatedAt", LocalDate.now());
        data.put("summary", Map.of(
                "totalExpenses", summary.getTotalExpenses(),
                "deductibleExpenses", summary.getTotalDeductibleExpenses(),
                "nonDeductibleExpenses", summary.getTotalNonDeductibleExpenses(),
                "totalTransactions", summary.getTotalTransactions(),
                "deductibleTransactions", summary.getDeductibleTransactions(),
                "categoryBreakdown", summary.getCategoryBreakdown()));

        List<Map<String, Object>> expenseList = expenses.stream().map(expense -> {
            Map<String, Object> exp = new HashMap<>();
            exp.put("date", expense.getDate());
            exp.put("description", expense.getDescription());
            exp.put("category", expense.getCategory() != null ? expense.getCategory().getName() : "None");
            exp.put("amount", expense.getAmount());
            exp.put("deductible", isExpenseDeductible(expense, request));
            return exp;
        }).collect(Collectors.toList());

        data.put("expenses", expenseList);

        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Error generating JSON export", e);
            return "{}";
        }
    }

    // Inner class for tax summary
    @lombok.Data
    private static class TaxSummary {
        private BigDecimal totalIncome = BigDecimal.ZERO;
        private BigDecimal totalExpenses = BigDecimal.ZERO;
        private BigDecimal totalDeductibleExpenses = BigDecimal.ZERO;
        private BigDecimal totalNonDeductibleExpenses = BigDecimal.ZERO;
        private BigDecimal netTaxableIncome = BigDecimal.ZERO;
        private Integer totalTransactions = 0;
        private Integer deductibleTransactions = 0;
        private BigDecimal medicalExpenses = BigDecimal.ZERO;
        private BigDecimal charitableDonations = BigDecimal.ZERO;
        private BigDecimal businessExpenses = BigDecimal.ZERO;
        private Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
    }

    // DTO for tax export request
    @lombok.Data
    public static class TaxExportRequest {
        private Integer taxYear;
        private LocalDate startDate;
        private LocalDate endDate;
        private TaxExport.TaxExportFormat format;
        private TaxExport.TaxExportType exportType;
        private List<String> includedCategories;
        private Boolean includeReceipts;
        private Boolean includeNotes;
    }
}
