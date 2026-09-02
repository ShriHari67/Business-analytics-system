package com.businessanalytics.system.service;

import com.businessanalytics.system.model.User;
import com.businessanalytics.system.repository.UserRepository;
import com.businessanalytics.system.security.PasswordEncoderUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoderUtil passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           PasswordEncoderUtil passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed System Users if empty (Zero fake business data seeded)
        if (userRepository.count() == 0) {
            User admin = new User(
                    "admin",
                    "admin@analytics.com",
                    passwordEncoder.encode("admin123"),
                    "System Administrator",
                    "ADMIN"
            );
            userRepository.save(admin);

            User normalUser = new User(
                    "user1",
                    "user1@analytics.com",
                    passwordEncoder.encode("user123"),
                    "Sales Representative",
                    "USER"
            );
            userRepository.save(normalUser);

            System.out.println("✅ Seeded initial system credentials: admin / admin123, user1 / user123");
        }
    }
}
