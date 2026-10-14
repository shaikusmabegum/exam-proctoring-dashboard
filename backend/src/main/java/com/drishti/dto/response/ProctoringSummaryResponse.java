package com.drishti.dto.response;

import java.util.Map;

public class ProctoringSummaryResponse {

    private String examId;
    private long totalSessions;
    private long activeSessions;
    private long completedSessions;
    private long connectionInterruptedSessions;
    private long totalEvents;
    private long totalReviews;
    private long openReviews;
    private long confirmedViolations;
    private long dismissedViolations;
    private Map<String, Long> eventsByType;
    private Map<String, Long> reviewsByCategory;

    public ProctoringSummaryResponse() {
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public long getActiveSessions() {
        return activeSessions;
    }

    public void setActiveSessions(long activeSessions) {
        this.activeSessions = activeSessions;
    }

    public long getCompletedSessions() {
        return completedSessions;
    }

    public void setCompletedSessions(long completedSessions) {
        this.completedSessions = completedSessions;
    }

    public long getConnectionInterruptedSessions() {
        return connectionInterruptedSessions;
    }

    public void setConnectionInterruptedSessions(long connectionInterruptedSessions) {
        this.connectionInterruptedSessions = connectionInterruptedSessions;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public long getOpenReviews() {
        return openReviews;
    }

    public void setOpenReviews(long openReviews) {
        this.openReviews = openReviews;
    }

    public long getConfirmedViolations() {
        return confirmedViolations;
    }

    public void setConfirmedViolations(long confirmedViolations) {
        this.confirmedViolations = confirmedViolations;
    }

    public long getDismissedViolations() {
        return dismissedViolations;
    }

    public void setDismissedViolations(long dismissedViolations) {
        this.dismissedViolations = dismissedViolations;
    }

    public Map<String, Long> getEventsByType() {
        return eventsByType;
    }

    public void setEventsByType(Map<String, Long> eventsByType) {
        this.eventsByType = eventsByType;
    }

    public Map<String, Long> getReviewsByCategory() {
        return reviewsByCategory;
    }

    public void setReviewsByCategory(Map<String, Long> reviewsByCategory) {
        this.reviewsByCategory = reviewsByCategory;
    }
}
