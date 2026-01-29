package com.expensetracker.features.shared;

import com.expensetracker.entity.BaseEntity;
import com.expensetracker.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@lombok.EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shared_expense_participants")
public class SharedExpenseParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_expense_id", nullable = false)
    @JsonIgnoreProperties({ "participants", "expense", "hibernateLazyInitializer", "handler" })
    private SharedExpense sharedExpense;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({ "password", "refreshToken", "hibernateLazyInitializer", "handler" })
    private User user; // Null if external/non-user participant

    @Column(length = 255)
    private String externalParticipantName; // For people not in the system

    @Column(length = 255)
    private String externalParticipantEmail;

    @Column(nullable = false)
    private BigDecimal shareAmount; // Amount this participant owes

    private BigDecimal sharePercentage; // For percentage-based splits

    private Integer shareUnits; // For share-based splits

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPaid = false;

    private LocalDateTime paidAt;

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParticipantStatus status = ParticipantStatus.PENDING;

    public enum ParticipantStatus {
        PENDING, // Waiting for payment
        PAID, // Paid their share
        DISPUTED, // Participant disputes the amount
        WAIVED, // Amount was waived
    }

    // Helper method to get participant name
    public String getParticipantName() {
        if (user != null) {
            return user.getEmail(); // or user.getName() if you have a name field
        }
        return externalParticipantName;
    }

    // Helper method to check if participant is registered user
    public boolean isRegisteredUser() {
        return user != null;
    }
}
