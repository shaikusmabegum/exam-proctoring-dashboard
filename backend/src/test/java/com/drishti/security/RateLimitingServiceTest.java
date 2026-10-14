package com.drishti.security;

import com.drishti.security.ratelimit.RateLimitingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitingServiceTest {

    private RateLimitingService rateLimitingService;

    @BeforeEach
    void setUp() {
        rateLimitingService = new RateLimitingService();
    }

    @Test
    @DisplayName("tryAcquire permits calls up to capacity and rejects subsequent rapid calls")
    void tryAcquire_LimitsBurstExceedingCapacity() {
        String key = "test:client:1";
        int capacity = 5;
        double refillPerMinute = 60.0; // 1 token per sec

        // Consume all 5 tokens
        for (int i = 0; i < capacity; i++) {
            assertTrue(rateLimitingService.tryAcquire(key, capacity, refillPerMinute),
                    "Request " + i + " should be allowed");
        }

        // 6th request immediately after should be blocked
        assertFalse(rateLimitingService.tryAcquire(key, capacity, refillPerMinute),
                "Request exceeding capacity should be rejected");
    }

    @Test
    @DisplayName("tryAcquire tracks distinct keys independently")
    void tryAcquire_DistinctKeysIndependent() {
        String keyA = "client:A";
        String keyB = "client:B";

        // Exhaust client A
        for (int i = 0; i < 2; i++) {
            assertTrue(rateLimitingService.tryAcquire(keyA, 2, 60.0));
        }
        assertFalse(rateLimitingService.tryAcquire(keyA, 2, 60.0));

        // Client B must still have full tokens
        assertTrue(rateLimitingService.tryAcquire(keyB, 2, 60.0));
        assertTrue(rateLimitingService.tryAcquire(keyB, 2, 60.0));
    }
}
