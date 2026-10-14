package com.drishti.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Document(collection = "proctoring_events")
@CompoundIndexes({
        @CompoundIndex(name = "idx_event_session_time", def = "{'sessionId': 1, 'serverReceivedTimestamp': -1}"),
        @CompoundIndex(name = "idx_event_attempt_type", def = "{'attemptId': 1, 'eventType': 1}"),
        @CompoundIndex(name = "idx_event_session_idempotency", def = "{'sessionId': 1, 'idempotencyKey': 1}", sparse = true)
})
public class ProctoringEvent {

    @Id
    private String id;

    @Indexed
    private String sessionId;

    @Indexed
    private String attemptId;

    @Indexed
    private String studentId;

    @Indexed
    private String examId;

    @Indexed
    private ProctoringEventType eventType;

    private EventSource source;
    private Instant eventTimestamp;
    private Instant serverReceivedTimestamp;
    private EventSeverity severity;

    private Map<String, Object> metadata = new HashMap<>();
    private String idempotencyKey;
    private boolean processed = false;

    @CreatedDate
    private Instant createdAt;

    public ProctoringEvent() {
    }

    public ProctoringEvent(String sessionId, String attemptId, String studentId, String examId, ProctoringEventType eventType, EventSource source, Instant eventTimestamp, EventSeverity severity, Map<String, Object> metadata, String idempotencyKey) {
        this.sessionId = sessionId;
        this.attemptId = attemptId;
        this.studentId = studentId;
        this.examId = examId;
        this.eventType = eventType;
        this.source = source;
        this.eventTimestamp = eventTimestamp != null ? eventTimestamp : Instant.now();
        this.serverReceivedTimestamp = Instant.now();
        this.severity = severity;
        this.metadata = metadata != null ? metadata : new HashMap<>();
        this.idempotencyKey = idempotencyKey;
        this.processed = false;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(String attemptId) {
        this.attemptId = attemptId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public ProctoringEventType getEventType() {
        return eventType;
    }

    public void setEventType(ProctoringEventType eventType) {
        this.eventType = eventType;
    }

    public EventSource getSource() {
        return source;
    }

    public void setSource(EventSource source) {
        this.source = source;
    }

    public Instant getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(Instant eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }

    public Instant getServerReceivedTimestamp() {
        return serverReceivedTimestamp;
    }

    public void setServerReceivedTimestamp(Instant serverReceivedTimestamp) {
        this.serverReceivedTimestamp = serverReceivedTimestamp;
    }

    public EventSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(EventSeverity severity) {
        this.severity = severity;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata != null ? metadata : new HashMap<>();
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public boolean isProcessed() {
        return processed;
    }

    public void setProcessed(boolean processed) {
        this.processed = processed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProctoringEvent that = (ProctoringEvent) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
