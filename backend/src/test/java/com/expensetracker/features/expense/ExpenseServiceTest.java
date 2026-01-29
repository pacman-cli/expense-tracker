package com.expensetracker.features.expense;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.expensetracker.entity.User;
import com.expensetracker.exception.BusinessException;
import com.expensetracker.features.category.Category;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.features.wallet.Wallet;
import com.expensetracker.features.wallet.WalletRepository;
import com.expensetracker.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

  @Mock
  private ExpenseRepository expenseRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private CategoryRepository categoryRepository;

  @Mock
  private WalletRepository walletRepository;

  @InjectMocks
  private ExpenseService expenseService;

  private User user;
  private Wallet wallet;
  private Category category;
  private ExpenseDTO expenseDTO;

  @BeforeEach
  void setUp() {
    user = new User();
    user.setId(1L);
    user.setEmail("test@test.com");

    wallet = new Wallet();
    wallet.setId(1L);
    wallet.setName("Test Wallet");
    wallet.setBalance(new BigDecimal("1000.00"));
    wallet.setUser(user);

    category = new Category();
    category.setId(1L);
    category.setName("Food");

    expenseDTO = new ExpenseDTO();
    expenseDTO.setDescription("Lunch");
    expenseDTO.setAmount(new BigDecimal("50.00"));
    expenseDTO.setDate(LocalDate.now());
    expenseDTO.setWalletId(1L);
    expenseDTO.setCategoryId(1L);
  }

  @Test
  void createExpense_Successful() {
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(walletRepository.findById(1L)).thenReturn(Optional.of(wallet));
    when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
    when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

    ExpenseDTO result = expenseService.createExpense(1L, expenseDTO);

    assertNotNull(result);
    assertEquals(new BigDecimal("950.00"), wallet.getBalance());
    verify(walletRepository, times(1)).save(wallet);
    verify(expenseRepository, times(1)).save(any(Expense.class));
  }

  @Test
  void createExpense_InsufficientBalance() {
    expenseDTO.setAmount(new BigDecimal("2000.00"));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
    when(walletRepository.findById(1L)).thenReturn(Optional.of(wallet));

    assertThrows(BusinessException.class, () -> {
      expenseService.createExpense(1L, expenseDTO);
    });

    verify(expenseRepository, never()).save(any());
  }

  @Test
  void deleteExpense_RefundsWallet() {
    Expense expense = new Expense();
    expense.setId(1L);
    expense.setAmount(new BigDecimal("50.00"));
    expense.setWallet(wallet);
    expense.setUser(user);

    when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

    expenseService.deleteExpense(1L, 1L);

    assertEquals(new BigDecimal("1050.00"), wallet.getBalance());
    verify(walletRepository, times(1)).save(wallet);
    verify(expenseRepository, times(1)).delete(expense);
  }

  @Test
  void updateExpense_Successful() {
    Expense existingExpense = new Expense();
    existingExpense.setId(1L);
    existingExpense.setAmount(new BigDecimal("50.00"));
    existingExpense.setWallet(wallet);
    existingExpense.setUser(user);

    when(expenseRepository.findById(1L)).thenReturn(Optional.of(existingExpense));
    when(walletRepository.findById(1L)).thenReturn(Optional.of(wallet));
    when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
    when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

    expenseDTO.setAmount(new BigDecimal("60.00"));
    ExpenseDTO result = expenseService.updateExpense(1L, 1L, expenseDTO);

    assertNotNull(result);
    // Old amount (50) refunded, new amount (60) deducted. 1000 + 50 - 60 = 990
    assertEquals(new BigDecimal("990.00"), wallet.getBalance());
    verify(walletRepository, times(2)).save(wallet); // Once for refund, once for deduction
    verify(expenseRepository, times(1)).save(any(Expense.class));
  }
}
