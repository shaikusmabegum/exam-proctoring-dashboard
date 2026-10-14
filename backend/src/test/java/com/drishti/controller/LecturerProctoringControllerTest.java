package com.drishti.controller;

import com.drishti.dto.request.ReviewUpdateRequest;
import com.drishti.dto.response.ProctoringReviewResponse;
import com.drishti.dto.response.ProctoringSummaryResponse;
import com.drishti.entity.EventSeverity;
import com.drishti.entity.ProctoringReviewStatus;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.ProctoringService;
import com.drishti.service.sse.LecturerMonitoringEventPublisher;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LecturerProctoringController.class)
@AutoConfigureMockMvc(addFilters = false)
class LecturerProctoringControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProctoringService proctoringService;

    @MockBean
    private LecturerMonitoringEventPublisher eventPublisher;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "lecturer@example.com", roles = {"LECTURER"})
    @DisplayName("GET /api/v1/lecturer/proctoring/exams/{examId}/summary - 200 OK")
    void testGetExamProctoringSummary_Success() throws Exception {
        ProctoringSummaryResponse summary = new ProctoringSummaryResponse();
        summary.setExamId("exam-1");
        summary.setTotalSessions(25);
        summary.setActiveSessions(12);
        summary.setOpenReviews(3);

        when(proctoringService.getLecturerExamProctoringSummary("lecturer@example.com", "exam-1"))
                .thenReturn(summary);

        mockMvc.perform(get("/api/v1/lecturer/proctoring/exams/exam-1/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.examId").value("exam-1"))
                .andExpect(jsonPath("$.data.totalSessions").value(25))
                .andExpect(jsonPath("$.data.activeSessions").value(12))
                .andExpect(jsonPath("$.data.openReviews").value(3));
    }

    @Test
    @WithMockUser(username = "lecturer@example.com", roles = {"LECTURER"})
    @DisplayName("PUT /api/v1/lecturer/proctoring/reviews/{reviewId} - 200 OK")
    void testUpdateReview_Success() throws Exception {
        ReviewUpdateRequest request = new ReviewUpdateRequest(
                ProctoringReviewStatus.CONFIRMED,
                "Confirmed multiple faces visible",
                "Clear video and snapshot evidence"
        );

        ProctoringReviewResponse res = new ProctoringReviewResponse();
        res.setId("rev-1");
        res.setStatus(ProctoringReviewStatus.CONFIRMED);
        res.setSeverity(EventSeverity.CRITICAL);
        res.setReviewerEmail("lecturer@example.com");

        when(proctoringService.updateReview(eq("lecturer@example.com"), eq("rev-1"), any(ReviewUpdateRequest.class)))
                .thenReturn(res);

        mockMvc.perform(put("/api/v1/lecturer/proctoring/reviews/rev-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("rev-1"))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser(username = "lecturer@example.com", roles = {"LECTURER"})
    @DisplayName("GET /api/v1/lecturer/proctoring/exams/{examId}/stream - Subscribes SSE Emitter")
    void testStreamProctoringEvents_Success() throws Exception {
        when(proctoringService.getLecturerExamProctoringSummary("lecturer@example.com", "exam-1"))
                .thenReturn(new ProctoringSummaryResponse());
        when(eventPublisher.subscribe("exam-1")).thenReturn(new SseEmitter(1000L));

        mockMvc.perform(get("/api/v1/lecturer/proctoring/exams/exam-1/stream")
                        .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
                .andExpect(status().isOk());

        verify(eventPublisher).subscribe("exam-1");
    }
}
