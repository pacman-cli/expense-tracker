package com.expensetracker.features.wallet;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public List<WalletDTO> getUserWallets(Long userId) {
        return walletRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalletDTO createWallet(Long userId, WalletDTO walletDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = Wallet.builder()
                .name(walletDTO.getName())
                .type(Wallet.WalletType.valueOf(walletDTO.getType()))
                .balance(walletDTO.getBalance())
                .currency(walletDTO.getCurrency() != null ? walletDTO.getCurrency() : "BDT")
                .user(user)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);
        return mapToDTO(savedWallet);
    }

    @Transactional
    public WalletDTO updateWallet(Long userId, Long walletId, WalletDTO walletDTO) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (!wallet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to wallet");
        }

        wallet.setName(walletDTO.getName());
        wallet.setType(Wallet.WalletType.valueOf(walletDTO.getType()));
        // Note: Balance is typically updated via transactions, but allowing manual
        // update for now
        if (walletDTO.getBalance() != null) {
            wallet.setBalance(walletDTO.getBalance());
        }

        return mapToDTO(walletRepository.save(wallet));
    }

    @Transactional
    public void deleteWallet(Long userId, Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (!wallet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to wallet");
        }

        walletRepository.delete(wallet);
    }

    private WalletDTO mapToDTO(Wallet wallet) {
        return WalletDTO.builder()
                .id(wallet.getId())
                .name(wallet.getName())
                .type(wallet.getType().name())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .build();
    }
}
