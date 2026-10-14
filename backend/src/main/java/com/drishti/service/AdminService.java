package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.response.AdminDashboardStatsResponse;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Role;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    AdminDashboardStatsResponse getDashboardStats();

    PageResponse<UserSummaryResponse> getUsers(Role role, Boolean active, Pageable pageable);

    UserSummaryResponse getUserById(String userId);

    UserSummaryResponse updateUserStatus(String userId, boolean active);

    UserSummaryResponse approveUser(String userId);

    void deleteUser(String userId);

    PageResponse<ExamResponse> getAllExams(ExamStatus status, Pageable pageable);

    PageResponse<ExamAttemptResponse> getAllAttempts(AttemptStatus status, Pageable pageable);
}
