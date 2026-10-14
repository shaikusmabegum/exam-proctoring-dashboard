package com.drishti.dto.response;

import com.drishti.entity.Exam;

import java.time.Instant;

public class StudentExamResponse {

    private String id;
    private String title;
    private String description;
    private String instructions;
    private String courseName;
    private String lecturerName;
    private int durationMinutes;
    private double totalMarks;
    private double passingMarks;
    private Instant startTime;
    private Instant endTime;
    private int questionCount;
    private int maxAttempts;
    private boolean negativeMarking;
    private double negativeMarksPerQuestion;
    private boolean canAttempt;
    private String attemptStatusMessage;

    public StudentExamResponse() {
    }

    public static StudentExamResponse fromEntity(Exam exam) {
        if (exam == null) return null;
        StudentExamResponse response = new StudentExamResponse();
        response.setId(exam.getId());
        response.setTitle(exam.getTitle());
        response.setDescription(exam.getDescription());
        response.setInstructions(exam.getInstructions());
        response.setCourseName(exam.getCourseName());
        response.setLecturerName(exam.getLecturerName());
        response.setDurationMinutes(exam.getDurationMinutes());
        response.setTotalMarks(exam.getTotalMarks());
        response.setPassingMarks(exam.getPassingMarks());
        response.setStartTime(exam.getStartTime());
        response.setEndTime(exam.getEndTime());
        response.setQuestionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0);
        response.setMaxAttempts(exam.getMaxAttempts());
        response.setNegativeMarking(exam.isNegativeMarking());
        response.setNegativeMarksPerQuestion(exam.getNegativeMarksPerQuestion());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getLecturerName() {
        return lecturerName;
    }

    public void setLecturerName(String lecturerName) {
        this.lecturerName = lecturerName;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public double getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(double passingMarks) {
        this.passingMarks = passingMarks;
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

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public boolean isNegativeMarking() {
        return negativeMarking;
    }

    public void setNegativeMarking(boolean negativeMarking) {
        this.negativeMarking = negativeMarking;
    }

    public double getNegativeMarksPerQuestion() {
        return negativeMarksPerQuestion;
    }

    public void setNegativeMarksPerQuestion(double negativeMarksPerQuestion) {
        this.negativeMarksPerQuestion = negativeMarksPerQuestion;
    }

    public boolean isCanAttempt() {
        return canAttempt;
    }

    public void setCanAttempt(boolean canAttempt) {
        this.canAttempt = canAttempt;
    }

    public String getAttemptStatusMessage() {
        return attemptStatusMessage;
    }

    public void setAttemptStatusMessage(String attemptStatusMessage) {
        this.attemptStatusMessage = attemptStatusMessage;
    }
}
