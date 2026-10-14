package com.drishti.security;

import com.drishti.config.CorsConfig;
import com.drishti.config.SecurityConfig;
import com.drishti.controller.AuthController;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, CorsConfig.class, JwtService.class, JwtAuthenticationFilter.class,
        DelegatedAuthenticationEntryPoint.class, DelegatedAccessDeniedHandler.class})
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private AuthService authService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private static final String TEST_SECRET = "production_grade_secret_key_minimum_256_bits_for_testing_purposes_only!";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L);
        jwtService.init();
    }

    @Test
    @DisplayName("GET /api/v1/auth/me without token should return 401 Unauthorized")
    void testGetMe_UnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me with valid Bearer token should return 200 OK")
    void testGetMe_AuthorizedWithToken() throws Exception {
        User user = new User("John Student", "john@example.com", "hashed_pwd", Role.STUDENT);
        user.setId("usr_1");
        UserDetails userDetails = UserPrincipal.create(user);

        when(userDetailsService.loadUserByUsername("john@example.com")).thenReturn(userDetails);

        String token = jwtService.generateToken(user);

        UserSummaryResponse summary = new UserSummaryResponse(
                "usr_1", "John Student", "john@example.com", Role.STUDENT, true, false, Instant.now(), null
        );
        when(authService.getCurrentUser("john@example.com")).thenReturn(summary);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("john@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should be publicly accessible without token")
    void testRegister_PublicAccess() throws Exception {
        UserSummaryResponse response = new UserSummaryResponse(
                "usr_2", "New Student", "newstudent@example.com", Role.STUDENT, true, false, Instant.now(), null
        );
        when(authService.registerStudent(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"New Student\",\"email\":\"newstudent@example.com\",\"password\":\"SecurePassword123!\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
}
