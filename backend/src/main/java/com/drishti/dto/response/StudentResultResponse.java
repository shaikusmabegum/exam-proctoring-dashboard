package com.drishti.dto.response;

import com.drishti.entity.AttemptStatus;
import com.drishti.entity.EvaluationStatus;
import com.drishti.entity.ExamAttempt;

import java.time.Instant;
import java.util.List;

public class StudentResultResponse {

    private String attemptId;
    private String examId;
    private String examTitle;
    private String studentId;
    private int attemptNumber;
    private AttemptStatus status;
    private EvaluationStatus evaluationStatus;
    private double score;
    private double totalMarks;
    private double percentage;
    private double passingMarks;
    private boolean passed;
    private Instant submittedTime;
    private boolean resultsPublished;
    private String resultMessage;
    private List<QuestionResultDetail> questionDetails;

    public StudentResultResponse() {
    }

    public static StudentResultResponse fromAttempt(ExamAttempt attempt, double passingMarks, boolean resultsPublished, List<QuestionResultDetail> details) {
        StudentResultResponse response = new StudentResultResponse();
        response.setAttemptId(attempt.getId());
        response.setExamId(attempt.getExamId());
        response.setExamTitle(attempt.getExamTitle());
        response.setStudentId(attempt.getStudentId());
        response.setAttemptNumber(attempt.getAttemptNumber());
        response.setStatus(attempt.getStatus());
        response.setEvaluationStatus(attempt.getEvaluationStatus());
        response.setScore(attempt.getScore());
        response.setTotalMarks(attempt.getTotalMarks());
        response.setPercentage(attempt.getPercentage());
        response.setPassingMarks(passingMarks);
        response.setPassed(attempt.isPassed());
        response.setSubmittedTime(attempt.getSubmittedTime());
        response.setResultsPublished(resultsPublished);

        if (attempt.getEvaluationStatus() == EvaluationStatus.REQUIRES_MANUAL_GRADING) {
            response.setResultMessage("Your exam has been submitted and is awaiting instructor grading for subjective questions.");
        } else if (!resultsPublished) {
            response.setResultMessage("Exam submitted successfully. Detailed question breakdown will be available once released by the instructor.");
        } else {
            response.setResultMessage(attempt.isPassed() ? "Congratulations! You have passed the examination." : "Examination evaluated. You did not meet the passing criteria.");
            response.setQuestionDetails(details);
        }

        return response;
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

    public EvaluationStatus getEvaluationStatus() {
        return evaluationStatus;
    }

    public void setEvaluationStatus(EvaluationStatus evaluationStatus) {
        this.evaluationStatus = evaluationStatus;
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

    public double getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(double passingMarks) {
        this.passingMarks = passingMarks;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public Instant getSubmittedTime() {
        return submittedTime;
    }

    public void setSubmittedTime(Instant submittedTime) {
        this.submittedTime = submittedTime;
    }

    public boolean isResultsPublished() {
        return resultsPublished;
    }

    public void setResultsPublished(boolean resultsPublished) {
        this.resultsPublished = resultsPublished;
    }

    public String getResultMessage() {
        return resultMessage;
    }

    public void setResultMessage(String resultMessage) {
        this.resultMessage = resultMessage;
    }

    public List<QuestionResultDetail> getQuestionDetails() {
        return questionDetails;
    }

    public void setQuestionDetails(List<QuestionResultDetail> questionDetails) {
        this.questionDetails = questionDetails;
    }
}
