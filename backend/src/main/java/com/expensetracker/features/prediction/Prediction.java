package com.expensetracker.features.prediction;

import com.expensetracker.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "prediction_date")
    private LocalDate predictionDate;

    @Column(name = "predicted_amount")
    private Double predictedAmount;

    @Column(name = "actual_amount")
    private Double actualAmount;

    private Double confidence;

    @Column(name = "prediction_type")
    private String predictionType;

    @Column(name = "prediction_period")
    private String predictionPeriod;

    @Column(name = "algorithm_used")
    private String algorithmUsed;

    @Column(columnDefinition = "TEXT")
    private String insights;

    @Column(name = "is_accurate")
    private Boolean isAccurate;

    @Column(name = "accuracy_percentage")
    private Double accuracyPercentage;

    private Double variance;
}
