package com.drishti.security.ratelimit;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    /**
     * Checks if a request for a given key is allowed under rate limiting rules.
     *
     * @param key Unique key (e.g. "heartbeat:" + sessionId or "events:" + sessionId)
     * @param maxTokens Capacity of the bucket
     * @param refillRatePerMinute Tokens added per minute
     * @return true if permitted, false if rate limited
     */
    public boolean tryAcquire(String key, int maxTokens, double refillRatePerMinute) {
        TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(maxTokens, refillRatePerMinute));
        return bucket.tryConsume();
    }

    private static class TokenBucket {
        private final int capacity;
        private final double tokensPerSecond;
        private double availableTokens;
        private Instant lastRefillTimestamp;

        public TokenBucket(int capacity, double refillRatePerMinute) {
            this.capacity = capacity;
            this.tokensPerSecond = refillRatePerMinute / 60.0;
            this.availableTokens = capacity;
            this.lastRefillTimestamp = Instant.now();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (availableTokens >= 1.0) {
                availableTokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            Instant now = Instant.now();
            long millisPassed = java.time.Duration.between(lastRefillTimestamp, now).toMillis();
            if (millisPassed > 0) {
                double tokensToAdd = (millisPassed / 1000.0) * tokensPerSecond;
                availableTokens = Math.min(capacity, availableTokens + tokensToAdd);
                lastRefillTimestamp = now;
            }
        }
    }
}
