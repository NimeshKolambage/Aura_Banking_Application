package com.aurabank.services;

import com.aurabank.dto.SignupRequest;
import com.aurabank.models.User;

public interface UserService {
    User signup(SignupRequest signupRequest) throws Exception;
    User findByEmail(String email) throws Exception;
    User findById(String id) throws Exception;
    boolean existsByEmail(String email);
}
