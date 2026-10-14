package com.drishti.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private boolean success = false;
    private String message;
    private String errorCode;
    private String path;
    private Instant timestamp;
    private Map<String, String> fieldErrors;

    public ErrorResponse() {
        this.timestamp = Instant.now();
    }

    public ErrorResponse(String message, String errorCode, String path) {
        this.success = false;
        this.message = message;
        this.errorCode = errorCode;
        this.path = path;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(String message, String errorCode, String path, Map<String, String> fieldErrors) {
        this.success = false;
        this.message = message;
        this.errorCode = errorCode;
        this.path = path;
        this.timestamp = Instant.now();
        this.fieldErrors = fieldErrors;
    }

    public static ErrorResponse of(String message, String errorCode, String path) {
        return new ErrorResponse(message, errorCode, path);
    }

    public static ErrorResponse of(String message, String errorCode, String path, Map<String, String> fieldErrors) {
        return new ErrorResponse(message, errorCode, path, fieldErrors);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }
}
