package com.drishti.controller;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.BatchSaveAnswerRequest;
import com.drishti.dto.request.SaveAnswerRequest;
import com.drishti.dto.request.SubmitAttemptRequest;
import com.drishti.dto.response.ApiResponse;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.StudentDashboardResponse;
import com.drishti.dto.response.StudentExamResponse;
import com.drishti.dto.response.StudentResultResponse;
import com.drishti.security.SecurityUtils;
import com.drishti.service.StudentExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@Tag(name = "Student Examination & Execution", description = "Endpoints for discovering exams, starting attempts, saving answers, submitting and viewing results")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('STUDENT')")
public class StudentExamController {

    private final StudentExamService studentExamService;

    public StudentExamController(StudentExamService studentExamService) {
        this.studentExamService = studentExamService;
    }

    private String getAuthenticatedEmail() {
        return SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in security context"));
    }

    @GetMapping("/exams/available")
    @Operation(summary = "List currently available exams", description = "Returns active published exams within the current schedule window.")
    public ResponseEntity<ApiResponse<PageResponse<StudentExamResponse>>> getAvailableExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").ascending());
        PageResponse<StudentExamResponse> response = studentExamService.getAvailableExams(getAuthenticatedEmail(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exams/{examId}")
    @Operation(summary = "Get exam details and instructions", description = "Returns exam metadata and student attempt eligibility.")
    public ResponseEntity<ApiResponse<StudentExamResponse>> getExamById(@PathVariable String examId) {
        StudentExamResponse response = studentExamService.getStudentExamById(getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/exams/{examId}/attempts")
    @Operation(summary = "Start or resume an exam attempt", description = "Initiates a new timed attempt or resumes an active in-progress attempt.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> startOrResumeAttempt(@PathVariable String examId) {
        ExamAttemptResponse response = studentExamService.startOrResumeAttempt(getAuthenticatedEmail(), examId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Exam attempt started/resumed successfully", response));
    }

    @GetMapping("/attempts/{attemptId}")
    @Operation(summary = "Get active attempt with questions", description = "Retrieves student attempt state, remaining time in seconds, and student-safe questions.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> getAttempt(@PathVariable String attemptId) {
        ExamAttemptResponse response = studentExamService.getAttempt(getAuthenticatedEmail(), attemptId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/attempts/{attemptId}/answers")
    @Operation(summary = "Save answers for an attempt", description = "Persists single or multiple question answers with server-side validation.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> saveAnswer(
            @PathVariable String attemptId,
            @Valid @RequestBody SaveAnswerRequest request) {
        ExamAttemptResponse response = studentExamService.saveAnswers(getAuthenticatedEmail(), attemptId, Collections.singletonList(request));
        return ResponseEntity.ok(ApiResponse.success("Answer saved successfully", response));
    }

    @PutMapping("/attempts/{attemptId}/answers/batch")
    @Operation(summary = "Save batch answers for an attempt", description = "Persists a list of question answers.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> saveBatchAnswers(
            @PathVariable String attemptId,
            @Valid @RequestBody BatchSaveAnswerRequest request) {
        ExamAttemptResponse response = studentExamService.saveAnswers(getAuthenticatedEmail(), attemptId, request.getAnswers());
        return ResponseEntity.ok(ApiResponse.success("Batch answers saved successfully", response));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @Operation(summary = "Submit exam attempt", description = "Finalizes the attempt, authoritative server timestamp, and triggers evaluation.")
    public ResponseEntity<ApiResponse<StudentResultResponse>> submitAttempt(
            @PathVariable String attemptId,
            @RequestBody(required = false) SubmitAttemptRequest request) {
        String reason = request != null ? request.getReason() : "MANUAL_SUBMISSION";
        StudentResultResponse response = studentExamService.submitAttempt(getAuthenticatedEmail(), attemptId, reason);
        return ResponseEntity.ok(ApiResponse.success("Exam submitted and evaluated successfully", response));
    }

    @GetMapping("/attempts/{attemptId}/result")
    @Operation(summary = "Get attempt result", description = "Retrieves final score and question review if released by the lecturer.")
    public ResponseEntity<ApiResponse<StudentResultResponse>> getAttemptResult(@PathVariable String attemptId) {
        StudentResultResponse response = studentExamService.getAttemptResult(getAuthenticatedEmail(), attemptId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/results")
    @Operation(summary = "Get student result history", description = "Returns paginated completed exam attempts and score summaries.")
    public ResponseEntity<ApiResponse<PageResponse<StudentResultResponse>>> getStudentResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedTime"));
        PageResponse<StudentResultResponse> response = studentExamService.getStudentResults(getAuthenticatedEmail(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get student dashboard overview", description = "Returns active attempts count, available exams, and recent scores.")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getStudentDashboard() {
        StudentDashboardResponse response = studentExamService.getStudentDashboard(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
