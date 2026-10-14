package com.drishti.config;

import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.repository.UserRepository;
import com.drishti.util.EmailNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@Configuration
public class AdminBootstrapConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapConfig.class);

    @Value("${bootstrap.admin.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${bootstrap.admin.email:admin@drishti.com}")
    private String adminEmail;

    @Value("${bootstrap.admin.password:password123}")
    private String adminPassword;

    @Value("${bootstrap.admin.name:System Administrator}")
    private String adminName;

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!bootstrapEnabled) {
                log.debug("Admin bootstrap initialization is disabled");
                return;
            }

            if (adminEmail == null || adminEmail.trim().isEmpty() || adminPassword == null || adminPassword.trim().isEmpty()) {
                log.warn("Admin bootstrap enabled but BOOTSTRAP_ADMIN_EMAIL or BOOTSTRAP_ADMIN_PASSWORD is not provided. Skipping bootstrap.");
                return;
            }

            String normalizedEmail = EmailNormalizer.normalize(adminEmail);

            User existingAdmin = userRepository.findByEmail(normalizedEmail).orElse(null);
            if (existingAdmin != null) {
                existingAdmin.setPasswordHash(passwordEncoder.encode(adminPassword.trim()));
                existingAdmin.setRole(Role.ADMIN);
                existingAdmin.setActive(true);
                existingAdmin.setApproved(true);
                existingAdmin.setUpdatedAt(Instant.now());
                userRepository.save(existingAdmin);
                log.info("Bootstrap admin account verified and updated for email: '{}'", normalizedEmail);
                return;
            }

            User adminUser = new User();
            adminUser.setFullName(adminName != null && !adminName.trim().isEmpty() ? adminName.trim() : "System Administrator");
            adminUser.setEmail(normalizedEmail);
            adminUser.setPasswordHash(passwordEncoder.encode(adminPassword.trim()));
            adminUser.setRole(Role.ADMIN);
            adminUser.setActive(true);
            adminUser.setApproved(true);
            adminUser.setEmailVerified(true);
            adminUser.setCreatedAt(Instant.now());
            adminUser.setUpdatedAt(Instant.now());

            userRepository.save(adminUser);
            log.info("Successfully bootstrapped initial system administrator account for email: '{}'", normalizedEmail);
        };
    }
}
