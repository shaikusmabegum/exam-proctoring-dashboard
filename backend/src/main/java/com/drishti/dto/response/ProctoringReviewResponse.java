package com.drishti.dto.response;

import com.drishti.entity.EventSeverity;
import com.drishti.entity.ProctoringReview;
import com.drishti.entity.ProctoringReviewStatus;

import java.time.Instant;

public class ProctoringReviewResponse {

    private String id;
    private String sessionId;
    private String attemptId;
    private String examId;
    private String examTitle;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String violationCategory;
    private EventSeverity severity;
    private ProctoringReviewStatus status;
    private String reviewerEmail;
    private String reviewerNotes;
    private String resolutionReason;
    private Instant reviewedAt;
    private Instant createdAt;

    public ProctoringReviewResponse() {
    }

    public static ProctoringReviewResponse fromEntity(ProctoringReview review) {
        if (review == null) return null;
        ProctoringReviewResponse res = new ProctoringReviewResponse();
        res.setId(review.getId());
        res.setSessionId(review.getSessionId());
        res.setAttemptId(review.getAttemptId());
        res.setExamId(review.getExamId());
        res.setExamTitle(review.getExamTitle());
        res.setStudentId(review.getStudentId());
        res.setStudentName(review.getStudentName());
        res.setStudentEmail(review.getStudentEmail());
        res.setViolationCategory(review.getViolationCategory());
        res.setSeverity(review.getSeverity());
        res.setStatus(review.getStatus());
        res.setReviewerEmail(review.getReviewerEmail());
        res.setReviewerNotes(review.getReviewerNotes());
        res.setResolutionReason(review.getResolutionReason());
        res.setReviewedAt(review.getReviewedAt());
        res.setCreatedAt(review.getCreatedAt());
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

    public String getViolationCategory() {
        return violationCategory;
    }

    public void setViolationCategory(String violationCategory) {
        this.violationCategory = violationCategory;
    }

    public EventSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(EventSeverity severity) {
        this.severity = severity;
    }

    public ProctoringReviewStatus getStatus() {
        return status;
    }

    public void setStatus(ProctoringReviewStatus status) {
        this.status = status;
    }

    public String getReviewerEmail() {
        return reviewerEmail;
    }

    public void setReviewerEmail(String reviewerEmail) {
        this.reviewerEmail = reviewerEmail;
    }

    public String getReviewerNotes() {
        return reviewerNotes;
    }

    public void setReviewerNotes(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }

    public String getResolutionReason() {
        return resolutionReason;
    }

    public void setResolutionReason(String resolutionReason) {
        this.resolutionReason = resolutionReason;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
