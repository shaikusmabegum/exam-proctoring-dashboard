package com.drishti.dto.response;

import com.drishti.entity.AttemptStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.Question;
import com.drishti.entity.StudentAnswer;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ExamAttemptResponse {

    private String id;
    private String examId;
    private String examTitle;
    private String studentId;
    private int attemptNumber;
    private AttemptStatus status;
    private Instant startTime;
    private Instant expiryTime;
    private long remainingSeconds;
    private Instant lastSavedTime;
    private Instant submittedTime;
    private List<StudentQuestionResponse> questions;
    private Map<String, StudentAnswer> answers;

    public ExamAttemptResponse() {
    }

    public static ExamAttemptResponse fromEntity(ExamAttempt attempt, Exam exam) {
        if (attempt == null) return null;
        ExamAttemptResponse response = new ExamAttemptResponse();
        response.setId(attempt.getId());
        response.setExamId(attempt.getExamId());
        response.setExamTitle(attempt.getExamTitle());
        response.setStudentId(attempt.getStudentId());
        response.setAttemptNumber(attempt.getAttemptNumber());
        response.setStatus(attempt.getStatus());
        response.setStartTime(attempt.getStartTime());
        response.setExpiryTime(attempt.getExpiryTime());

        // Calculate authoritative remaining seconds on the server
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS && attempt.getExpiryTime() != null) {
            long secondsLeft = Duration.between(Instant.now(), attempt.getExpiryTime()).getSeconds();
            response.setRemainingSeconds(Math.max(0, secondsLeft));
        } else {
            response.setRemainingSeconds(0);
        }

        response.setLastSavedTime(attempt.getLastSavedTime());
        response.setSubmittedTime(attempt.getSubmittedTime());

        // Populate student-safe questions (preserving attempt's question ordering if randomized)
        if (exam != null && exam.getQuestions() != null) {
            Map<String, Question> questionMap = exam.getQuestions().stream()
                    .collect(Collectors.toMap(Question::getId, q -> q));

            List<Question> orderedQuestions;
            if (attempt.getQuestionOrder() != null && !attempt.getQuestionOrder().isEmpty()) {
                orderedQuestions = attempt.getQuestionOrder().stream()
                        .filter(questionMap::containsKey)
                        .map(questionMap::get)
                        .collect(Collectors.toList());
            } else {
                orderedQuestions = exam.getQuestions();
            }

            response.setQuestions(orderedQuestions.stream()
                    .map(StudentQuestionResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        // Return student's saved answers (excluding server-only evaluation fields like isCorrect or awardedMarks during active attempt)
        if (attempt.getAnswers() != null) {
            Map<String, StudentAnswer> sanitizedAnswers = new HashMap<>();
            attempt.getAnswers().forEach((k, v) -> {
                StudentAnswer safe = new StudentAnswer(v.getQuestionId(), v.getSelectedOptionIds(), v.getTextAnswer());
                safe.setLastSavedAt(v.getLastSavedAt());
                sanitizedAnswers.put(k, safe);
            });
            response.setAnswers(sanitizedAnswers);
        } else {
            response.setAnswers(Collections.emptyMap());
        }

        return response;
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

    public long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
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

    public List<StudentQuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<StudentQuestionResponse> questions) {
        this.questions = questions;
    }

    public Map<String, StudentAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, StudentAnswer> answers) {
        this.answers = answers;
    }
}
