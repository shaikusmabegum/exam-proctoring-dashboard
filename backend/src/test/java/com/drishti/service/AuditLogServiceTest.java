package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.response.AuditLogResponse;
import com.drishti.entity.AuditLog;
import com.drishti.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        auditLogService = new AuditLogServiceImpl(auditLogRepository);
    }

    @Test
    @DisplayName("logAction redacts passwords, tokens and credentials in details map")
    void logAction_SanitizesSensitiveFields() {
        Map<String, String> details = new HashMap<>();
        details.put("password", "superSecret123");
        details.put("authToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
        details.put("secretKey", "xyz123");
        details.put("regularField", "normalValue");

        auditLogService.logAction(
                "user-1",
                "alice@example.com",
                "USER_LOGIN",
                "User",
                "user-1",
                "SUCCESS",
                "127.0.0.1",
                "Mozilla/5.0",
                details
        );

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("[REDACTED]", saved.getDetails().get("password"));
        assertEquals("[REDACTED]", saved.getDetails().get("authToken"));
        assertEquals("[REDACTED]", saved.getDetails().get("secretKey"));
        assertEquals("normalValue", saved.getDetails().get("regularField"));
    }

    @Test
    @DisplayName("logAction truncates excessively long detail values")
    void logAction_TruncatesLongValues() {
        String veryLongValue = "a".repeat(600);
        Map<String, String> details = Map.of("payload", veryLongValue);

        auditLogService.logAction(
                "user-1",
                "alice@example.com",
                "PAYLOAD_SUBMIT",
                "Submission",
                "sub-1",
                "SUCCESS",
                "127.0.0.1",
                "Mozilla/5.0",
                details
        );

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertTrue(saved.getDetails().get("payload").endsWith("...[TRUNCATED]"));
        assertEquals(514, saved.getDetails().get("payload").length());
    }

    @Test
    @DisplayName("getAuditLogs returns paginated list of audit records")
    void getAuditLogs_ReturnsPaginated() {
        AuditLog logItem = new AuditLog("u1", "admin@drishti.edu", "EXAM_CREATE", "Exam", "e1", "SUCCESS", "127.0.0.1", "Chrome", Map.of());
        Pageable pageable = PageRequest.of(0, 10);
        when(auditLogRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(logItem), pageable, 1));

        PageResponse<AuditLogResponse> result = auditLogService.getAuditLogs(null, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("admin@drishti.edu", result.getContent().get(0).getActorEmail());
    }
}
