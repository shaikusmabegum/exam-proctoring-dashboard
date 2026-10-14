package com.drishti.controller;

import com.drishti.dto.request.ExamCreateRequest;
import com.drishti.dto.response.ExamResponse;
import com.drishti.entity.ExamStatus;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.LecturerExamService;
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
import java.time.temporal.ChronoUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LecturerExamController.class)
@AutoConfigureMockMvc(addFilters = false)
class LecturerExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LecturerExamService lecturerExamService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "lecturer@example.com", roles = {"LECTURER"})
    @DisplayName("POST /api/v1/lecturer/exams - Create exam 201 Created")
    void testCreateExam_Success() throws Exception {
        ExamCreateRequest request = new ExamCreateRequest();
        request.setTitle("Midterm Data Structures");
        request.setCourseName("CS201");
        request.setDurationMinutes(90);
        request.setPassingMarks(50.0);
        request.setStartTime(Instant.now().plus(1, ChronoUnit.DAYS));
        request.setEndTime(Instant.now().plus(2, ChronoUnit.DAYS));

        ExamResponse response = new ExamResponse();
        response.setId("exam_123");
        response.setTitle("Midterm Data Structures");
        response.setStatus(ExamStatus.DRAFT);

        when(lecturerExamService.createExam(eq("lecturer@example.com"), any(ExamCreateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/lecturer/exams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("exam_123"))
                .andExpect(jsonPath("$.data.title").value("Midterm Data Structures"));
    }

    @Test
    @WithMockUser(username = "lecturer@example.com", roles = {"LECTURER"})
    @DisplayName("POST /api/v1/lecturer/exams/{examId}/publish - Publish exam 200 OK")
    void testPublishExam_Success() throws Exception {
        ExamResponse response = new ExamResponse();
        response.setId("exam_123");
        response.setStatus(ExamStatus.PUBLISHED);

        when(lecturerExamService.publishExam("lecturer@example.com", "exam_123")).thenReturn(response);

        mockMvc.perform(post("/api/v1/lecturer/exams/exam_123/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));
    }
}
