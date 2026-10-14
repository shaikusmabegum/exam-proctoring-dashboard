package com.drishti.dto.response;

import java.util.List;

public class LecturerDashboardStatsResponse {

    private long totalExams;
    private long draftExams;
    private long publishedExams;
    private long archivedExams;
    private long totalAttempts;
    private long completedAttempts;
    private double overallPassRate;
    private List<ExamResponse> recentExams;

    public LecturerDashboardStatsResponse() {
    }

    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getDraftExams() {
        return draftExams;
    }

    public void setDraftExams(long draftExams) {
        this.draftExams = draftExams;
    }

    public long getPublishedExams() {
        return publishedExams;
    }

    public void setPublishedExams(long publishedExams) {
        this.publishedExams = publishedExams;
    }

    public long getArchivedExams() {
        return archivedExams;
    }

    public void setArchivedExams(long archivedExams) {
        this.archivedExams = archivedExams;
    }

    public long getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(long totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public long getCompletedAttempts() {
        return completedAttempts;
    }

    public void setCompletedAttempts(long completedAttempts) {
        this.completedAttempts = completedAttempts;
    }

    public double getOverallPassRate() {
        return overallPassRate;
    }

    public void setOverallPassRate(double overallPassRate) {
        this.overallPassRate = overallPassRate;
    }

    public List<ExamResponse> getRecentExams() {
        return recentExams;
    }

    public void setRecentExams(List<ExamResponse> recentExams) {
        this.recentExams = recentExams;
    }
}
