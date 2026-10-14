package com.drishti.exception;

import com.drishti.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/v1/test");
    }

    @Test
    @DisplayName("Should handle DuplicateResourceException with 409 Conflict")
    void testHandleDuplicateResourceException() {
        DuplicateResourceException ex = new DuplicateResourceException("Account already exists");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDuplicateResource(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("DUPLICATE_RESOURCE", response.getBody().getErrorCode());
        assertEquals("Account already exists", response.getBody().getMessage());
        assertEquals("/api/v1/test", response.getBody().getPath());
    }

    @Test
    @DisplayName("Should handle BadCredentialsException with 401 Unauthorized generic message")
    void testHandleBadCredentialsException() {
        BadCredentialsException ex = new BadCredentialsException("Internal bad credentials info");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthenticationFailure(ex, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UNAUTHORIZED", response.getBody().getErrorCode());
        assertEquals("Invalid email or password", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should handle AccessDeniedException with 403 Forbidden")
    void testHandleAccessDeniedException() {
        AccessDeniedException ex = new AccessDeniedException("Access denied");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAccessDenied(ex, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("FORBIDDEN", response.getBody().getErrorCode());
    }

    @Test
    @DisplayName("Should handle ResourceNotFoundException with 404 Not Found")
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("User not found");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFound(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("RESOURCE_NOT_FOUND", response.getBody().getErrorCode());
        assertEquals("User not found", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should handle IllegalStateException and IllegalArgumentException with 400 Bad Request")
    void testHandleIllegalArgumentAndState() {
        IllegalStateException ex = new IllegalStateException("Passing marks (40.0) cannot exceed total exam marks (1.0)");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgumentAndState(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("BAD_REQUEST", response.getBody().getErrorCode());
        assertEquals("Passing marks (40.0) cannot exceed total exam marks (1.0)", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should handle unhandled generic exceptions with 500 and safe message")
    void testHandleGenericException() {
        RuntimeException ex = new RuntimeException("Sensitive database connection timeout details");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(ex, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().getErrorCode());
        assertEquals("An unexpected internal error occurred. Please try again later.", response.getBody().getMessage());
        assertFalse(response.getBody().getMessage().contains("Sensitive"));
    }
}
