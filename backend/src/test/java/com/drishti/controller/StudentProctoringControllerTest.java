package com.drishti.controller;

import com.drishti.dto.request.CameraStatusUpdateRequest;
import com.drishti.dto.request.ProctoringEventRequest;
import com.drishti.dto.response.ProctoringEventResponse;
import com.drishti.dto.response.ProctoringSessionResponse;
import com.drishti.entity.CameraStreamStatus;
import com.drishti.entity.EventSeverity;
import com.drishti.entity.EventSource;
import com.drishti.entity.ProctoringEventType;
import com.drishti.entity.ProctoringSessionStatus;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.ProctoringService;
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

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StudentProctoringController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudentProctoringControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProctoringService proctoringService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/student/proctoring/session/{attemptId} - 201 Created")
    void testStartOrGetSession_Success() throws Exception {
        ProctoringSessionResponse res = new ProctoringSessionResponse();
        res.setId("sess-1");
        res.setAttemptId("att-1");
        res.setStatus(ProctoringSessionStatus.ACTIVE);

        when(proctoringService.startOrGetSession("student@example.com", "att-1")).thenReturn(res);

        mockMvc.perform(post("/api/v1/student/proctoring/session/att-1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("sess-1"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/student/proctoring/session/{sessionId}/heartbeat - 200 OK")
    void testRecordHeartbeat_Success() throws Exception {
        mockMvc.perform(post("/api/v1/student/proctoring/session/sess-1/heartbeat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Heartbeat recorded successfully"));

        verify(proctoringService).recordHeartbeat("student@example.com", "sess-1");
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("PUT /api/v1/student/proctoring/session/{sessionId}/camera-status - 200 OK")
    void testUpdateCameraStatus_Success() throws Exception {
        CameraStatusUpdateRequest request = new CameraStatusUpdateRequest(CameraStreamStatus.STREAM_ACTIVE);
        ProctoringSessionResponse res = new ProctoringSessionResponse();
        res.setId("sess-1");
        res.setCameraStatus(CameraStreamStatus.STREAM_ACTIVE);

        when(proctoringService.updateCameraStatus("student@example.com", "sess-1", CameraStreamStatus.STREAM_ACTIVE))
                .thenReturn(res);

        mockMvc.perform(put("/api/v1/student/proctoring/session/sess-1/camera-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.cameraStatus").value("STREAM_ACTIVE"));
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/student/proctoring/session/{sessionId}/events - 200 OK")
    void testIngestEvents_Success() throws Exception {
        ProctoringEventRequest req = new ProctoringEventRequest(
                ProctoringEventType.TAB_VISIBILITY_CHANGED, Instant.now(), "k-1", null);

        ProctoringEventResponse res = new ProctoringEventResponse();
        res.setId("evt-1");
        res.setEventType(ProctoringEventType.TAB_VISIBILITY_CHANGED);
        res.setSeverity(EventSeverity.HIGH);
        res.setSource(EventSource.BROWSER_REPORTED);

        when(proctoringService.ingestEvents(eq("student@example.com"), eq("sess-1"), any()))
                .thenReturn(List.of(res));

        mockMvc.perform(post("/api/v1/student/proctoring/session/sess-1/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(req))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value("evt-1"))
                .andExpect(jsonPath("$.data[0].severity").value("HIGH"));
    }
}
