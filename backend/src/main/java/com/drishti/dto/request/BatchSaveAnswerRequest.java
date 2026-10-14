package com.drishti.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class BatchSaveAnswerRequest {

    @NotEmpty(message = "Answers list cannot be empty")
    @Valid
    private List<SaveAnswerRequest> answers;

    public BatchSaveAnswerRequest() {
    }

    public BatchSaveAnswerRequest(List<SaveAnswerRequest> answers) {
        this.answers = answers;
    }

    public List<SaveAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<SaveAnswerRequest> answers) {
        this.answers = answers;
    }
}
