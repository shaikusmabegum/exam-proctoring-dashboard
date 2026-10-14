package com.drishti.dto.response;

import com.drishti.entity.QuestionType;

import java.util.List;
import java.util.Set;

public class QuestionResultDetail {

    private String questionId;
    private String questionText;
    private QuestionType type;
    private double maxMarks;
    private Double awardedMarks;
    private Boolean isCorrect;
    private Set<String> studentSelectedOptionIds;
    private String studentTextAnswer;
    private List<QuestionOptionResponse> options; // Released with correctness if resultsPublished is true
    private String correctAnswerText;
    private String explanation;

    public QuestionResultDetail() {
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
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

    public double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public Double getAwardedMarks() {
        return awardedMarks;
    }

    public void setAwardedMarks(Double awardedMarks) {
        this.awardedMarks = awardedMarks;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public Set<String> getStudentSelectedOptionIds() {
        return studentSelectedOptionIds;
    }

    public void setStudentSelectedOptionIds(Set<String> studentSelectedOptionIds) {
        this.studentSelectedOptionIds = studentSelectedOptionIds;
    }

    public String getStudentTextAnswer() {
        return studentTextAnswer;
    }

    public void setStudentTextAnswer(String studentTextAnswer) {
        this.studentTextAnswer = studentTextAnswer;
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

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
