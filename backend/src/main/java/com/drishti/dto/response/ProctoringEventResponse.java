package com.drishti.dto.response;

import com.drishti.entity.EventSeverity;
import com.drishti.entity.EventSource;
import com.drishti.entity.ProctoringEvent;
import com.drishti.entity.ProctoringEventType;

import java.time.Instant;
import java.util.Map;

public class ProctoringEventResponse {

    private String id;
    private String sessionId;
    private String attemptId;
    private String studentId;
    private String examId;
    private ProctoringEventType eventType;
    private EventSource source;
    private Instant eventTimestamp;
    private Instant serverReceivedTimestamp;
    private EventSeverity severity;
    private Map<String, Object> metadata;

    public ProctoringEventResponse() {
    }

    public static ProctoringEventResponse fromEntity(ProctoringEvent event) {
        if (event == null) return null;
        ProctoringEventResponse res = new ProctoringEventResponse();
        res.setId(event.getId());
        res.setSessionId(event.getSessionId());
        res.setAttemptId(event.getAttemptId());
        res.setStudentId(event.getStudentId());
        res.setExamId(event.getExamId());
        res.setEventType(event.getEventType());
        res.setSource(event.getSource());
        res.setEventTimestamp(event.getEventTimestamp());
        res.setServerReceivedTimestamp(event.getServerReceivedTimestamp());
        res.setSeverity(event.getSeverity());
        res.setMetadata(event.getMetadata());
        return res;
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
        this.metadata = metadata;
    }
}
