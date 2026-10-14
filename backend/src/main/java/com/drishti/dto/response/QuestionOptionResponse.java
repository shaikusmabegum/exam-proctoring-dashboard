package com.drishti.dto.response;

import com.drishti.entity.QuestionOption;
import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionOptionResponse {

    private String id;
    private String text;

    @JsonProperty("isCorrect")
    private boolean isCorrect;

    public QuestionOptionResponse() {
    }

    public QuestionOptionResponse(String id, String text, boolean isCorrect) {
        this.id = id;
        this.text = text;
        this.isCorrect = isCorrect;
    }

    public static QuestionOptionResponse fromEntity(QuestionOption option) {
        if (option == null) return null;
        return new QuestionOptionResponse(option.getId(), option.getText(), option.isCorrect());
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

    @JsonProperty("correct")
    public boolean getCorrect() {
        return isCorrect;
    }
}
