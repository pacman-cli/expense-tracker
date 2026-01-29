package com.expensetracker.features.income;

import com.expensetracker.entity.User;
import com.expensetracker.features.wallet.Wallet;
import com.expensetracker.features.wallet.WalletRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public List<IncomeDTO> getUserIncomes(Long userId) {
        return incomeRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncomeDTO createIncome(Long userId, IncomeDTO incomeDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = null;
        if (incomeDTO.getWalletId() != null) {
            wallet = walletRepository.findById(incomeDTO.getWalletId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            // Update wallet balance
            wallet.setBalance(wallet.getBalance().add(incomeDTO.getAmount()));
            walletRepository.save(wallet);
        }

        Income income = Income.builder()
                .source(incomeDTO.getSource())
                .amount(incomeDTO.getAmount())
                .date(incomeDTO.getDate())
                .description(incomeDTO.getDescription())
                .wallet(wallet)
                .user(user)
                .build();

        Income savedIncome = incomeRepository.save(income);
        return mapToDTO(savedIncome);
    }

    @Transactional
    public void deleteIncome(Long userId, Long incomeId) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (!income.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to income");
        }

        // Revert wallet balance
        if (income.getWallet() != null) {
            Wallet wallet = income.getWallet();
            wallet.setBalance(wallet.getBalance().subtract(income.getAmount()));
            walletRepository.save(wallet);
        }

        incomeRepository.delete(income);
    }

    private IncomeDTO mapToDTO(Income income) {
        return IncomeDTO.builder()
                .id(income.getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .date(income.getDate())
                .description(income.getDescription())
                .walletId(income.getWallet() != null ? income.getWallet().getId() : null)
                .walletName(income.getWallet() != null ? income.getWallet().getName() : null)
                .build();
    }
}
