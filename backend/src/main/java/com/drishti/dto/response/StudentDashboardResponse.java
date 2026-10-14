package com.drishti.dto.response;

import java.util.List;

public class StudentDashboardResponse {

    private long availableExamsCount;
    private long activeAttemptsCount;
    private long completedAttemptsCount;
    private double averageScorePercentage;
    private List<StudentExamResponse> upcomingOrAvailableExams;
    private List<StudentResultResponse> recentResults;

    public StudentDashboardResponse() {
    }

    public long getAvailableExamsCount() {
        return availableExamsCount;
    }

    public void setAvailableExamsCount(long availableExamsCount) {
        this.availableExamsCount = availableExamsCount;
    }

    public long getActiveAttemptsCount() {
        return activeAttemptsCount;
    }

    public void setActiveAttemptsCount(long activeAttemptsCount) {
        this.activeAttemptsCount = activeAttemptsCount;
    }

    public long getCompletedAttemptsCount() {
        return completedAttemptsCount;
    }

    public void setCompletedAttemptsCount(long completedAttemptsCount) {
        this.completedAttemptsCount = completedAttemptsCount;
    }

    public double getAverageScorePercentage() {
        return averageScorePercentage;
    }

    public void setAverageScorePercentage(double averageScorePercentage) {
        this.averageScorePercentage = averageScorePercentage;
    }

    public List<StudentExamResponse> getUpcomingOrAvailableExams() {
        return upcomingOrAvailableExams;
    }

    public void setUpcomingOrAvailableExams(List<StudentExamResponse> upcomingOrAvailableExams) {
        this.upcomingOrAvailableExams = upcomingOrAvailableExams;
    }

    public List<StudentResultResponse> getRecentResults() {
        return recentResults;
    }

    public void setRecentResults(List<StudentResultResponse> recentResults) {
        this.recentResults = recentResults;
    }
}
