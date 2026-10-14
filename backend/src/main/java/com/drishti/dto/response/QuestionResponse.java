package com.drishti.dto.response;

import com.drishti.entity.Question;
import com.drishti.entity.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public class QuestionResponse {

    private String id;
    private String questionText;
    private QuestionType type;
    private List<QuestionOptionResponse> options;
    private String correctAnswerText;
    private double marks;
    private double negativeMarks;
    private String explanation;
    private int order;
    private Instant createdAt;

    public QuestionResponse() {
    }

    public static QuestionResponse fromEntity(Question question) {
        if (question == null) return null;
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setQuestionText(question.getQuestionText());
        response.setType(question.getType());
        response.setOptions(question.getOptions().stream()
                .map(QuestionOptionResponse::fromEntity)
                .collect(Collectors.toList()));
        response.setCorrectAnswerText(question.getCorrectAnswerText());
        response.setMarks(question.getMarks());
        response.setNegativeMarks(question.getNegativeMarks());
        response.setExplanation(question.getExplanation());
        response.setOrder(question.getOrder());
        response.setCreatedAt(question.getCreatedAt());
        return response;
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

    public List<QuestionOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<QuestionOptionResponse> options) {
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
}
