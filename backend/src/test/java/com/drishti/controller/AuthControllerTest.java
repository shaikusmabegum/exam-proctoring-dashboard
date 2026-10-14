package com.drishti.controller;

import com.drishti.dto.request.LoginRequest;
import com.drishti.dto.request.RegisterRequest;
import com.drishti.dto.response.AuthResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.Role;
import com.drishti.exception.DuplicateResourceException;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Unit test for controller and advice mapping
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /api/v1/auth/register - Success 201")
    void testRegister_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("Test Student", "student@example.com", "Password123!");
        UserSummaryResponse response = new UserSummaryResponse(
                "user1", "Test Student", "student@example.com", Role.STUDENT, true, false, Instant.now(), null
        );

        when(authService.registerStudent(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Student registered successfully"))
                .andExpect(jsonPath("$.data.email").value("student@example.com"))
                .andExpect(jsonPath("$.data.role").value("STUDENT"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Invalid input 400 with field errors")
    void testRegister_ValidationError() throws Exception {
        RegisterRequest request = new RegisterRequest("", "not-an-email", "short");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Duplicate Email 409")
    void testRegister_DuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest("Test Student", "student@example.com", "Password123!");
        when(authService.registerStudent(any(RegisterRequest.class)))
                .thenThrow(new DuplicateResourceException("An account with this email already exists"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("DUPLICATE_RESOURCE"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Success 200")
    void testLogin_Success() throws Exception {
        LoginRequest request = new LoginRequest("student@example.com", "Password123!");
        UserSummaryResponse userSummary = new UserSummaryResponse(
                "user1", "Test Student", "student@example.com", Role.STUDENT, true, false, Instant.now(), Instant.now()
        );
        AuthResponse authResponse = new AuthResponse("mock.jwt.token", 86400000L, userSummary);

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("student@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Bad Credentials 401 generic error")
    void testLogin_BadCredentials() throws Exception {
        LoginRequest request = new LoginRequest("student@example.com", "WrongPassword");
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("GET /api/v1/auth/me - Authenticated user 200")
    void testGetMe_Success() throws Exception {
        UserSummaryResponse userSummary = new UserSummaryResponse(
                "user1", "Test Student", "student@example.com", Role.STUDENT, true, false, Instant.now(), null
        );
        when(authService.getCurrentUser("student@example.com")).thenReturn(userSummary);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("student@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register/lecturer - Success 201")
    void testRegisterLecturer_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("Prof Smith", "lecturer@example.com", "Password123!");
        UserSummaryResponse response = new UserSummaryResponse(
                "lec1", "Prof Smith", "lecturer@example.com", Role.LECTURER, false, false, false, Instant.now(), null
        );

        when(authService.registerLecturer(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register/lecturer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("lecturer@example.com"))
                .andExpect(jsonPath("$.data.role").value("LECTURER"))
                .andExpect(jsonPath("$.data.approved").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout - 200 OK")
    void testLogout_Success() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
