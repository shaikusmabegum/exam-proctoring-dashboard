package com.drishti.dto.response;

import com.drishti.entity.Exam;
import com.drishti.entity.ExamStatus;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public class ExamResponse {

    private String id;
    private String title;
    private String description;
    private String instructions;
    private String courseName;
    private String lecturerId;
    private String lecturerName;
    private int durationMinutes;
    private double totalMarks;
    private double passingMarks;
    private Instant startTime;
    private Instant endTime;
    private ExamStatus status;
    private int questionCount;
    private List<QuestionResponse> questions;
    private boolean randomizeQuestions;
    private boolean negativeMarking;
    private double negativeMarksPerQuestion;
    private int maxAttempts;
    private boolean resultsPublished;
    private Instant createdAt;
    private Instant updatedAt;

    public ExamResponse() {
    }

    public static ExamResponse fromEntity(Exam exam) {
        if (exam == null) return null;
        ExamResponse response = new ExamResponse();
        response.setId(exam.getId());
        response.setTitle(exam.getTitle());
        response.setDescription(exam.getDescription());
        response.setInstructions(exam.getInstructions());
        response.setCourseName(exam.getCourseName());
        response.setLecturerId(exam.getLecturerId());
        response.setLecturerName(exam.getLecturerName());
        response.setDurationMinutes(exam.getDurationMinutes());
        response.setTotalMarks(exam.getTotalMarks());
        response.setPassingMarks(exam.getPassingMarks());
        response.setStartTime(exam.getStartTime());
        response.setEndTime(exam.getEndTime());
        response.setStatus(exam.getStatus());
        response.setQuestionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0);
        if (exam.getQuestions() != null) {
            response.setQuestions(exam.getQuestions().stream()
                    .map(QuestionResponse::fromEntity)
                    .collect(Collectors.toList()));
        }
        response.setRandomizeQuestions(exam.isRandomizeQuestions());
        response.setNegativeMarking(exam.isNegativeMarking());
        response.setNegativeMarksPerQuestion(exam.getNegativeMarksPerQuestion());
        response.setMaxAttempts(exam.getMaxAttempts());
        response.setResultsPublished(exam.isResultsPublished());
        response.setCreatedAt(exam.getCreatedAt());
        response.setUpdatedAt(exam.getUpdatedAt());
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

    public String getLecturerId() {
        return lecturerId;
    }

    public void setLecturerId(String lecturerId) {
        this.lecturerId = lecturerId;
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

    public ExamStatus getStatus() {
        return status;
    }

    public void setStatus(ExamStatus status) {
        this.status = status;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    public List<QuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResponse> questions) {
        this.questions = questions;
    }

    public boolean isRandomizeQuestions() {
        return randomizeQuestions;
    }

    public void setRandomizeQuestions(boolean randomizeQuestions) {
        this.randomizeQuestions = randomizeQuestions;
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

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public boolean isResultsPublished() {
        return resultsPublished;
    }

    public void setResultsPublished(boolean resultsPublished) {
        this.resultsPublished = resultsPublished;
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
}
