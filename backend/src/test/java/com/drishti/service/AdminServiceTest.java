package com.drishti.service;

import com.drishti.dto.response.AdminDashboardStatsResponse;
import com.drishti.dto.response.UserSummaryResponse;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.repository.ExamAttemptRepository;
import com.drishti.repository.ExamRepository;
import com.drishti.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamAttemptRepository examAttemptRepository;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminServiceImpl(userRepository, examRepository, examAttemptRepository);
    }

    @Test
    @DisplayName("Should aggregate system platform statistics accurately")
    void testGetDashboardStats() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByRole(Role.STUDENT)).thenReturn(80L);
        when(userRepository.countByRole(Role.LECTURER)).thenReturn(18L);
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(2L);
        when(userRepository.countByActive(true)).thenReturn(95L);

        when(examRepository.count()).thenReturn(20L);
        when(examRepository.countByStatus(ExamStatus.PUBLISHED)).thenReturn(12L);
        when(examRepository.countByStatus(ExamStatus.DRAFT)).thenReturn(5L);
        when(examRepository.countByStatus(ExamStatus.ARCHIVED)).thenReturn(3L);

        when(examAttemptRepository.count()).thenReturn(250L);

        AdminDashboardStatsResponse stats = adminService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(100L, stats.getTotalUsers());
        assertEquals(80L, stats.getTotalStudents());
        assertEquals(18L, stats.getTotalLecturers());
        assertEquals(2L, stats.getTotalAdmins());
        assertEquals(95L, stats.getActiveUsers());
        assertEquals(20L, stats.getTotalExams());
        assertEquals(12L, stats.getActiveExams());
        assertEquals(250L, stats.getTotalAttempts());
    }

    @Test
    @DisplayName("Should update user status successfully")
    void testUpdateUserStatus() {
        User user = new User("Alice", "alice@example.com", "pwd", Role.STUDENT);
        user.setId("u1");
        user.setActive(true);

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserSummaryResponse response = adminService.updateUserStatus("u1", false);

        assertNotNull(response);
        assertFalse(response.isActive());
        verify(userRepository).save(user);
    }
}
