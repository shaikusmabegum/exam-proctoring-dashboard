package com.drishti.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "proctoring_sessions")
@CompoundIndexes({
        @CompoundIndex(name = "idx_proctoring_exam_status", def = "{'examId': 1, 'status': 1}"),
        @CompoundIndex(name = "idx_proctoring_student_status", def = "{'studentId': 1, 'status': 1}"),
        @CompoundIndex(name = "idx_proctoring_last_heartbeat", def = "{'status': 1, 'lastHeartbeatTime': 1}")
})
public class ProctoringSession {

    @Id
    private String id;

    @Indexed(unique = true)
    private String attemptId;

    @Indexed
    private String studentId;
    private String studentName;
    private String studentEmail;

    @Indexed
    private String examId;
    private String examTitle;

    @Indexed
    private ProctoringSessionStatus status = ProctoringSessionStatus.INITIALIZING;

    private Instant startTime;
    private Instant endTime;
    private Instant lastHeartbeatTime;

    private CameraStreamStatus cameraStatus = CameraStreamStatus.UNKNOWN;
    private String aiDetectionProvider;
    private List<String> aiCapabilities = new ArrayList<>();

    private long eventCount = 0;
    private long violationCount = 0;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ProctoringSession() {
    }

    public ProctoringSession(String attemptId, String studentId, String studentName, String studentEmail, String examId, String examTitle, String aiDetectionProvider, List<String> aiCapabilities) {
        this.attemptId = attemptId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.examId = examId;
        this.examTitle = examTitle;
        this.status = ProctoringSessionStatus.INITIALIZING;
        this.cameraStatus = CameraStreamStatus.UNKNOWN;
        this.aiDetectionProvider = aiDetectionProvider;
        this.aiCapabilities = aiCapabilities != null ? aiCapabilities : new ArrayList<>();
        this.startTime = Instant.now();
        this.lastHeartbeatTime = Instant.now();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public ProctoringSessionStatus getStatus() {
        return status;
    }

    public void setStatus(ProctoringSessionStatus status) {
        this.status = status;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Instant getLastHeartbeatTime() {
        return lastHeartbeatTime;
    }

    public void setLastHeartbeatTime(Instant lastHeartbeatTime) {
        this.lastHeartbeatTime = lastHeartbeatTime;
    }

    public CameraStreamStatus getCameraStatus() {
        return cameraStatus;
    }

    public void setCameraStatus(CameraStreamStatus cameraStatus) {
        this.cameraStatus = cameraStatus;
    }

    public String getAiDetectionProvider() {
        return aiDetectionProvider;
    }

    public void setAiDetectionProvider(String aiDetectionProvider) {
        this.aiDetectionProvider = aiDetectionProvider;
    }

    public List<String> getAiCapabilities() {
        return aiCapabilities;
    }

    public void setAiCapabilities(List<String> aiCapabilities) {
        this.aiCapabilities = aiCapabilities != null ? aiCapabilities : new ArrayList<>();
    }

    public long getEventCount() {
        return eventCount;
    }

    public void setEventCount(long eventCount) {
        this.eventCount = eventCount;
    }

    public long getViolationCount() {
        return violationCount;
    }

    public void setViolationCount(long violationCount) {
        this.violationCount = violationCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProctoringSession that = (ProctoringSession) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
