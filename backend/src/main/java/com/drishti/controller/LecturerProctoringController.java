package com.drishti.controller;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.ReviewUpdateRequest;
import com.drishti.dto.response.ApiResponse;
import com.drishti.dto.response.ProctoringEventResponse;
import com.drishti.dto.response.ProctoringReviewResponse;
import com.drishti.dto.response.ProctoringSessionResponse;
import com.drishti.dto.response.ProctoringSummaryResponse;
import com.drishti.entity.ProctoringReviewStatus;
import com.drishti.entity.ProctoringSessionStatus;
import com.drishti.security.SecurityUtils;
import com.drishti.service.ProctoringService;
import com.drishti.service.sse.LecturerMonitoringEventPublisher;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/lecturer/proctoring")
@Tag(name = "Lecturer Live Proctoring & Review Management", description = "Endpoints for live monitoring, SSE stream, incident inspection, and proctoring review decisions")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('LECTURER')")
public class LecturerProctoringController {

    private final ProctoringService proctoringService;
    private final LecturerMonitoringEventPublisher eventPublisher;

    public LecturerProctoringController(
            ProctoringService proctoringService,
            LecturerMonitoringEventPublisher eventPublisher) {
        this.proctoringService = proctoringService;
        this.eventPublisher = eventPublisher;
    }

    private String getAuthenticatedEmail() {
        return SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in security context"));
    }

    @GetMapping("/exams/{examId}/sessions")
    @Operation(summary = "Get list of student proctoring sessions for an exam")
    public ResponseEntity<ApiResponse<PageResponse<ProctoringSessionResponse>>> getExamSessions(
            @PathVariable String examId,
            @RequestParam(required = false) ProctoringSessionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        PageResponse<ProctoringSessionResponse> response = proctoringService.getLecturerExamSessions(
                getAuthenticatedEmail(), examId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions/{sessionId}")
    @Operation(summary = "Get proctoring session details")
    public ResponseEntity<ApiResponse<ProctoringSessionResponse>> getSessionDetails(
            @PathVariable String sessionId) {
        ProctoringSessionResponse response = proctoringService.getLecturerSessionDetails(
                getAuthenticatedEmail(), sessionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions/{sessionId}/events")
    @Operation(summary = "Get historical event log for a proctoring session")
    public ResponseEntity<ApiResponse<PageResponse<ProctoringEventResponse>>> getSessionEvents(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("serverReceivedTimestamp").descending());
        PageResponse<ProctoringEventResponse> response = proctoringService.getLecturerSessionEvents(
                getAuthenticatedEmail(), sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exams/{examId}/summary")
    @Operation(summary = "Get comprehensive proctoring summary metrics for an exam")
    public ResponseEntity<ApiResponse<ProctoringSummaryResponse>> getExamProctoringSummary(
            @PathVariable String examId) {
        ProctoringSummaryResponse response = proctoringService.getLecturerExamProctoringSummary(
                getAuthenticatedEmail(), examId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exams/{examId}/reviews")
    @Operation(summary = "Get list of flagged proctoring reviews for an exam")
    public ResponseEntity<ApiResponse<PageResponse<ProctoringReviewResponse>>> getExamReviews(
            @PathVariable String examId,
            @RequestParam(required = false) ProctoringReviewStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<ProctoringReviewResponse> response = proctoringService.getLecturerReviews(
                getAuthenticatedEmail(), examId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/reviews/{reviewId}")
    @Operation(summary = "Update and resolve a proctoring incident review")
    public ResponseEntity<ApiResponse<ProctoringReviewResponse>> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewUpdateRequest request) {
        ProctoringReviewResponse response = proctoringService.updateReview(
                getAuthenticatedEmail(), reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @GetMapping(value = "/exams/{examId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Live Server-Sent Events (SSE) telemetry and alert stream for an exam")
    public SseEmitter streamProctoringEvents(@PathVariable String examId) {
        // Enforces lecturer ownership before establishing the SSE connection
        proctoringService.getLecturerExamProctoringSummary(getAuthenticatedEmail(), examId);
        return eventPublisher.subscribe(examId);
    }
}
