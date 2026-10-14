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
import com.drishti.util.EmailNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public UserSummaryResponse registerStudent(RegisterRequest request) {
        String normalizedEmail = EmailNormalizer.normalize(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration attempt rejected: email already registered");
            throw new DuplicateResourceException("An account with email '" + normalizedEmail + "' already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hashedPassword);
        user.setRole(Role.STUDENT); // Server strictly assigns STUDENT
        user.setActive(true);
        user.setEmailVerified(false);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);
        log.info("Student account successfully registered for user ID: {}", savedUser.getId());

        return UserSummaryResponse.fromEntity(savedUser);
    }

    @Override
    public UserSummaryResponse registerLecturer(RegisterRequest request) {
        String normalizedEmail = EmailNormalizer.normalize(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Lecturer registration attempt rejected: email already registered");
            throw new DuplicateResourceException("An account with email '" + normalizedEmail + "' already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hashedPassword);
        user.setRole(Role.LECTURER);
        user.setActive(false); // Inactive until approved by Admin
        user.setApproved(false); // Requires Admin approval
        user.setEmailVerified(false);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);
        log.info("Lecturer account registered (pending admin approval) for user ID: {}", savedUser.getId());

        return UserSummaryResponse.fromEntity(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = EmailNormalizer.normalize(request.getEmail());

        // Authenticate via Spring Security AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);

        String token = jwtService.generateToken(updatedUser);
        log.info("User successfully logged in with role: [{}]", updatedUser.getRole());

        return new AuthResponse(
                token,
                jwtService.getJwtExpirationMs(),
                UserSummaryResponse.fromEntity(updatedUser)
        );
    }

    @Override
    public UserSummaryResponse getCurrentUser(String email) {
        String normalizedEmail = EmailNormalizer.normalize(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for email: " + normalizedEmail));

        return UserSummaryResponse.fromEntity(user);
    }

    @Override
    public void logout(String email) {
        String normalizedEmail = EmailNormalizer.normalize(email);
        log.info("User requested logout: {}", normalizedEmail);
        // Stateless JWT logout - client should discard the token from client-side storage
    }
}
