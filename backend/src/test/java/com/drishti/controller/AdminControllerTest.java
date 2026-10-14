package com.drishti.controller;

import com.drishti.dto.request.UserStatusUpdateRequest;
import com.drishti.dto.response.AdminDashboardStatsResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.Role;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

    @MockBean
    private com.drishti.service.ProctoringService proctoringService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "admin@drishti.edu", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/dashboard/stats - 200 OK")
    void testGetDashboardStats_Success() throws Exception {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();
        stats.setTotalUsers(50L);
        stats.setTotalExams(10L);
        stats.setTotalAttempts(100L);

        when(adminService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/admin/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(50))
                .andExpect(jsonPath("$.data.totalExams").value(10));
    }

    @Test
    @WithMockUser(username = "admin@drishti.edu", roles = {"ADMIN"})
    @DisplayName("PATCH /api/v1/admin/users/{userId}/status - 200 OK")
    void testUpdateUserStatus_Success() throws Exception {
        UserStatusUpdateRequest request = new UserStatusUpdateRequest(false);
        UserSummaryResponse response = new UserSummaryResponse();
        response.setId("u_1");
        response.setActive(false);

        when(adminService.updateUserStatus(eq("u_1"), anyBoolean())).thenReturn(response);

        mockMvc.perform(patch("/api/v1/admin/users/u_1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }
}
