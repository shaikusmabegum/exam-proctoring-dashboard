package com.drishti.config;

import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapConfigTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminBootstrapConfig config;

    @BeforeEach
    void setUp() {
        config = new AdminBootstrapConfig();
    }

    @Test
    @DisplayName("Should create bootstrap admin when enabled and user does not exist")
    void testBootstrapAdmin_WhenEnabledAndNotExists() throws Exception {
        ReflectionTestUtils.setField(config, "bootstrapEnabled", true);
        ReflectionTestUtils.setField(config, "adminEmail", "admin@drishti.edu");
        ReflectionTestUtils.setField(config, "adminPassword", "AdminSecret123!");
        ReflectionTestUtils.setField(config, "adminName", "Super Admin");

        when(userRepository.findByEmail("admin@drishti.edu")).thenReturn(java.util.Optional.empty());
        when(passwordEncoder.encode("AdminSecret123!")).thenReturn("hashed_admin_pwd");

        CommandLineRunner runner = config.initAdminUser(userRepository, passwordEncoder);
        runner.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedAdmin = captor.getValue();

        assertEquals("Super Admin", savedAdmin.getFullName());
        assertEquals("admin@drishti.edu", savedAdmin.getEmail());
        assertEquals("hashed_admin_pwd", savedAdmin.getPasswordHash());
        assertEquals(Role.ADMIN, savedAdmin.getRole());
        assertTrue(savedAdmin.isActive());
        assertTrue(savedAdmin.isEmailVerified());
    }

    @Test
    @DisplayName("Should skip bootstrap admin when disabled")
    void testBootstrapAdmin_WhenDisabled() throws Exception {
        ReflectionTestUtils.setField(config, "bootstrapEnabled", false);

        CommandLineRunner runner = config.initAdminUser(userRepository, passwordEncoder);
        runner.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should update bootstrap admin when user already exists")
    void testBootstrapAdmin_WhenAlreadyExists() throws Exception {
        ReflectionTestUtils.setField(config, "bootstrapEnabled", true);
        ReflectionTestUtils.setField(config, "adminEmail", "admin@drishti.edu");
        ReflectionTestUtils.setField(config, "adminPassword", "AdminSecret123!");

        User existingUser = new User("Existing Admin", "admin@drishti.edu", "old_hash", Role.ADMIN);
        when(userRepository.findByEmail("admin@drishti.edu")).thenReturn(java.util.Optional.of(existingUser));
        when(passwordEncoder.encode("AdminSecret123!")).thenReturn("hashed_admin_pwd");

        CommandLineRunner runner = config.initAdminUser(userRepository, passwordEncoder);
        runner.run();

        verify(userRepository).save(existingUser);
        assertEquals("hashed_admin_pwd", existingUser.getPasswordHash());
        assertTrue(existingUser.isApproved());
        assertTrue(existingUser.isActive());
    }
}
