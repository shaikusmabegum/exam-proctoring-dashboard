package com.drishti.controller;

import com.drishti.dto.request.SaveAnswerRequest;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.StudentResultResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.security.CustomUserDetailsService;
import com.drishti.security.JwtAuthenticationFilter;
import com.drishti.security.JwtService;
import com.drishti.service.StudentExamService;
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

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StudentExamController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudentExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentExamService studentExamService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/student/exams/{examId}/attempts - Start attempt 201 Created")
    void testStartAttempt_Success() throws Exception {
        ExamAttemptResponse response = new ExamAttemptResponse();
        response.setId("att_123");
        response.setExamId("exam_1");
        response.setStatus(AttemptStatus.IN_PROGRESS);
        response.setRemainingSeconds(3600);

        when(studentExamService.startOrResumeAttempt("student@example.com", "exam_1")).thenReturn(response);

        mockMvc.perform(post("/api/v1/student/exams/exam_1/attempts"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("att_123"))
                .andExpect(jsonPath("$.data.remainingSeconds").value(3600));
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("PUT /api/v1/student/attempts/{attemptId}/answers - Save answer 200 OK")
    void testSaveAnswer_Success() throws Exception {
        SaveAnswerRequest request = new SaveAnswerRequest("q1", Set.of("opt1"), null);

        ExamAttemptResponse response = new ExamAttemptResponse();
        response.setId("att_123");
        response.setStatus(AttemptStatus.IN_PROGRESS);

        when(studentExamService.saveAnswers(eq("student@example.com"), eq("att_123"), any()))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/student/attempts/att_123/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "student@example.com", roles = {"STUDENT"})
    @DisplayName("POST /api/v1/student/attempts/{attemptId}/submit - Submit attempt 200 OK")
    void testSubmitAttempt_Success() throws Exception {
        StudentResultResponse result = new StudentResultResponse();
        result.setAttemptId("att_123");
        result.setScore(85.0);
        result.setPercentage(85.0);
        result.setPassed(true);
        result.setStatus(AttemptStatus.SUBMITTED);

        when(studentExamService.submitAttempt(eq("student@example.com"), eq("att_123"), any()))
                .thenReturn(result);

        mockMvc.perform(post("/api/v1/student/attempts/att_123/submit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score").value(85.0))
                .andExpect(jsonPath("$.data.passed").value(true));
    }
}
