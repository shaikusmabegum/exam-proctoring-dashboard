package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.response.AuditLogResponse;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AuditLogService {

    void logAction(String actorId, String actorEmail, String action, String resourceType, String resourceId, String outcome, String ipAddress, String userAgent, Map<String, String> details);

    PageResponse<AuditLogResponse> getAuditLogs(String actorEmail, String action, String resourceType, Pageable pageable);
}
