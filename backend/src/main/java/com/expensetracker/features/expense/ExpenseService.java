package com.expensetracker.features.expense;

import com.expensetracker.features.category.Category;
import com.expensetracker.entity.User;
import com.expensetracker.features.category.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.expensetracker.features.wallet.WalletRepository walletRepository;

    public Page<ExpenseDTO> getAllExpenses(Long userId, Pageable pageable) {
        return expenseRepository.findByUserId(userId, pageable).map(this::convertToDTO);
    }

    @org.springframework.transaction.annotation.Transactional
    public ExpenseDTO createExpense(Long userId, ExpenseDTO expenseDTO) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Category category = null;
        if (expenseDTO.getCategoryId() != null) {
            category = categoryRepository.findById(expenseDTO.getCategoryId()).orElse(null);
        }

        com.expensetracker.features.wallet.Wallet wallet = null;
        if (expenseDTO.getWalletId() != null) {
            wallet = walletRepository.findById(expenseDTO.getWalletId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            if (!wallet.getUser().getId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to wallet");
            }

            // Deduct from wallet
            wallet.setBalance(wallet.getBalance().subtract(expenseDTO.getAmount()));
            walletRepository.save(wallet);
        }

        Expense expense = new Expense();
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());
        expense.setCategory(category);
        expense.setWallet(wallet);
        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }

    @org.springframework.transaction.annotation.Transactional
    public ExpenseDTO updateExpense(Long id, Long userId, ExpenseDTO expenseDTO) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        // Revert old wallet balance if it exists
        if (expense.getWallet() != null) {
            com.expensetracker.features.wallet.Wallet oldWallet = expense.getWallet();
            oldWallet.setBalance(oldWallet.getBalance().add(expense.getAmount()));
            walletRepository.save(oldWallet);
        }

        // Handle new wallet
        com.expensetracker.features.wallet.Wallet newWallet = null;
        if (expenseDTO.getWalletId() != null) {
            newWallet = walletRepository.findById(expenseDTO.getWalletId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            if (!newWallet.getUser().getId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to wallet");
            }

            // Deduct from new wallet
            newWallet.setBalance(newWallet.getBalance().subtract(expenseDTO.getAmount()));
            walletRepository.save(newWallet);
        }

        Category category = null;
        if (expenseDTO.getCategoryId() != null) {
            category = categoryRepository.findById(expenseDTO.getCategoryId()).orElse(null);
        }

        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setDate(expenseDTO.getDate());
        expense.setCategory(category);
        expense.setWallet(newWallet);

        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own expenses");
        }

        // Refund to wallet if applicable
        if (expense.getWallet() != null) {
            com.expensetracker.features.wallet.Wallet wallet = expense.getWallet();
            wallet.setBalance(wallet.getBalance().add(expense.getAmount()));
            walletRepository.save(wallet);
        }

        expenseRepository.delete(expense);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate());
        if (expense.getCategory() != null) {
            dto.setCategoryId(expense.getCategory().getId());
            dto.setCategoryName(expense.getCategory().getName());
        }
        if (expense.getWallet() != null) {
            dto.setWalletId(expense.getWallet().getId());
            dto.setWalletName(expense.getWallet().getName());
        }
        return dto;
    }
}
