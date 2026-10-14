package com.drishti.service;

import com.drishti.dto.request.LoginRequest;
import com.drishti.dto.request.RegisterRequest;
import com.drishti.dto.response.AuthResponse;
import com.drishti.dto.response.UserSummaryResponse;

public interface AuthService {

    /**
     * Registers a new student account.
     *
     * @param request Validated registration request
     * @return Safe user summary response
     */
    UserSummaryResponse registerStudent(RegisterRequest request);

    /**
     * Registers a new lecturer account pending administrator approval.
     *
     * @param request Validated registration request
     * @return Safe user summary response
     */
    UserSummaryResponse registerLecturer(RegisterRequest request);

    /**
     * Authenticates a user and returns a signed JWT access token and user profile.
     *
     * @param request Validated login request
     * @return Authentication response with JWT token
     */
    AuthResponse login(LoginRequest request);

    /**
     * Retrieves the profile of the currently authenticated user by email.
     *
     * @param email User email
     * @return Safe user summary response
     */
    UserSummaryResponse getCurrentUser(String email);

    /**
     * Performs a stateless logout for the specified user.
     *
     * @param email User email
     */
    void logout(String email);
}
