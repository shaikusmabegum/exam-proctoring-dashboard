package com.drishti.dto.response;

import java.util.Map;

public class AdminDashboardStatsResponse {

    private long totalUsers;
    private long totalStudents;
    private long totalLecturers;
    private long totalAdmins;
    private long activeUsers;
    private long totalExams;
    private long activeExams;
    private long totalAttempts;
    private long completedAttempts;
    private Map<String, Long> userRoleBreakdown;
    private Map<String, Long> examStatusBreakdown;

    public AdminDashboardStatsResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalLecturers() {
        return totalLecturers;
    }

    public void setTotalLecturers(long totalLecturers) {
        this.totalLecturers = totalLecturers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getActiveExams() {
        return activeExams;
    }

    public void setActiveExams(long activeExams) {
        this.activeExams = activeExams;
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

    public Map<String, Long> getUserRoleBreakdown() {
        return userRoleBreakdown;
    }

    public void setUserRoleBreakdown(Map<String, Long> userRoleBreakdown) {
        this.userRoleBreakdown = userRoleBreakdown;
    }

    public Map<String, Long> getExamStatusBreakdown() {
        return examStatusBreakdown;
    }

    public void setExamStatusBreakdown(Map<String, Long> examStatusBreakdown) {
        this.examStatusBreakdown = examStatusBreakdown;
    }
}
