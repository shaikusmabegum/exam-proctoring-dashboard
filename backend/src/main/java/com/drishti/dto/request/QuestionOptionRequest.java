package com.drishti.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class QuestionOptionRequest {

    private String id;

    @NotBlank(message = "Option text cannot be blank")
    private String text;

    @JsonProperty("isCorrect")
    @JsonAlias({"correct", "is_correct"})
    private boolean isCorrect;

    public QuestionOptionRequest() {
    }

    public QuestionOptionRequest(String id, String text, boolean isCorrect) {
        this.id = id;
        this.text = text;
        this.isCorrect = isCorrect;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @JsonProperty("isCorrect")
    public boolean isCorrect() {
        return isCorrect;
    }

    @JsonProperty("isCorrect")
    public void setCorrect(boolean correct) {
        this.isCorrect = correct;
    }

    public void setIsCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}
