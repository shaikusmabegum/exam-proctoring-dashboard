package com.drishti.controller;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.UserStatusUpdateRequest;
import com.drishti.dto.response.AdminDashboardStatsResponse;
import com.drishti.dto.response.ApiResponse;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Role;
import com.drishti.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Platform Management", description = "System-level administrator endpoints for user management, platform analytics and exam monitoring")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final com.drishti.service.ProctoringService proctoringService;

    public AdminController(AdminService adminService, com.drishti.service.ProctoringService proctoringService) {
        this.adminService = adminService;
        this.proctoringService = proctoringService;
    }

    @GetMapping("/proctoring/summary")
    @Operation(summary = "Get platform-wide proctoring summary statistics", description = "Aggregates sessions, open reviews, violations, and active feeds across the entire platform.")
    public ResponseEntity<ApiResponse<com.drishti.dto.response.ProctoringSummaryResponse>> getProctoringSummary() {
        com.drishti.dto.response.ProctoringSummaryResponse response = proctoringService.getAdminProctoringSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get system platform statistics", description = "Aggregates total users by role, exams by status, and overall attempt counts.")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse response = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users")
    @Operation(summary = "List system users", description = "Returns paginated list of users with optional role and active status filters.")
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<UserSummaryResponse> response = adminService.getUsers(role, active, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user details by ID", description = "Returns user metadata without password hashes or tokens.")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUserById(@PathVariable String userId) {
        UserSummaryResponse response = adminService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Update user account status", description = "Enables or disables a user account.")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        UserSummaryResponse response = adminService.updateUserStatus(userId, request.getActive());
        return ResponseEntity.ok(ApiResponse.success("User account status updated successfully", response));
    }

    @PatchMapping("/users/{userId}/approve")
    @Operation(summary = "Approve pending user account", description = "Approves a pending lecturer or user account and activates platform access.")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> approveUser(@PathVariable String userId) {
        UserSummaryResponse response = adminService.approveUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User account approved and activated successfully", response));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user account", description = "Permanently removes a user account from the platform.")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.successMessage("User account deleted successfully"));
    }

    @GetMapping("/exams")
    @Operation(summary = "List all platform exams", description = "Returns paginated list of all exams across all lecturers.")
    public ResponseEntity<ApiResponse<PageResponse<ExamResponse>>> getAllExams(
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ExamResponse> response = adminService.getAllExams(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/attempts")
    @Operation(summary = "List all platform exam attempts", description = "Returns paginated list of student attempts.")
    public ResponseEntity<ApiResponse<PageResponse<ExamAttemptResponse>>> getAllAttempts(
            @RequestParam(required = false) AttemptStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ExamAttemptResponse> response = adminService.getAllAttempts(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
