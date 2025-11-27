package com.expensetracker.features.tax;

import com.expensetracker.entity.User;
import com.expensetracker.exception.BusinessException;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tax-exports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class TaxExportController {

    private final TaxExportService taxExportService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllTaxExports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            log.info("GET /api/tax-exports - User: {}", userDetails.getId());
            List<TaxExport> exports = taxExportService.getTaxExports(userDetails.getId());
            return ResponseEntity.ok(exports);
        } catch (BusinessException e) {
            log.error("Business error fetching tax exports: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching tax exports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tax exports: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaxExportById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            log.info("GET /api/tax-exports/{} - User: {}", id, userDetails.getId());
            TaxExport export = taxExportService.getTaxExportById(userDetails.getId(), id);
            return ResponseEntity.ok(export);
        } catch (BusinessException e) {
            log.error("Business error fetching tax export: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching tax export {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tax export: " + e.getMessage()));
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateTaxExport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody TaxExportService.TaxExportRequest request) {
        try {
            log.info("POST /api/tax-exports/generate - User: {}, Request: {}", userDetails.getId(), request);

            // Validate request
            if (request.getTaxYear() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tax year is required"));
            }
            if (request.getFormat() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Export format is required"));
            }
            if (request.getExportType() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Export type is required"));
            }

            TaxExport export = taxExportService.generateTaxExport(userDetails.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(export);
        } catch (BusinessException e) {
            log.error("Business error generating tax export: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating tax export", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate tax export: " + e.getMessage()));
        }
    }

    @GetMapping("/preview")
    public ResponseEntity<?> previewTaxSummary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam Integer taxYear,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        try {
            log.info("GET /api/tax-exports/preview - User: {}, Year: {}", userDetails.getId(), taxYear);
            Map<String, Object> preview = taxExportService.previewTaxSummary(
                    userDetails.getId(), taxYear, startDate, endDate);
            return ResponseEntity.ok(preview);
        } catch (BusinessException e) {
            log.error("Business error previewing tax summary: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error previewing tax summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to preview tax summary: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadTaxExport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            log.info("GET /api/tax-exports/{}/download - User: {}", id, userDetails.getId());
            TaxExport export = taxExportService.getTaxExportById(userDetails.getId(), id);

            if (export.getFileUrl() == null || export.getFileUrl().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Export file not available"));
            }

            // Return the file URL (in our case, base64 data URL)
            return ResponseEntity.ok(Map.of(
                    "fileUrl", export.getFileUrl(),
                    "fileName", export.getFileName(),
                    "fileSize", export.getFileSize()));
        } catch (BusinessException e) {
            log.error("Business error downloading tax export: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error downloading tax export {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to download tax export: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTaxExport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        try {
            log.info("DELETE /api/tax-exports/{} - User: {}", id, userDetails.getId());
            taxExportService.deleteTaxExport(userDetails.getId(), id);
            return ResponseEntity.ok(Map.of("message", "Tax export deleted successfully"));
        } catch (BusinessException e) {
            log.error("Business error deleting tax export: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting tax export {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete tax export: " + e.getMessage()));
        }
    }
}
