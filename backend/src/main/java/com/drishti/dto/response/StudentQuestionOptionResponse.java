package com.drishti.dto.response;

import com.drishti.entity.QuestionOption;

public class StudentQuestionOptionResponse {

    private String id;
    private String text;

    public StudentQuestionOptionResponse() {
    }

    public StudentQuestionOptionResponse(String id, String text) {
        this.id = id;
        this.text = text;
    }

    public static StudentQuestionOptionResponse fromEntity(QuestionOption option) {
        if (option == null) return null;
        return new StudentQuestionOptionResponse(option.getId(), option.getText());
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
}
