package com.drishti.controller;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.ExamCreateRequest;
import com.drishti.dto.request.ExamUpdateRequest;
import com.drishti.dto.request.QuestionCreateRequest;
import com.drishti.dto.request.QuestionReorderRequest;
import com.drishti.dto.request.QuestionUpdateRequest;
import com.drishti.dto.response.ApiResponse;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.LecturerDashboardStatsResponse;
import com.drishti.dto.response.LecturerExamAnalyticsResponse;
import com.drishti.entity.ExamStatus;
import com.drishti.security.SecurityUtils;
import com.drishti.service.LecturerExamService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/lecturer")
@Tag(name = "Lecturer Examination Management", description = "Endpoints for creating, managing, publishing and analyzing exams")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('LECTURER')")
public class LecturerExamController {

    private final LecturerExamService lecturerExamService;

    public LecturerExamController(LecturerExamService lecturerExamService) {
        this.lecturerExamService = lecturerExamService;
    }

    private String getAuthenticatedEmail() {
        return SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in security context"));
    }

    @PostMapping("/exams")
    @Operation(summary = "Create a new draft exam", description = "Creates a draft exam owned by the authenticated lecturer.")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(@Valid @RequestBody ExamCreateRequest request) {
        ExamResponse response = lecturerExamService.createExam(getAuthenticatedEmail(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Exam draft created successfully", response));
    }

    @GetMapping("/exams")
    @Operation(summary = "List exams owned by authenticated lecturer", description = "Returns paginated exams with optional status filter.")
    public ResponseEntity<ApiResponse<PageResponse<ExamResponse>>> getLecturerExams(
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<ExamResponse> response = lecturerExamService.getLecturerExams(getAuthenticatedEmail(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exams/{examId}")
    @Operation(summary = "Get exam details by ID", description = "Retrieves an owned exam including questions and correct answers.")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(@PathVariable String examId) {
        ExamResponse response = lecturerExamService.getLecturerExamById(getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/exams/{examId}")
    @Operation(summary = "Update an editable exam draft", description = "Updates settings and schedule for an owned exam.")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable String examId,
            @Valid @RequestBody ExamUpdateRequest request) {
        ExamResponse response = lecturerExamService.updateExam(getAuthenticatedEmail(), examId, request);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", response));
    }

    @PostMapping("/exams/{examId}/questions")
    @Operation(summary = "Add a question to an exam", description = "Adds a single choice, multiple choice, true/false, or short answer question.")
    public ResponseEntity<ApiResponse<ExamResponse>> addQuestion(
            @PathVariable String examId,
            @Valid @RequestBody QuestionCreateRequest request) {
        ExamResponse response = lecturerExamService.addQuestion(getAuthenticatedEmail(), examId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question added successfully", response));
    }

    @PutMapping("/exams/{examId}/questions/{questionId}")
    @Operation(summary = "Update a question in an exam", description = "Modifies question text, marks, options, or correct answers.")
    public ResponseEntity<ApiResponse<ExamResponse>> updateQuestion(
            @PathVariable String examId,
            @PathVariable String questionId,
            @Valid @RequestBody QuestionUpdateRequest request) {
        ExamResponse response = lecturerExamService.updateQuestion(getAuthenticatedEmail(), examId, questionId, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", response));
    }

    @DeleteMapping("/exams/{examId}/questions/{questionId}")
    @Operation(summary = "Delete a question from an exam", description = "Removes a question and recalculates total marks.")
    public ResponseEntity<ApiResponse<ExamResponse>> deleteQuestion(
            @PathVariable String examId,
            @PathVariable String questionId) {
        ExamResponse response = lecturerExamService.deleteQuestion(getAuthenticatedEmail(), examId, questionId);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", response));
    }

    @PutMapping("/exams/{examId}/questions/reorder")
    @Operation(summary = "Reorder questions in an exam", description = "Updates sequential display order of questions.")
    public ResponseEntity<ApiResponse<ExamResponse>> reorderQuestions(
            @PathVariable String examId,
            @Valid @RequestBody QuestionReorderRequest request) {
        ExamResponse response = lecturerExamService.reorderQuestions(getAuthenticatedEmail(), examId, request);
        return ResponseEntity.ok(ApiResponse.success("Questions reordered successfully", response));
    }

    @PostMapping("/exams/{examId}/publish")
    @Operation(summary = "Publish an exam", description = "Validates question set, marks and schedule, then marks exam as PUBLISHED.")
    public ResponseEntity<ApiResponse<ExamResponse>> publishExam(@PathVariable String examId) {
        ExamResponse response = lecturerExamService.publishExam(getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", response));
    }

    @PostMapping("/exams/{examId}/unpublish")
    @Operation(summary = "Revert published exam to draft", description = "Reverts a published exam back to draft mode if no student attempts exist.")
    public ResponseEntity<ApiResponse<ExamResponse>> unpublishExam(@PathVariable String examId) {
        ExamResponse response = lecturerExamService.unpublishExam(getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success("Exam reverted to draft mode successfully", response));
    }

    @PostMapping("/exams/{examId}/archive")
    @Operation(summary = "Archive an exam", description = "Archives an exam to close new attempts.")
    public ResponseEntity<ApiResponse<ExamResponse>> archiveExam(@PathVariable String examId) {
        ExamResponse response = lecturerExamService.archiveExam(getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success("Exam archived successfully", response));
    }

    @GetMapping("/exams/{examId}/attempts")
    @Operation(summary = "View attempts for an exam", description = "Returns student attempt submissions and scores for an owned exam.")
    public ResponseEntity<ApiResponse<PageResponse<ExamAttemptResponse>>> getExamAttempts(
            @PathVariable String examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedTime", "startTime"));
        PageResponse<ExamAttemptResponse> response = lecturerExamService.getExamAttempts(getAuthenticatedEmail(), examId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exams/{examId}/analytics")
    @Operation(summary = "View exam analytics", description = "Calculates average score, pass rate, completion rate, and score distribution.")
    public ResponseEntity<ApiResponse<LecturerExamAnalyticsResponse>> getExamAnalytics(@PathVariable String examId) {
        LecturerExamAnalyticsResponse response = lecturerExamService.getExamAnalytics(getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/exams/{examId}/results/release")
    @Operation(summary = "Toggle results release status", description = "Controls whether students can view detailed question breakdown and correct answers.")
    public ResponseEntity<ApiResponse<ExamResponse>> toggleResultsRelease(
            @PathVariable String examId,
            @RequestParam boolean release) {
        ExamResponse response = lecturerExamService.toggleResultsRelease(getAuthenticatedEmail(), examId, release);
        return ResponseEntity.ok(ApiResponse.success("Results release status updated to " + release, response));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get lecturer dashboard summary", description = "Returns exam counts, attempt statistics, and overall pass rate.")
    public ResponseEntity<ApiResponse<LecturerDashboardStatsResponse>> getDashboardStats() {
        LecturerDashboardStatsResponse response = lecturerExamService.getDashboardStats(getAuthenticatedEmail());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
