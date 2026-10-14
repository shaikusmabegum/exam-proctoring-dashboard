package com.drishti.dto.response;

import com.drishti.entity.AuditLog;

import java.time.Instant;
import java.util.Map;

public class AuditLogResponse {

    private String id;
    private String actorId;
    private String actorEmail;
    private String action;
    private String resourceType;
    private String resourceId;
    private String outcome;
    private String ipAddress;
    private String userAgent;
    private Map<String, String> details;
    private Instant timestamp;

    public AuditLogResponse() {
    }

    public static AuditLogResponse fromEntity(AuditLog log) {
        if (log == null) return null;
        AuditLogResponse res = new AuditLogResponse();
        res.setId(log.getId());
        res.setActorId(log.getActorId());
        res.setActorEmail(log.getActorEmail());
        res.setAction(log.getAction());
        res.setResourceType(log.getResourceType());
        res.setResourceId(log.getResourceId());
        res.setOutcome(log.getOutcome());
        res.setIpAddress(log.getIpAddress());
        res.setUserAgent(log.getUserAgent());
        res.setDetails(log.getDetails());
        res.setTimestamp(log.getTimestamp());
        return res;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
