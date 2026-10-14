package com.drishti.service;

import com.drishti.entity.EvaluationStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.Question;
import com.drishti.entity.QuestionOption;
import com.drishti.entity.QuestionType;
import com.drishti.entity.StudentAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EvaluationServiceImpl implements EvaluationService {

    private static final Logger log = LoggerFactory.getLogger(EvaluationServiceImpl.class);

    @Override
    public ExamAttempt evaluateAttempt(ExamAttempt attempt, Exam exam) {
        if (attempt == null || exam == null) {
            throw new IllegalArgumentException("Attempt and Exam must not be null for evaluation");
        }

        log.info("Starting automated evaluation for attempt ID: [{}] on exam: [{}]", attempt.getId(), exam.getTitle());

        double totalScore = 0.0;
        double maxExamMarks = exam.getTotalMarks() > 0 ? exam.getTotalMarks() : exam.getQuestions().stream().mapToDouble(Question::getMarks).sum();
        boolean requiresManualGrading = false;

        Map<String, StudentAnswer> studentAnswers = attempt.getAnswers();

        for (Question question : exam.getQuestions()) {
            StudentAnswer studentAnswer = studentAnswers != null ? studentAnswers.get(question.getId()) : null;
            double questionMarks = question.getMarks();
            double negativeMarks = exam.isNegativeMarking()
                    ? (question.getNegativeMarks() > 0 ? question.getNegativeMarks() : exam.getNegativeMarksPerQuestion())
                    : 0.0;

            if (studentAnswer == null) {
                // Question unanswered - 0 marks, not penalised with negative marks
                continue;
            }

            boolean isAnswered = (studentAnswer.getSelectedOptionIds() != null && !studentAnswer.getSelectedOptionIds().isEmpty())
                    || (studentAnswer.getTextAnswer() != null && !studentAnswer.getTextAnswer().trim().isEmpty());

            if (!isAnswered) {
                studentAnswer.setAwardedMarks(0.0);
                studentAnswer.setIsCorrect(false);
                continue;
            }

            if (question.getType() == QuestionType.SINGLE_CHOICE) {
                Set<String> correctOptionIds = question.getOptions().stream()
                        .filter(QuestionOption::isCorrect)
                        .map(QuestionOption::getId)
                        .collect(Collectors.toSet());

                Set<String> selectedOptionIds = studentAnswer.getSelectedOptionIds();

                if (selectedOptionIds != null && selectedOptionIds.size() == 1 && correctOptionIds.equals(selectedOptionIds)) {
                    studentAnswer.setAwardedMarks(questionMarks);
                    studentAnswer.setIsCorrect(true);
                    totalScore += questionMarks;
                } else {
                    double deduction = negativeMarks > 0 ? -negativeMarks : 0.0;
                    studentAnswer.setAwardedMarks(deduction);
                    studentAnswer.setIsCorrect(false);
                    totalScore += deduction;
                }
            } else if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                Set<String> correctOptionIds = question.getOptions().stream()
                        .filter(QuestionOption::isCorrect)
                        .map(QuestionOption::getId)
                        .collect(Collectors.toSet());

                Set<String> selectedOptionIds = studentAnswer.getSelectedOptionIds();

                // All-or-Nothing evaluation policy for multiple choice
                if (selectedOptionIds != null && !selectedOptionIds.isEmpty() && correctOptionIds.equals(selectedOptionIds)) {
                    studentAnswer.setAwardedMarks(questionMarks);
                    studentAnswer.setIsCorrect(true);
                    totalScore += questionMarks;
                } else {
                    double deduction = negativeMarks > 0 ? -negativeMarks : 0.0;
                    studentAnswer.setAwardedMarks(deduction);
                    studentAnswer.setIsCorrect(false);
                    totalScore += deduction;
                }
            } else if (question.getType() == QuestionType.TRUE_FALSE) {
                // Check if student selected an option or gave a text answer
                String correctValue = question.getCorrectAnswerText() != null
                        ? question.getCorrectAnswerText().trim().toLowerCase(Locale.ROOT)
                        : null;

                // Also check options if options are defined for TRUE_FALSE
                Set<String> correctOptionIds = question.getOptions().stream()
                        .filter(QuestionOption::isCorrect)
                        .map(QuestionOption::getId)
                        .collect(Collectors.toSet());

                boolean isCorrect = false;

                if (!correctOptionIds.isEmpty() && studentAnswer.getSelectedOptionIds() != null) {
                    isCorrect = correctOptionIds.equals(studentAnswer.getSelectedOptionIds());
                } else if (correctValue != null && studentAnswer.getTextAnswer() != null) {
                    isCorrect = correctValue.equalsIgnoreCase(studentAnswer.getTextAnswer().trim());
                }

                if (isCorrect) {
                    studentAnswer.setAwardedMarks(questionMarks);
                    studentAnswer.setIsCorrect(true);
                    totalScore += questionMarks;
                } else {
                    double deduction = negativeMarks > 0 ? -negativeMarks : 0.0;
                    studentAnswer.setAwardedMarks(deduction);
                    studentAnswer.setIsCorrect(false);
                    totalScore += deduction;
                }
            } else if (question.getType() == QuestionType.SHORT_ANSWER) {
                String acceptedAnswer = question.getCorrectAnswerText();
                String studentText = studentAnswer.getTextAnswer();

                if (acceptedAnswer != null && !acceptedAnswer.trim().isEmpty() && studentText != null) {
                    String normalizedAccepted = acceptedAnswer.trim().toLowerCase(Locale.ROOT);
                    String normalizedStudent = studentText.trim().toLowerCase(Locale.ROOT);

                    if (normalizedAccepted.equals(normalizedStudent)) {
                        studentAnswer.setAwardedMarks(questionMarks);
                        studentAnswer.setIsCorrect(true);
                        totalScore += questionMarks;
                    } else {
                        // Unmatched short answer - marked for manual instructor grading
                        studentAnswer.setAwardedMarks(0.0);
                        studentAnswer.setIsCorrect(false);
                        requiresManualGrading = true;
                    }
                } else {
                    // Requires manual grading by lecturer
                    studentAnswer.setAwardedMarks(0.0);
                    studentAnswer.setIsCorrect(null);
                    requiresManualGrading = true;
                }
            } else {
                log.warn("Unknown question type: {}", question.getType());
                studentAnswer.setAwardedMarks(0.0);
                studentAnswer.setIsCorrect(false);
            }
        }

        // Bound total score (minimum 0.0)
        double finalScore = Math.max(0.0, totalScore);
        BigDecimal roundedScore = BigDecimal.valueOf(finalScore).setScale(2, RoundingMode.HALF_UP);
        attempt.setScore(roundedScore.doubleValue());
        attempt.setTotalMarks(maxExamMarks);

        double percentage = maxExamMarks > 0
                ? (roundedScore.doubleValue() / maxExamMarks) * 100.0
                : 0.0;
        BigDecimal roundedPercentage = BigDecimal.valueOf(percentage).setScale(2, RoundingMode.HALF_UP);
        attempt.setPercentage(roundedPercentage.doubleValue());

        attempt.setPassed(roundedScore.doubleValue() >= exam.getPassingMarks());

        if (requiresManualGrading) {
            attempt.setEvaluationStatus(EvaluationStatus.REQUIRES_MANUAL_GRADING);
        } else {
            attempt.setEvaluationStatus(EvaluationStatus.COMPLETED);
        }

        attempt.setUpdatedAt(Instant.now());
        log.info("Evaluation complete for attempt ID: [{}]. Final Score: {}/{}, Percentage: {}%, Status: {}",
                attempt.getId(), attempt.getScore(), maxExamMarks, attempt.getPercentage(), attempt.getEvaluationStatus());

        return attempt;
    }
}
