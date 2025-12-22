package com.aurabank.repositories;

import com.aurabank.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByAccountNumber(String accountNumber);
    boolean existsByEmail(String email);
}
