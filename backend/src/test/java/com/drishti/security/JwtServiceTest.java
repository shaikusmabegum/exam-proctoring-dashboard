package com.drishti.security;

import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.exception.InvalidTokenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String TEST_SECRET = "test_super_secret_jwt_key_that_is_at_least_256_bits_long_for_hmac_sha256!";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", EXPIRATION_MS);
        jwtService.init();
    }

    @Test
    @DisplayName("Should generate valid JWT token with correct claims and subject")
    void testGenerateAndValidateToken() {
        User user = new User("Alice Student", "alice@example.com", "hashed_pwd", Role.STUDENT);
        user.setId("user123");

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedEmail = jwtService.extractEmail(token);
        assertEquals("alice@example.com", extractedEmail);

        UserPrincipal principal = UserPrincipal.create(user);
        assertTrue(jwtService.isTokenValid(token, principal));
    }

    @Test
    @DisplayName("Should fail initialization if secret is too short")
    void testWeakSecretRejection() {
        JwtService weakService = new JwtService();
        ReflectionTestUtils.setField(weakService, "jwtSecret", "short_secret");
        ReflectionTestUtils.setField(weakService, "jwtExpirationMs", EXPIRATION_MS);

        assertThrows(IllegalStateException.class, weakService::init);
    }

    @Test
    @DisplayName("Should throw InvalidTokenException for malformed token")
    void testMalformedToken() {
        assertThrows(InvalidTokenException.class, () -> jwtService.extractAllClaims("invalid.token.structure"));
    }

    @Test
    @DisplayName("Should invalidate token for mismatched user")
    void testMismatchedUser() {
        User user1 = new User("Alice", "alice@example.com", "pwd", Role.STUDENT);
        User user2 = new User("Bob", "bob@example.com", "pwd", Role.STUDENT);

        String token = jwtService.generateToken(user1);
        UserPrincipal principal2 = UserPrincipal.create(user2);

        assertFalse(jwtService.isTokenValid(token, principal2));
    }
}
