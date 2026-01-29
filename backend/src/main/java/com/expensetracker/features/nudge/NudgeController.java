package com.expensetracker.features.nudge;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserDetailsImpl;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nudges")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class NudgeController {

    private final NudgeService nudgeService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllNudges(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            log.info("Fetching nudges for user: {}", userDetails.getId());
            User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            List<Nudge> nudges = nudgeService.getNudges(user);
            log.info(
                "Found {} nudges for user: {}",
                nudges.size(),
                userDetails.getId()
            );
            return ResponseEntity.ok(nudges);
        } catch (Exception e) {
            log.error(
                "Failed to fetch nudges for user: {}",
                userDetails.getId(),
                e
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Failed to fetch nudges: " + e.getMessage())
            );
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Nudge>> getUnreadNudges(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        User user = userRepository
            .findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Nudge> nudges = nudgeService.getUnreadNudges(user);
        return ResponseEntity.ok(nudges);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateNudges(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            log.info("Generating nudges for user: {}", userDetails.getId());
            User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            int count = nudgeService.generateNudges(user);
            log.info(
                "Generated {} nudges for user: {}",
                count,
                userDetails.getId()
            );
            return ResponseEntity.ok(
                Map.of(
                    "message", "Nudges generated successfully",
                    "count", count
                )
            );
        } catch (Exception e) {
            log.error(
                "Failed to generate nudges for user: {}",
                userDetails.getId(),
                e
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Failed to generate nudges: " + e.getMessage())
            );
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Nudge> markAsRead(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @PathVariable Long id
    ) {
        User user = userRepository
            .findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        Nudge nudge = nudgeService.markAsRead(user, id);
        return ResponseEntity.ok(nudge);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> dismissNudge(
        @AuthenticationPrincipal UserDetailsImpl userDetails,
        @PathVariable Long id
    ) {
        User user = userRepository
            .findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        nudgeService.dismissNudge(user, id);
        return ResponseEntity.ok(
            Map.of("message", "Nudge dismissed successfully")
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getNudgeStats(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            log.info("Fetching nudge stats for user: {}", userDetails.getId());
            User user = userRepository
                .findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Map<String, Object> stats = nudgeService.getNudgeStats(user);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error(
                "Failed to fetch nudge stats for user: {}",
                userDetails.getId(),
                e
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Failed to fetch stats: " + e.getMessage())
            );
        }
    }
}
