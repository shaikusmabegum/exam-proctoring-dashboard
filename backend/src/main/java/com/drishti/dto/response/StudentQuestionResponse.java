package com.drishti.dto.response;

import com.drishti.entity.Question;
import com.drishti.entity.QuestionType;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Student-safe question representation.
 * STRICT SECURITY: Correct answers, option correctness, and explanations are never included.
 */
public class StudentQuestionResponse {

    private String id;
    private String questionText;
    private QuestionType type;
    private List<StudentQuestionOptionResponse> options;
    private double marks;
    private double negativeMarks;
    private int order;

    public StudentQuestionResponse() {
    }

    public static StudentQuestionResponse fromEntity(Question question) {
        if (question == null) return null;
        StudentQuestionResponse response = new StudentQuestionResponse();
        response.setId(question.getId());
        response.setQuestionText(question.getQuestionText());
        response.setType(question.getType());
        response.setOptions(question.getOptions().stream()
                .map(StudentQuestionOptionResponse::fromEntity)
                .collect(Collectors.toList()));
        response.setMarks(question.getMarks());
        response.setNegativeMarks(question.getNegativeMarks());
        response.setOrder(question.getOrder());
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

    public List<StudentQuestionOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<StudentQuestionOptionResponse> options) {
        this.options = options;
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

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
}
