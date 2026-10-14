package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.response.AdminDashboardStatsResponse;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.exception.ResourceNotFoundException;
import com.drishti.repository.ExamAttemptRepository;
import com.drishti.repository.ExamRepository;
import com.drishti.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;

    public AdminServiceImpl(
            UserRepository userRepository,
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository) {
        this.userRepository = userRepository;
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
    }

    @Override
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalLecturers = userRepository.countByRole(Role.LECTURER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long activeUsers = userRepository.countByActive(true);

        long totalExams = examRepository.count();
        long activeExams = examRepository.countByStatus(ExamStatus.PUBLISHED);

        long totalAttempts = examAttemptRepository.count();
        long completedAttempts = examAttemptRepository.countByStatus(AttemptStatus.SUBMITTED)
                + examAttemptRepository.countByStatus(AttemptStatus.AUTO_SUBMITTED)
                + examAttemptRepository.countByStatus(AttemptStatus.EVALUATED);

        Map<String, Long> roleMap = new LinkedHashMap<>();
        roleMap.put("STUDENT", totalStudents);
        roleMap.put("LECTURER", totalLecturers);
        roleMap.put("ADMIN", totalAdmins);

        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("DRAFT", examRepository.countByStatus(ExamStatus.DRAFT));
        statusMap.put("PUBLISHED", activeExams);
        statusMap.put("ARCHIVED", examRepository.countByStatus(ExamStatus.ARCHIVED));

        AdminDashboardStatsResponse response = new AdminDashboardStatsResponse();
        response.setTotalUsers(totalUsers);
        response.setTotalStudents(totalStudents);
        response.setTotalLecturers(totalLecturers);
        response.setTotalAdmins(totalAdmins);
        response.setActiveUsers(activeUsers);
        response.setTotalExams(totalExams);
        response.setActiveExams(activeExams);
        response.setTotalAttempts(totalAttempts);
        response.setCompletedAttempts(completedAttempts);
        response.setUserRoleBreakdown(roleMap);
        response.setExamStatusBreakdown(statusMap);

        return response;
    }

    @Override
    public PageResponse<UserSummaryResponse> getUsers(Role role, Boolean active, Pageable pageable) {
        Page<User> usersPage;

        if (role != null && active != null) {
            usersPage = userRepository.findByRoleAndActive(role, active, pageable);
        } else if (role != null) {
            usersPage = userRepository.findByRole(role, pageable);
        } else if (active != null) {
            usersPage = userRepository.findByActive(active, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        List<UserSummaryResponse> mapped = usersPage.getContent().stream()
                .map(UserSummaryResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(usersPage, mapped);
    }

    @Override
    public UserSummaryResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return UserSummaryResponse.fromEntity(user);
    }

    @Override
    public UserSummaryResponse updateUserStatus(String userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setActive(active);
        user.setUpdatedAt(Instant.now());
        User saved = userRepository.save(user);
        log.info("Administrator updated status of user ID: [{}] to active={}", userId, active);
        return UserSummaryResponse.fromEntity(saved);
    }

    @Override
    public UserSummaryResponse approveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setApproved(true);
        user.setActive(true);
        user.setUpdatedAt(Instant.now());
        User saved = userRepository.save(user);
        log.info("Administrator approved user ID: [{}] ({}) to active=true, approved=true", userId, user.getEmail());
        return UserSummaryResponse.fromEntity(saved);
    }

    @Override
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Prevent deleting the bootstrap admin account
        if (Role.ADMIN.equals(user.getRole()) && "admin@drishti.com".equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Cannot delete the primary system administrator account");
        }

        userRepository.delete(user);
        log.info("Administrator deleted user ID: [{}] ({})", userId, user.getEmail());
    }

    @Override
    public PageResponse<ExamResponse> getAllExams(ExamStatus status, Pageable pageable) {
        Page<Exam> examsPage = (status != null)
                ? examRepository.findByStatus(status, pageable)
                : examRepository.findAll(pageable);

        List<ExamResponse> mapped = examsPage.getContent().stream()
                .map(ExamResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(examsPage, mapped);
    }

    @Override
    public PageResponse<ExamAttemptResponse> getAllAttempts(AttemptStatus status, Pageable pageable) {
        Page<ExamAttempt> attemptsPage;

        if (status != null) {
            attemptsPage = examAttemptRepository.countByStatus(status) > 0
                    ? examAttemptRepository.findByExamIdAndStatus("", status, pageable) // or generic search
                    : examAttemptRepository.findAll(pageable);
        } else {
            attemptsPage = examAttemptRepository.findAll(pageable);
        }

        List<ExamAttemptResponse> mapped = attemptsPage.getContent().stream()
                .map(a -> {
                    Exam exam = examRepository.findById(a.getExamId()).orElse(null);
                    return ExamAttemptResponse.fromEntity(a, exam);
                })
                .collect(Collectors.toList());

        return PageResponse.fromPage(attemptsPage, mapped);
    }
}
