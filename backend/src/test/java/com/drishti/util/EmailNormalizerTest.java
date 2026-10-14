package com.drishti.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailNormalizerTest {

    @Test
    @DisplayName("Should normalize email by trimming and lowercasing")
    void testNormalizeEmail() {
        assertEquals("user@example.com", EmailNormalizer.normalize("  User@Example.COM  "));
        assertEquals("test.student@drishti.edu", EmailNormalizer.normalize("Test.Student@Drishti.EDU"));
        assertNull(EmailNormalizer.normalize(null));
    }
}
