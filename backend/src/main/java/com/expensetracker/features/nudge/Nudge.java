package com.expensetracker.features.nudge;

import com.expensetracker.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "nudges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Nudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "nudge_type", nullable = false)
    private NudgeType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private String actionUrl;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    public enum NudgeType {
        BUDGET_ALERT,
        UNUSUAL_SPENDING,
        BILL_REMINDER,
        SAVINGS_OPPORTUNITY,
        GOAL_PROGRESS,
        SPENDING_INSIGHT,
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT,
    }
}
