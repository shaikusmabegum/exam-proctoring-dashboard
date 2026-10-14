package com.drishti.dto.response;

import com.drishti.entity.CameraStreamStatus;
import com.drishti.entity.ProctoringSession;
import com.drishti.entity.ProctoringSessionStatus;

import java.time.Instant;
import java.util.List;

public class ProctoringSessionResponse {

    private String id;
    private String attemptId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String examId;
    private String examTitle;
    private ProctoringSessionStatus status;
    private Instant startTime;
    private Instant endTime;
    private Instant lastHeartbeatTime;
    private CameraStreamStatus cameraStatus;
    private String aiDetectionProvider;
    private List<String> aiCapabilities;
    private long eventCount;
    private long violationCount;

    public ProctoringSessionResponse() {
    }

    public static ProctoringSessionResponse fromEntity(ProctoringSession session) {
        if (session == null) return null;
        ProctoringSessionResponse res = new ProctoringSessionResponse();
        res.setId(session.getId());
        res.setAttemptId(session.getAttemptId());
        res.setStudentId(session.getStudentId());
        res.setStudentName(session.getStudentName());
        res.setStudentEmail(session.getStudentEmail());
        res.setExamId(session.getExamId());
        res.setExamTitle(session.getExamTitle());
        res.setStatus(session.getStatus());
        res.setStartTime(session.getStartTime());
        res.setEndTime(session.getEndTime());
        res.setLastHeartbeatTime(session.getLastHeartbeatTime());
        res.setCameraStatus(session.getCameraStatus());
        res.setAiDetectionProvider(session.getAiDetectionProvider());
        res.setAiCapabilities(session.getAiCapabilities());
        res.setEventCount(session.getEventCount());
        res.setViolationCount(session.getViolationCount());
        return res;
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
        this.aiCapabilities = aiCapabilities;
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
}
