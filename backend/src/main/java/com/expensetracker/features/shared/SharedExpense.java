package com.expensetracker.features.shared;

import com.expensetracker.entity.BaseEntity;
import com.expensetracker.entity.User;
import com.expensetracker.features.expense.Expense;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
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
@Table(name = "shared_expenses")
public class SharedExpense extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "expense_id", nullable = false)
    @JsonIgnoreProperties({ "user", "wallet", "hibernateLazyInitializer", "handler" })
    private Expense expense;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paid_by_user_id", nullable = false)
    @JsonIgnoreProperties({ "password", "refreshToken", "hibernateLazyInitializer", "handler" })
    private User paidBy; // User who paid the bill

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SplitType splitType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isSettled = false;

    private LocalDateTime settledAt;

    @OneToMany(mappedBy = "sharedExpense", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({ "sharedExpense", "hibernateLazyInitializer", "handler" })
    @Builder.Default
    private Set<SharedExpenseParticipant> participants = new HashSet<>();

    @Column(length = 100)
    private String groupName; // Optional group name like "Weekend Trip", "Dinner with Friends"

    public enum SplitType {
        EQUAL, // Split equally among all participants
        PERCENTAGE, // Split by percentage
        EXACT_AMOUNT, // Specify exact amount for each person
        SHARES, // Split by shares/units
    }

    // Helper method to add participant
    public void addParticipant(SharedExpenseParticipant participant) {
        participants.add(participant);
        participant.setSharedExpense(this);
    }

    // Helper method to remove participant
    public void removeParticipant(SharedExpenseParticipant participant) {
        participants.remove(participant);
        participant.setSharedExpense(null);
    }
}
