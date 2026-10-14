package com.drishti.service;

import com.drishti.dto.request.LoginRequest;
import com.drishti.dto.request.RegisterRequest;
import com.drishti.dto.response.AuthResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.exception.DuplicateResourceException;
import com.drishti.exception.ResourceNotFoundException;
import com.drishti.repository.UserRepository;
import com.drishti.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, passwordEncoder, authenticationManager, jwtService);
    }

    @Test
    @DisplayName("Should successfully register student with BCrypt hashed password and STUDENT role")
    void testRegisterStudent_Success() {
        RegisterRequest request = new RegisterRequest("Jane Student", " Jane.Student@Example.COM ", "SecureP@ss123");

        when(userRepository.existsByEmail("jane.student@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecureP@ss123")).thenReturn("bcrypt_hashed_password");

        User savedUser = new User("Jane Student", "jane.student@example.com", "bcrypt_hashed_password", Role.STUDENT);
        savedUser.setId("usr_123");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserSummaryResponse response = authService.registerStudent(request);

        assertNotNull(response);
        assertEquals("usr_123", response.getId());
        assertEquals("Jane Student", response.getFullName());
        assertEquals("jane.student@example.com", response.getEmail());
        assertEquals(Role.STUDENT, response.getRole());
        assertTrue(response.isActive());
        assertFalse(response.isEmailVerified());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User captured = userCaptor.getValue();
        assertEquals(Role.STUDENT, captured.getRole());
        assertEquals("bcrypt_hashed_password", captured.getPasswordHash());
        assertEquals("jane.student@example.com", captured.getEmail());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when registering existing email")
    void testRegisterStudent_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Jane Student", "existing@example.com", "SecureP@ss123");
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.registerStudent(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login, update lastLoginAt, and return AuthResponse")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("jane@example.com", "SecureP@ss123");
        User user = new User("Jane", "jane@example.com", "hashed_pwd", Role.STUDENT);
        user.setId("usr_123");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("signed.jwt.token");
        when(jwtService.getJwtExpirationMs()).thenReturn(86400000L);

        AuthResponse authResponse = authService.login(request);

        assertNotNull(authResponse);
        assertEquals("signed.jwt.token", authResponse.getAccessToken());
        assertEquals("Bearer", authResponse.getTokenType());
        assertEquals(86400000L, authResponse.getExpiresInMs());
        assertEquals("jane@example.com", authResponse.getUser().getEmail());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).save(user);
        assertNotNull(user.getLastLoginAt());
    }

    @Test
    @DisplayName("Should propagate BadCredentialsException when password is invalid")
    void testLogin_BadCredentials() {
        LoginRequest request = new LoginRequest("jane@example.com", "WrongPassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Should return user summary for getCurrentUser")
    void testGetCurrentUser_Success() {
        User user = new User("Jane", "jane@example.com", "hashed_pwd", Role.STUDENT);
        user.setId("usr_123");
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        UserSummaryResponse response = authService.getCurrentUser("jane@example.com");

        assertNotNull(response);
        assertEquals("jane@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user profile is not found")
    void testGetCurrentUser_NotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUser("notfound@example.com"));
    }

    @Test
    @DisplayName("Should successfully register lecturer with LECTURER role and pending approval (active=false, approved=false)")
    void testRegisterLecturer_Success() {
        RegisterRequest request = new RegisterRequest("Dr. Smith", "smith@university.edu", "Password123!");

        when(userRepository.existsByEmail("smith@university.edu")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed_pwd");

        User savedUser = new User();
        savedUser.setId("lec_1");
        savedUser.setFullName("Dr. Smith");
        savedUser.setEmail("smith@university.edu");
        savedUser.setRole(Role.LECTURER);
        savedUser.setActive(false);
        savedUser.setApproved(false);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserSummaryResponse response = authService.registerLecturer(request);

        assertNotNull(response);
        assertEquals("Dr. Smith", response.getFullName());
        assertEquals("smith@university.edu", response.getEmail());
        assertEquals(Role.LECTURER, response.getRole());
        assertFalse(response.isActive());
        assertFalse(response.isApproved());
    }
}
