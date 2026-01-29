package com.expensetracker.features.wallet;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expensetracker.service.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<List<WalletDTO>> getUserWallets(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(walletService.getUserWallets(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<WalletDTO> createWallet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody WalletDTO walletDTO) {
        return ResponseEntity.ok(walletService.createWallet(userDetails.getId(), walletDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WalletDTO> updateWallet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody WalletDTO walletDTO) {
        return ResponseEntity.ok(walletService.updateWallet(userDetails.getId(), id, walletDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWallet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        walletService.deleteWallet(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }
}
