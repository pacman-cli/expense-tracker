package com.expensetracker.features.prediction;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PredictionController {

    private final PredictionService predictionService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Prediction>> getPredictions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(predictionService.getPredictions(user));
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generatePredictions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        predictionService.generatePredictions(user);
        return ResponseEntity.ok("Predictions generated successfully");
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deletePredictions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        predictionService.deletePredictions(user);
        return ResponseEntity.ok(Map.of("message", "All predictions deleted successfully"));
    }

    @GetMapping("/accuracy")
    public ResponseEntity<Map<String, Object>> getAccuracyStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> stats = predictionService.getAccuracyStats(user);
        return ResponseEntity.ok(stats);
    }
}
