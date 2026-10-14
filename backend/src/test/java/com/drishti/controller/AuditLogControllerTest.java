package com.drishti.controller;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.response.AuditLogResponse;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.AuditLogService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuditLogController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuditLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditLogService auditLogService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/audit-logs - 200 OK")
    void testGetAuditLogs_Success() throws Exception {
        AuditLogResponse res = new AuditLogResponse();
        res.setId("log-1");
        res.setActorEmail("admin@example.com");
        res.setAction("USER_STATUS_CHANGE");

        PageResponse<AuditLogResponse> pageRes = PageResponse.fromPage(
                new PageImpl<>(List.of(res)), List.of(res));

        when(auditLogService.getAuditLogs(any(), any(), any(), any())).thenReturn(pageRes);

        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value("log-1"))
                .andExpect(jsonPath("$.data.content[0].action").value("USER_STATUS_CHANGE"));
    }
}
