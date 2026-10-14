package com.drishti.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class QuestionReorderRequest {

    @NotEmpty(message = "Question order list cannot be empty")
    private List<String> orderedQuestionIds;

    public QuestionReorderRequest() {
    }

    public QuestionReorderRequest(List<String> orderedQuestionIds) {
        this.orderedQuestionIds = orderedQuestionIds;
    }

    public List<String> getOrderedQuestionIds() {
        return orderedQuestionIds;
    }

    public void setOrderedQuestionIds(List<String> orderedQuestionIds) {
        this.orderedQuestionIds = orderedQuestionIds;
    }
}
