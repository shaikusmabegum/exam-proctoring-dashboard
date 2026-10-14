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
import java.util.List;
import java.util.Objects;

@Document(collection = "exams")
@CompoundIndexes({
        @CompoundIndex(name = "idx_exam_status_schedule", def = "{'status': 1, 'startTime': 1, 'endTime': 1}"),
        @CompoundIndex(name = "idx_exam_lecturer_status", def = "{'lecturerId': 1, 'status': 1}")
})
public class Exam {

    @Id
    private String id;

    private String title;
    private String description;
    private String instructions;
    private String courseName;

    @Indexed
    private String lecturerId;
    private String lecturerName;

    private int durationMinutes;
    private double totalMarks;
    private double passingMarks;

    @Indexed
    private Instant startTime;

    @Indexed
    private Instant endTime;

    @Indexed
    private ExamStatus status = ExamStatus.DRAFT;

    private List<Question> questions = new ArrayList<>();

    private boolean randomizeQuestions = false;
    private boolean negativeMarking = false;
    private double negativeMarksPerQuestion = 0.0;
    private int maxAttempts = 1;
    private boolean resultsPublished = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Exam() {
    }

    public Exam(String title, String courseName, String lecturerId, String lecturerName, int durationMinutes, double passingMarks, Instant startTime, Instant endTime) {
        this.title = title;
        this.courseName = courseName;
        this.lecturerId = lecturerId;
        this.lecturerName = lecturerName;
        this.durationMinutes = durationMinutes;
        this.passingMarks = passingMarks;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = ExamStatus.DRAFT;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    /**
     * Recalculates total marks from the question list.
     */
    public void recalculateTotalMarks() {
        if (questions == null || questions.isEmpty()) {
            this.totalMarks = 0.0;
        } else {
            this.totalMarks = questions.stream().mapToDouble(Question::getMarks).sum();
        }
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

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions != null ? questions : new ArrayList<>();
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Exam exam = (Exam) o;
        return Objects.equals(id, exam.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
