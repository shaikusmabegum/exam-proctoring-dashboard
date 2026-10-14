package com.drishti.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class Question {

    private String id;
    private String questionText;
    private QuestionType type;
    private List<QuestionOption> options = new ArrayList<>();
    private String correctAnswerText; // Used for SHORT_ANSWER or TRUE_FALSE (e.g. "true" or "false")
    private double marks = 1.0;
    private double negativeMarks = 0.0;
    private String explanation;
    private int order;
    private Instant createdAt;

    public Question() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
    }

    public Question(String questionText, QuestionType type, List<QuestionOption> options, double marks, double negativeMarks) {
        this.id = UUID.randomUUID().toString();
        this.questionText = questionText;
        this.type = type;
        this.options = options != null ? options : new ArrayList<>();
        this.marks = marks;
        this.negativeMarks = negativeMarks;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public List<QuestionOption> getOptions() {
        return options;
    }

    public void setOptions(List<QuestionOption> options) {
        this.options = options;
    }

    public String getCorrectAnswerText() {
        return correctAnswerText;
    }

    public void setCorrectAnswerText(String correctAnswerText) {
        this.correctAnswerText = correctAnswerText;
    }

    public double getMarks() {
        return marks;
    }

    public void setMarks(double marks) {
        this.marks = marks;
    }

    public double getNegativeMarks() {
        return negativeMarks;
    }

    public void setNegativeMarks(double negativeMarks) {
        this.negativeMarks = negativeMarks;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return Objects.equals(id, question.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
