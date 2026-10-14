package com.drishti.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

public class StudentAnswer {

    private String questionId;
    private Set<String> selectedOptionIds = new HashSet<>();
    private String textAnswer;
    private Instant lastSavedAt;
    private Double awardedMarks;
    private Boolean isCorrect;

    public StudentAnswer() {
        this.lastSavedAt = Instant.now();
    }

    public StudentAnswer(String questionId, Set<String> selectedOptionIds, String textAnswer) {
        this.questionId = questionId;
        this.selectedOptionIds = selectedOptionIds != null ? selectedOptionIds : new HashSet<>();
        this.textAnswer = textAnswer;
        this.lastSavedAt = Instant.now();
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Set<String> getSelectedOptionIds() {
        return selectedOptionIds;
    }

    public void setSelectedOptionIds(Set<String> selectedOptionIds) {
        this.selectedOptionIds = selectedOptionIds != null ? selectedOptionIds : new HashSet<>();
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public Instant getLastSavedAt() {
        return lastSavedAt;
    }

    public void setLastSavedAt(Instant lastSavedAt) {
        this.lastSavedAt = lastSavedAt;
    }

    public Double getAwardedMarks() {
        return awardedMarks;
    }

    public void setAwardedMarks(Double awardedMarks) {
        this.awardedMarks = awardedMarks;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}
