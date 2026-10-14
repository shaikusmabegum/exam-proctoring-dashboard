package com.drishti.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.HashSet;
import java.util.Set;

public class SaveAnswerRequest {

    @NotBlank(message = "Question ID is required")
    private String questionId;

    private Set<String> selectedOptionIds = new HashSet<>();
    private String textAnswer;

    public SaveAnswerRequest() {
    }

    public SaveAnswerRequest(String questionId, Set<String> selectedOptionIds, String textAnswer) {
        this.questionId = questionId;
        this.selectedOptionIds = selectedOptionIds != null ? selectedOptionIds : new HashSet<>();
        this.textAnswer = textAnswer;
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
}
