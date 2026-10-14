package com.drishti.dto.request;

import com.drishti.entity.ProctoringEventType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Map;

public class ProctoringEventRequest {

    @NotNull(message = "Event type is required")
    private ProctoringEventType eventType;

    private Instant eventTimestamp;

    @Size(max = 100, message = "Idempotency key cannot exceed 100 characters")
    private String idempotencyKey;

    private Map<String, Object> metadata;

    public ProctoringEventRequest() {
    }

    public ProctoringEventRequest(ProctoringEventType eventType, Instant eventTimestamp, String idempotencyKey, Map<String, Object> metadata) {
        this.eventType = eventType;
        this.eventTimestamp = eventTimestamp;
        this.idempotencyKey = idempotencyKey;
        this.metadata = metadata;
    }

    public ProctoringEventType getEventType() {
        return eventType;
    }

    public void setEventType(ProctoringEventType eventType) {
        this.eventType = eventType;
    }

    public Instant getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(Instant eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
