package com.drishti.dto.response;

import java.util.Map;

public class LecturerExamAnalyticsResponse {

    private String examId;
    private String examTitle;
    private long totalAttempts;
    private long completedAttempts;
    private long inProgressAttempts;
    private double averageScore;
    private double averagePercentage;
    private double highestScore;
    private double lowestScore;
    private long passCount;
    private long failCount;
    private double passRate;
    private Map<String, Long> scoreDistribution; // e.g. "0-20%": 2, "21-40%": 5, "41-60%": 10, "61-80%": 20, "81-100%": 15

    public LecturerExamAnalyticsResponse() {
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

    public long getInProgressAttempts() {
        return inProgressAttempts;
    }

    public void setInProgressAttempts(long inProgressAttempts) {
        this.inProgressAttempts = inProgressAttempts;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public double getAveragePercentage() {
        return averagePercentage;
    }

    public void setAveragePercentage(double averagePercentage) {
        this.averagePercentage = averagePercentage;
    }

    public double getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(double highestScore) {
        this.highestScore = highestScore;
    }

    public double getLowestScore() {
        return lowestScore;
    }

    public void setLowestScore(double lowestScore) {
        this.lowestScore = lowestScore;
    }

    public long getPassCount() {
        return passCount;
    }

    public void setPassCount(long passCount) {
        this.passCount = passCount;
    }

    public long getFailCount() {
        return failCount;
    }

    public void setFailCount(long failCount) {
        this.failCount = failCount;
    }

    public double getPassRate() {
        return passRate;
    }

    public void setPassRate(double passRate) {
        this.passRate = passRate;
    }

    public Map<String, Long> getScoreDistribution() {
        return scoreDistribution;
    }

    public void setScoreDistribution(Map<String, Long> scoreDistribution) {
        this.scoreDistribution = scoreDistribution;
    }
}
