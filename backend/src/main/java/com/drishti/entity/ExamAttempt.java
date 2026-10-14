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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Document(collection = "exam_attempts")
@CompoundIndexes({
        @CompoundIndex(name = "idx_attempt_exam_student_status", def = "{'examId': 1, 'studentId': 1, 'status': 1}"),
        @CompoundIndex(name = "idx_attempt_student_status", def = "{'studentId': 1, 'status': 1}"),
        @CompoundIndex(name = "idx_attempt_exam_status", def = "{'examId': 1, 'status': 1}")
})
public class ExamAttempt {

    @Id
    private String id;

    @Indexed
    private String examId;
    private String examTitle;

    @Indexed
    private String studentId;
    private String studentEmail;
    private String studentName;

    private int attemptNumber = 1;

    @Indexed
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    private Instant startTime;
    private Instant expiryTime;
    private Instant lastSavedTime;
    private Instant submittedTime;

    private Map<String, StudentAnswer> answers = new HashMap<>();
    private List<String> questionOrder = new ArrayList<>();

    private double score = 0.0;
    private double totalMarks = 0.0;
    private double percentage = 0.0;
    private boolean passed = false;

    private EvaluationStatus evaluationStatus = EvaluationStatus.PENDING;
    private String submissionReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ExamAttempt() {
    }

    public ExamAttempt(String examId, String examTitle, String studentId, String studentEmail, String studentName, int attemptNumber, Instant startTime, Instant expiryTime) {
        this.examId = examId;
        this.examTitle = examTitle;
        this.studentId = studentId;
        this.studentEmail = studentEmail;
        this.studentName = studentName;
        this.attemptNumber = attemptNumber;
        this.startTime = startTime;
        this.expiryTime = expiryTime;
        this.lastSavedTime = startTime;
        this.status = AttemptStatus.IN_PROGRESS;
        this.evaluationStatus = EvaluationStatus.PENDING;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public AttemptStatus getStatus() {
        return status;
    }

    public void setStatus(AttemptStatus status) {
        this.status = status;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(Instant expiryTime) {
        this.expiryTime = expiryTime;
    }

    public Instant getLastSavedTime() {
        return lastSavedTime;
    }

    public void setLastSavedTime(Instant lastSavedTime) {
        this.lastSavedTime = lastSavedTime;
    }

    public Instant getSubmittedTime() {
        return submittedTime;
    }

    public void setSubmittedTime(Instant submittedTime) {
        this.submittedTime = submittedTime;
    }

    public Map<String, StudentAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, StudentAnswer> answers) {
        this.answers = answers != null ? answers : new HashMap<>();
    }

    public List<String> getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(List<String> questionOrder) {
        this.questionOrder = questionOrder != null ? questionOrder : new ArrayList<>();
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public EvaluationStatus getEvaluationStatus() {
        return evaluationStatus;
    }

    public void setEvaluationStatus(EvaluationStatus evaluationStatus) {
        this.evaluationStatus = evaluationStatus;
    }

    public String getSubmissionReason() {
        return submissionReason;
    }

    public void setSubmissionReason(String submissionReason) {
        this.submissionReason = submissionReason;
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
        ExamAttempt that = (ExamAttempt) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
