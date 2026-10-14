package com.drishti.controller;

import com.drishti.dto.request.CameraStatusUpdateRequest;
import com.drishti.dto.request.ProctoringEventRequest;
import com.drishti.dto.response.ApiResponse;
import com.drishti.dto.response.ProctoringEventResponse;
import com.drishti.dto.response.ProctoringSessionResponse;
import com.drishti.security.SecurityUtils;
import com.drishti.service.ProctoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/proctoring")
@Tag(name = "Student Proctoring Session & Telemetry", description = "Endpoints for proctoring session initialization, heartbeat, camera status, and browser event ingestion")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('STUDENT')")
public class StudentProctoringController {

    private final ProctoringService proctoringService;

    public StudentProctoringController(ProctoringService proctoringService) {
        this.proctoringService = proctoringService;
    }

    private String getAuthenticatedEmail() {
        return SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in security context"));
    }

    @PostMapping("/session/{attemptId}")
    @Operation(summary = "Start or retrieve proctoring session for exam attempt")
    public ResponseEntity<ApiResponse<ProctoringSessionResponse>> startOrGetSession(
            @PathVariable String attemptId) {
        ProctoringSessionResponse response = proctoringService.startOrGetSession(getAuthenticatedEmail(), attemptId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Proctoring session initialized", response));
    }

    @GetMapping("/session/{attemptId}")
    @Operation(summary = "Get current proctoring session for exam attempt")
    public ResponseEntity<ApiResponse<ProctoringSessionResponse>> getSession(
            @PathVariable String attemptId) {
        ProctoringSessionResponse response = proctoringService.getSession(getAuthenticatedEmail(), attemptId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/session/{sessionId}/heartbeat")
    @Operation(summary = "Send keepalive heartbeat from student proctoring client")
    public ResponseEntity<ApiResponse<Void>> recordHeartbeat(
            @PathVariable String sessionId) {
        proctoringService.recordHeartbeat(getAuthenticatedEmail(), sessionId);
        return ResponseEntity.ok(ApiResponse.successMessage("Heartbeat recorded successfully"));
    }

    @PutMapping("/session/{sessionId}/camera-status")
    @Operation(summary = "Update camera/webcam stream status")
    public ResponseEntity<ApiResponse<ProctoringSessionResponse>> updateCameraStatus(
            @PathVariable String sessionId,
            @Valid @RequestBody CameraStatusUpdateRequest request) {
        ProctoringSessionResponse response = proctoringService.updateCameraStatus(
                getAuthenticatedEmail(), sessionId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Camera status updated", response));
    }

    @PostMapping("/session/{sessionId}/events")
    @Operation(summary = "Ingest batch of proctoring events and AI telemetry signals")
    public ResponseEntity<ApiResponse<List<ProctoringEventResponse>>> ingestEvents(
            @PathVariable String sessionId,
            @RequestBody List<@Valid ProctoringEventRequest> requests) {
        List<ProctoringEventResponse> responses = proctoringService.ingestEvents(
                getAuthenticatedEmail(), sessionId, requests);
        return ResponseEntity.ok(ApiResponse.success("Events ingested successfully", responses));
    }

    @PostMapping("/session/{sessionId}/complete")
    @Operation(summary = "Complete proctoring session upon exam submission")
    public ResponseEntity<ApiResponse<ProctoringSessionResponse>> completeSession(
            @PathVariable String sessionId) {
        ProctoringSessionResponse response = proctoringService.completeSession(getAuthenticatedEmail(), sessionId);
        return ResponseEntity.ok(ApiResponse.success("Proctoring session completed", response));
    }
}
