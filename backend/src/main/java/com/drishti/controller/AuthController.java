package com.drishti.controller;

import com.drishti.dto.request.LoginRequest;
import com.drishti.dto.request.RegisterRequest;
import com.drishti.dto.response.ApiResponse;
import com.drishti.dto.response.AuthResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.security.SecurityUtils;
import com.drishti.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, profile retrieval and logout")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new student account", description = "Public endpoint to register a student. Assigned role is strictly STUDENT.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Student registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error on input fields"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already registered")
    })
    public ResponseEntity<ApiResponse<UserSummaryResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserSummaryResponse response = authService.registerStudent(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student registered successfully", response));
    }

    @PostMapping("/register/lecturer")
    @Operation(summary = "Register a new lecturer account", description = "Public endpoint to register a lecturer. Account requires administrator approval before login.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Lecturer registered successfully (pending approval)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error on input fields"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already registered")
    })
    public ResponseEntity<ApiResponse<UserSummaryResponse>> registerLecturer(@Valid @RequestBody RegisterRequest request) {
        UserSummaryResponse response = authService.registerLecturer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lecturer account registered successfully. Pending administrator approval.", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT token", description = "Authenticates user credentials against BCrypt hash and returns signed JWT access token.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User authenticated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error on request body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid email or password")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves profile and role for the verified identity in the security context.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User profile not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in security context"));

        UserSummaryResponse userProfile = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userProfile));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out user session", description = "Stateless logout confirmation. Client must discard the JWT access token.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful")
    })
    public ResponseEntity<ApiResponse<Void>> logout() {
        SecurityUtils.getCurrentUserEmail().ifPresent(authService::logout);
        return ResponseEntity.ok(ApiResponse.successMessage("Logged out successfully. Please discard the access token."));
    }
}
