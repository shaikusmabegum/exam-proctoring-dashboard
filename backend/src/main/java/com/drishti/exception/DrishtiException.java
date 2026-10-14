package com.drishti.exception;

public class DrishtiException extends RuntimeException {

    public DrishtiException(String message) {
        super(message);
    }

    public DrishtiException(String message, Throwable cause) {
        super(message, cause);
    }
}
