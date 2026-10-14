package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.response.AuditLogResponse;
import com.drishti.entity.AuditLog;
import com.drishti.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void logAction(String actorId, String actorEmail, String action, String resourceType, String resourceId, String outcome, String ipAddress, String userAgent, Map<String, String> details) {
        try {
            Map<String, String> sanitizedDetails = new HashMap<>();
            if (details != null) {
                details.forEach((k, v) -> {
                    // Strict scrubbing of credentials and tokens
                    if (k.toLowerCase().contains("password") || k.toLowerCase().contains("secret") || k.toLowerCase().contains("token") || k.toLowerCase().contains("auth")) {
                        sanitizedDetails.put(k, "[REDACTED]");
                    } else if (v != null && v.length() > 500) {
                        sanitizedDetails.put(k, v.substring(0, 500) + "...[TRUNCATED]");
                    } else {
                        sanitizedDetails.put(k, v);
                    }
                });
            }

            AuditLog auditLog = new AuditLog(actorId, actorEmail, action, resourceType, resourceId, outcome, ipAddress, userAgent, sanitizedDetails);
            auditLogRepository.save(auditLog);
            log.info("Audit log written: [{}] by [{}] on [{}:{}] - Outcome: [{}]", action, actorEmail, resourceType, resourceId, outcome);
        } catch (Exception e) {
            // Guard against recursive audit failures
            log.error("Failed to persist audit log for action [{}]: {}", action, e.getMessage());
        }
    }

    @Override
    public PageResponse<AuditLogResponse> getAuditLogs(String actorEmail, String action, String resourceType, Pageable pageable) {
        Page<AuditLog> page;

        if (actorEmail != null && !actorEmail.trim().isEmpty()) {
            page = auditLogRepository.findByActorEmail(actorEmail.trim(), pageable);
        } else if (action != null && !action.trim().isEmpty()) {
            page = auditLogRepository.findByAction(action.trim(), pageable);
        } else {
            page = auditLogRepository.findAll(pageable);
        }

        List<AuditLogResponse> mapped = page.getContent().stream()
                .map(AuditLogResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(page, mapped);
    }
}
