package com.drishti.dto.request;

import com.drishti.entity.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class QuestionUpdateRequest {

    @NotBlank(message = "Question text is required")
    @Size(min = 3, max = 5000, message = "Question text must be between 3 and 5000 characters")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType type;

    @Valid
    private List<QuestionOptionRequest> options = new ArrayList<>();

    private String correctAnswerText;

    @NotNull(message = "Marks are required")
    @DecimalMin(value = "0.5", message = "Marks must be at least 0.5")
    private Double marks;

    @DecimalMin(value = "0.0", message = "Negative marks cannot be negative")
    private Double negativeMarks = 0.0;

    private String explanation;
    private Integer order;

    public QuestionUpdateRequest() {
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

    public List<QuestionOptionRequest> getOptions() {
        return options;
    }

    public void setOptions(List<QuestionOptionRequest> options) {
        this.options = options != null ? options : new ArrayList<>();
    }

    public String getCorrectAnswerText() {
        return correctAnswerText;
    }

    public void setCorrectAnswerText(String correctAnswerText) {
        this.correctAnswerText = correctAnswerText;
    }

    public Double getMarks() {
        return marks;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public Double getNegativeMarks() {
        return negativeMarks;
    }

    public void setNegativeMarks(Double negativeMarks) {
        this.negativeMarks = negativeMarks;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}
