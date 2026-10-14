package com.drishti.exception;

public class RateLimitExceededException extends DrishtiException {

    public RateLimitExceededException(String message) {
        super(message);
    }
}
