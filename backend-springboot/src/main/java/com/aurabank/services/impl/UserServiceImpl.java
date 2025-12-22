package com.aurabank.services.impl;

import com.aurabank.dto.SignupRequest;
import com.aurabank.models.User;
import com.aurabank.repositories.UserRepository;
import com.aurabank.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public User signup(SignupRequest signupRequest) throws Exception {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new Exception("Email already registered");
        }
        
        // Validate password match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new Exception("Passwords do not match");
        }
        
        // Create new user
        String accountNumber = generateAccountNumber();
        User user = User.builder()
                .firstName(signupRequest.getFirstName())
                .lastName(signupRequest.getLastName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .phoneNumber(signupRequest.getPhoneNumber())
                .accountNumber(accountNumber)
                .accountType(signupRequest.getAccountType())
                .balance(0.0)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return userRepository.save(user);
    }
    
    @Override
    public User findByEmail(String email) throws Exception {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found with email: " + email));
    }
    
    @Override
    public User findById(String id) throws Exception {
        return userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found with id: " + id));
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    private String generateAccountNumber() {
        // Generate unique account number
        return "AURA" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
