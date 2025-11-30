package com.expensetracker.features.shared;

import com.expensetracker.entity.User;
import com.expensetracker.exception.BusinessException;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SharedExpenseService {

        private final SharedExpenseRepository sharedExpenseRepository;
        private final ExpenseRepository expenseRepository;
        private final UserRepository userRepository;

        /**
         * Get all shared expenses for a user (as payer or participant)
         */
        @Transactional(readOnly = true)
        public List<SharedExpense> getSharedExpenses(Long userId) {
                log.info("Fetching shared expenses for user: {}", userId);
                try {
                        User user = userRepository
                                        .findById(userId)
                                        .orElseThrow(() -> new BusinessException("User not found with id: " + userId));

                        List<SharedExpense> expenses = sharedExpenseRepository.findUnsettledByUser(user);
                        expenses.addAll(
                                        sharedExpenseRepository
                                                        .findSettledByUser(
                                                                        user,
                                                                        org.springframework.data.domain.Pageable
                                                                                        .unpaged())
                                                        .getContent());

                        log.info(
                                        "Found {} shared expenses for user: {}",
                                        expenses.size(),
                                        userId);
                        return expenses;
                } catch (Exception e) {
                        log.error(
                                        "Error fetching shared expenses for user {}: {}",
                                        userId,
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to fetch shared expenses: " + e.getMessage());
                }
        }

        /**
         * Get a specific shared expense by ID
         */
        @Transactional(readOnly = true)
        public SharedExpense getSharedExpenseById(Long userId, Long expenseId) {
                log.info("Fetching shared expense {} for user {}", expenseId, userId);
                User user = userRepository
                                .findById(userId)
                                .orElseThrow(() -> new BusinessException("User not found with id: " + userId));

                SharedExpense sharedExpense = sharedExpenseRepository
                                .findById(expenseId)
                                .orElseThrow(() -> new BusinessException(
                                                "Shared expense not found with id: " + expenseId));

                // Verify user has access to this expense
                boolean hasAccess = sharedExpense.getPaidBy().getId().equals(userId) ||
                                sharedExpense
                                                .getParticipants()
                                                .stream()
                                                .anyMatch(
                                                                p -> p.getUser() != null &&
                                                                                p.getUser().getId().equals(userId));

                if (!hasAccess) {
                        throw new BusinessException(
                                        "User does not have access to this shared expense");
                }

                // Initialize lazy loaded fields
                if (sharedExpense.getExpense() != null && sharedExpense.getExpense().getCategory() != null) {
                        org.hibernate.Hibernate.initialize(sharedExpense.getExpense().getCategory());
                }

                return sharedExpense;
        }

        /**
         * Create a new shared expense with automatic split calculation
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public SharedExpense createSharedExpense(
                        Long userId,
                        SharedExpenseDTO dto) {
                log.info("Creating shared expense for user: {}", userId);
                try {
                        // Validate user
                        User paidBy = userRepository
                                        .findById(userId)
                                        .orElseThrow(() -> new BusinessException("User not found with id: " + userId));

                        // Validate expense
                        Expense expense = expenseRepository
                                        .findById(dto.getExpenseId())
                                        .orElseThrow(() -> new BusinessException(
                                                        "Expense not found with id: " + dto.getExpenseId()));

                        // Verify expense belongs to user
                        if (!expense.getUser().getId().equals(userId)) {
                                throw new BusinessException("Expense does not belong to user");
                        }

                        // Validate participants
                        if (dto.getParticipants() == null || dto.getParticipants().isEmpty()) {
                                throw new BusinessException(
                                                "At least one participant is required");
                        }

                        // Create shared expense
                        SharedExpense sharedExpense = SharedExpense.builder()
                                        .expense(expense)
                                        .paidBy(paidBy)
                                        .totalAmount(expense.getAmount())
                                        .description(
                                                        dto.getDescription() != null
                                                                        ? dto.getDescription()
                                                                        : expense.getDescription())
                                        .splitType(SharedExpense.SplitType.valueOf(dto.getSplitType()))
                                        .isSettled(false)
                                        .groupName(dto.getGroupName())
                                        .build();

                        // Calculate and add participants
                        List<SharedExpenseParticipant> participants = calculateParticipantShares(
                                        dto,
                                        expense.getAmount(),
                                        sharedExpense);

                        for (SharedExpenseParticipant participant : participants) {
                                sharedExpense.addParticipant(participant);
                        }

                        // Validate total shares match total amount
                        validateShares(sharedExpense);

                        SharedExpense savedExpense = sharedExpenseRepository.save(
                                        sharedExpense);
                        log.info(
                                        "Successfully created shared expense with ID: {}",
                                        savedExpense.getId());

                        return savedExpense;
                } catch (Exception e) {
                        log.error(
                                        "Error creating shared expense for user {}: {}",
                                        userId,
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to create shared expense: " + e.getMessage());
                }
        }

        /**
         * Update an existing shared expense
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public SharedExpense updateSharedExpense(
                        Long userId,
                        Long expenseId,
                        SharedExpenseDTO dto) {
                log.info("Updating shared expense {} for user {}", expenseId, userId);
                try {
                        SharedExpense sharedExpense = getSharedExpenseById(
                                        userId,
                                        expenseId);

                        // Only the payer can update the expense
                        if (!sharedExpense.getPaidBy().getId().equals(userId)) {
                                throw new RuntimeException(
                                                "Only the payer can update this shared expense");
                        }

                        // Cannot update if already settled
                        if (sharedExpense.getIsSettled()) {
                                throw new BusinessException("Cannot update a settled expense");
                        }

                        // Update fields
                        if (dto.getDescription() != null) {
                                sharedExpense.setDescription(dto.getDescription());
                        }
                        if (dto.getGroupName() != null) {
                                sharedExpense.setGroupName(dto.getGroupName());
                        }
                        if (dto.getSplitType() != null) {
                                sharedExpense.setSplitType(
                                                SharedExpense.SplitType.valueOf(dto.getSplitType()));
                        }

                        // Update participants if provided
                        if (dto.getParticipants() != null &&
                                        !dto.getParticipants().isEmpty()) {
                                // Remove existing participants
                                sharedExpense.getParticipants().clear();

                                // Calculate and add new participants
                                List<SharedExpenseParticipant> participants = calculateParticipantShares(
                                                dto,
                                                sharedExpense.getTotalAmount(),
                                                sharedExpense);

                                for (SharedExpenseParticipant participant : participants) {
                                        sharedExpense.addParticipant(participant);
                                }

                                validateShares(sharedExpense);
                        }

                        SharedExpense updatedExpense = sharedExpenseRepository.save(
                                        sharedExpense);
                        log.info(
                                        "Successfully updated shared expense with ID: {}",
                                        updatedExpense.getId());

                        return updatedExpense;
                } catch (Exception e) {
                        log.error(
                                        "Error updating shared expense {} for user {}: {}",
                                        expenseId,
                                        userId,
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to update shared expense: " + e.getMessage());
                }
        }

        /**
         * Delete a shared expense
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void deleteSharedExpense(Long userId, Long expenseId) {
                log.info("Deleting shared expense {} for user {}", expenseId, userId);
                try {
                        SharedExpense sharedExpense = getSharedExpenseById(
                                        userId,
                                        expenseId);

                        // Only the payer can delete the expense
                        if (!sharedExpense.getPaidBy().getId().equals(userId)) {
                                throw new RuntimeException(
                                                "Only the payer can delete this shared expense");
                        }

                        // Optionally prevent deletion if any payments have been made
                        boolean anyPaymentsMade = sharedExpense
                                        .getParticipants()
                                        .stream()
                                        .anyMatch(p -> p.getIsPaid());

                        if (anyPaymentsMade) {
                                throw new RuntimeException(
                                                "Cannot delete expense with payments already made");
                        }

                        sharedExpenseRepository.delete(sharedExpense);
                        log.info(
                                        "Successfully deleted shared expense with ID: {}",
                                        expenseId);
                } catch (Exception e) {
                        log.error(
                                        "Error deleting shared expense {} for user {}: {}",
                                        expenseId,
                                        userId,
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to delete shared expense: " + e.getMessage());
                }
        }

        /**
         * Mark a participant's share as paid
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public SharedExpense markParticipantAsPaid(
                        Long userId,
                        Long expenseId,
                        Long participantId) {
                log.info(
                                "Marking participant {} as paid for expense {}",
                                participantId,
                                expenseId);
                try {
                        SharedExpense sharedExpense = getSharedExpenseById(
                                        userId,
                                        expenseId);

                        SharedExpenseParticipant participant = sharedExpense
                                        .getParticipants()
                                        .stream()
                                        .filter(p -> p.getId().equals(participantId))
                                        .findFirst()
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Participant not found with id: " + participantId));

                        if (participant.getIsPaid()) {
                                throw new BusinessException("Participant has already paid");
                        }

                        participant.setIsPaid(true);
                        participant.setPaidAt(LocalDateTime.now());
                        participant.setStatus(
                                        SharedExpenseParticipant.ParticipantStatus.PAID);

                        // Check if all participants have paid
                        boolean allPaid = sharedExpense
                                        .getParticipants()
                                        .stream()
                                        .allMatch(SharedExpenseParticipant::getIsPaid);

                        if (allPaid) {
                                sharedExpense.setIsSettled(true);
                                sharedExpense.setSettledAt(LocalDateTime.now());
                                log.info(
                                                "All participants have paid. Expense {} is now settled.",
                                                expenseId);
                        }

                        SharedExpense savedExpense = sharedExpenseRepository.save(
                                        sharedExpense);
                        log.info(
                                        "Successfully marked participant {} as paid",
                                        participantId);

                        return savedExpense;
                } catch (Exception e) {
                        log.error(
                                        "Error marking participant as paid: {}",
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to mark participant as paid: " + e.getMessage());
                }
        }

        /**
         * Settle the entire shared expense (mark all participants as paid)
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public SharedExpense settleSharedExpense(Long userId, Long expenseId) {
                log.info("Settling shared expense {} for user {}", expenseId, userId);
                try {
                        SharedExpense sharedExpense = getSharedExpenseById(
                                        userId,
                                        expenseId);

                        // Only the payer can settle the expense
                        if (!sharedExpense.getPaidBy().getId().equals(userId)) {
                                throw new RuntimeException(
                                                "Only the payer can settle this shared expense");
                        }

                        if (sharedExpense.getIsSettled()) {
                                throw new BusinessException("Expense is already settled");
                        }

                        // Mark all participants as paid
                        LocalDateTime now = LocalDateTime.now();
                        for (SharedExpenseParticipant participant : sharedExpense.getParticipants()) {
                                if (!participant.getIsPaid()) {
                                        participant.setIsPaid(true);
                                        participant.setPaidAt(now);
                                        participant.setStatus(
                                                        SharedExpenseParticipant.ParticipantStatus.PAID);
                                }
                        }

                        sharedExpense.setIsSettled(true);
                        sharedExpense.setSettledAt(now);

                        SharedExpense savedExpense = sharedExpenseRepository.save(
                                        sharedExpense);
                        log.info(
                                        "Successfully settled shared expense with ID: {}",
                                        expenseId);

                        return savedExpense;
                } catch (Exception e) {
                        log.error(
                                        "Error settling shared expense {}: {}",
                                        expenseId,
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to settle shared expense: " + e.getMessage());
                }
        }

        /**
         * Get summary of amounts owed by/to user
         */
        @Transactional(readOnly = true)
        public SharedExpenseSummary getSharedExpenseSummary(Long userId) {
                log.info("Calculating shared expense summary for user: {}", userId);
                try {
                        User user = userRepository
                                        .findById(userId)
                                        .orElseThrow(() -> new BusinessException("User not found with id: " + userId));

                        BigDecimal totalOwed = sharedExpenseRepository.getTotalAmountOwedByUser(user);
                        BigDecimal totalOwedToYou = sharedExpenseRepository.getTotalAmountOwedToUser(user);
                        Long unsettledCount = sharedExpenseRepository.countUnsettledByUser(
                                        user);

                        SharedExpenseSummary summary = new SharedExpenseSummary();
                        summary.setTotalYouOwe(
                                        totalOwed != null ? totalOwed : BigDecimal.ZERO);
                        summary.setTotalOwedToYou(
                                        totalOwedToYou != null ? totalOwedToYou : BigDecimal.ZERO);
                        summary.setNetBalance(
                                        summary.getTotalOwedToYou().subtract(summary.getTotalYouOwe()));
                        summary.setUnsettledExpensesCount(
                                        unsettledCount != null ? unsettledCount : 0L);

                        log.info(
                                        "Summary for user {}: You owe ${}, Owed to you ${}, Net ${}",
                                        userId,
                                        summary.getTotalYouOwe(),
                                        summary.getTotalOwedToYou(),
                                        summary.getNetBalance());

                        return summary;
                } catch (Exception e) {
                        log.error(
                                        "Error calculating summary for user {}: {}",
                                        userId,
                                        e.getMessage(),
                                        e);
                        throw new RuntimeException(
                                        "Failed to calculate shared expense summary: " + e.getMessage());
                }
        }

        /**
         * Calculate participant shares based on split type
         */
        private List<SharedExpenseParticipant> calculateParticipantShares(
                        SharedExpenseDTO dto,
                        BigDecimal totalAmount,
                        SharedExpense sharedExpense) {
                List<SharedExpenseParticipant> participants = new ArrayList<>();
                SharedExpense.SplitType splitType = SharedExpense.SplitType.valueOf(
                                dto.getSplitType());
                int participantCount = dto.getParticipants().size();

                switch (splitType) {
                        case EQUAL:
                                BigDecimal equalShare = totalAmount.divide(
                                                BigDecimal.valueOf(participantCount),
                                                2,
                                                RoundingMode.HALF_UP);
                                for (SharedExpenseParticipantDTO pDto : dto.getParticipants()) {
                                        participants.add(
                                                        createParticipant(pDto, equalShare, sharedExpense));
                                }
                                break;
                        case PERCENTAGE:
                                // Validate percentages add up to 100
                                BigDecimal totalPercentage = dto
                                                .getParticipants()
                                                .stream()
                                                .map(p -> p.getSharePercentage() != null
                                                                ? p.getSharePercentage()
                                                                : BigDecimal.ZERO)
                                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                                if (totalPercentage.compareTo(BigDecimal.valueOf(100)) != 0) {
                                        throw new BusinessException(
                                                        "Percentages must add up to 100. Current total: " +
                                                                        totalPercentage);
                                }

                                for (SharedExpenseParticipantDTO pDto : dto.getParticipants()) {
                                        if (pDto.getSharePercentage() == null) {
                                                throw new BusinessException(
                                                                "Share percentage is required for participant");
                                        }
                                        BigDecimal shareAmount = totalAmount
                                                        .multiply(pDto.getSharePercentage())
                                                        .divide(
                                                                        BigDecimal.valueOf(100),
                                                                        2,
                                                                        RoundingMode.HALF_UP);
                                        participants.add(
                                                        createParticipant(pDto, shareAmount, sharedExpense));
                                }
                                break;
                        case EXACT_AMOUNT:
                                for (SharedExpenseParticipantDTO pDto : dto.getParticipants()) {
                                        if (pDto.getShareAmount() == null) {
                                                throw new BusinessException(
                                                                "Exact share amount is required for participant");
                                        }
                                        participants.add(
                                                        createParticipant(
                                                                        pDto,
                                                                        pDto.getShareAmount(),
                                                                        sharedExpense));
                                }
                                break;
                        case SHARES:
                                // Calculate total shares
                                Integer totalShares = dto
                                                .getParticipants()
                                                .stream()
                                                .map(p -> p.getShareUnits() != null ? p.getShareUnits() : 0)
                                                .reduce(0, Integer::sum);

                                if (totalShares == 0) {
                                        throw new BusinessException(
                                                        "Total shares must be greater than 0");
                                }

                                BigDecimal perShareAmount = totalAmount.divide(
                                                BigDecimal.valueOf(totalShares),
                                                2,
                                                RoundingMode.HALF_UP);

                                for (SharedExpenseParticipantDTO pDto : dto.getParticipants()) {
                                        if (pDto.getShareUnits() == null) {
                                                throw new BusinessException(
                                                                "Share units are required for participant");
                                        }
                                        BigDecimal shareAmount = perShareAmount.multiply(
                                                        BigDecimal.valueOf(pDto.getShareUnits()));
                                        participants.add(
                                                        createParticipant(pDto, shareAmount, sharedExpense));
                                }
                                break;
                        default:
                                throw new BusinessException(
                                                "Unsupported split type: " + splitType);
                }

                return participants;
        }

        /**
         * Create a participant entity from DTO
         */
        private SharedExpenseParticipant createParticipant(
                        SharedExpenseParticipantDTO pDto,
                        BigDecimal shareAmount,
                        SharedExpense sharedExpense) {
                SharedExpenseParticipant.SharedExpenseParticipantBuilder builder = SharedExpenseParticipant.builder()
                                .shareAmount(shareAmount)
                                .isPaid(false)
                                .status(SharedExpenseParticipant.ParticipantStatus.PENDING)
                                .notes(pDto.getNotes());

                // Set percentage if provided
                if (pDto.getSharePercentage() != null) {
                        builder.sharePercentage(pDto.getSharePercentage());
                }

                // Set units if provided
                if (pDto.getShareUnits() != null) {
                        builder.shareUnits(pDto.getShareUnits());
                }

                // Handle registered user vs external participant
                if (pDto.getUserId() != null) {
                        User user = userRepository
                                        .findById(pDto.getUserId())
                                        .orElseThrow(() -> new BusinessException(
                                                        "Participant user not found with id: " +
                                                                        pDto.getUserId()));
                        builder.user(user);
                } else {
                        if (pDto.getExternalName() == null ||
                                        pDto.getExternalName().trim().isEmpty()) {
                                throw new BusinessException(
                                                "External participant must have a name");
                        }
                        builder.externalParticipantName(pDto.getExternalName());
                        builder.externalParticipantEmail(pDto.getExternalEmail());
                }

                return builder.build();
        }

        /**
         * Validate that participant shares add up to total amount
         */
        private void validateShares(SharedExpense sharedExpense) {
                BigDecimal totalShares = sharedExpense
                                .getParticipants()
                                .stream()
                                .map(SharedExpenseParticipant::getShareAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Allow small rounding differences (up to 1 cent)
                BigDecimal difference = sharedExpense
                                .getTotalAmount()
                                .subtract(totalShares)
                                .abs();
                if (difference.compareTo(BigDecimal.valueOf(0.01)) > 0) {
                        throw new BusinessException(
                                        String.format(
                                                        "Total participant shares (%.2f) do not match expense total (%.2f). Difference: %.2f",
                                                        totalShares,
                                                        sharedExpense.getTotalAmount(),
                                                        difference));
                }
        }

        /**
         * DTO for shared expense summary
         */
        public static class SharedExpenseSummary {

                private BigDecimal totalYouOwe;
                private BigDecimal totalOwedToYou;
                private BigDecimal netBalance;
                private Long unsettledExpensesCount;

                public BigDecimal getTotalYouOwe() {
                        return totalYouOwe;
                }

                public void setTotalYouOwe(BigDecimal totalYouOwe) {
                        this.totalYouOwe = totalYouOwe;
                }

                public BigDecimal getTotalOwedToYou() {
                        return totalOwedToYou;
                }

                public void setTotalOwedToYou(BigDecimal totalOwedToYou) {
                        this.totalOwedToYou = totalOwedToYou;
                }

                public BigDecimal getNetBalance() {
                        return netBalance;
                }

                public void setNetBalance(BigDecimal netBalance) {
                        this.netBalance = netBalance;
                }

                public Long getUnsettledExpensesCount() {
                        return unsettledExpensesCount;
                }

                public void setUnsettledExpensesCount(Long unsettledExpensesCount) {
                        this.unsettledExpensesCount = unsettledExpensesCount;
                }
        }
}
