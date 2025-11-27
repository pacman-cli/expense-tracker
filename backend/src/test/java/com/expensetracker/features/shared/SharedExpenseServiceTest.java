package com.expensetracker.features.shared;

import com.expensetracker.entity.User;
import com.expensetracker.exception.BusinessException;
import com.expensetracker.features.expense.Expense;
import com.expensetracker.features.expense.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SharedExpenseServiceTest {

    @Mock
    private SharedExpenseRepository sharedExpenseRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SharedExpenseService sharedExpenseService;

    private User user;
    private SharedExpense sharedExpense;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        sharedExpense = new SharedExpense();
        sharedExpense.setId(1L);
        sharedExpense.setPaidBy(user);
        sharedExpense.setParticipants(Collections.emptySet());
    }

    @Test
    void getSharedExpenses_ShouldThrowRuntimeException_WhenUnexpectedErrorOccurs() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(sharedExpenseRepository.findUnsettledByUser(user)).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sharedExpenseService.getSharedExpenses(1L);
        });

        assertTrue(exception.getMessage().contains("Failed to fetch shared expenses"));
    }

    @Test
    void getSharedExpenses_ShouldReturnExpenses_WhenSuccessful() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(sharedExpenseRepository.findUnsettledByUser(user)).thenReturn(new ArrayList<>());
        when(sharedExpenseRepository.findSettledByUser(any(User.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(new ArrayList<>()));

        // Act
        List<SharedExpense> result = sharedExpenseService.getSharedExpenses(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
