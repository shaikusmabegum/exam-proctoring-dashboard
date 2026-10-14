package com.drishti.service;

import com.drishti.entity.AttemptStatus;
import com.drishti.entity.EvaluationStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.Question;
import com.drishti.entity.QuestionOption;
import com.drishti.entity.QuestionType;
import com.drishti.entity.StudentAnswer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class EvaluationServiceTest {

    private EvaluationService evaluationService;

    @BeforeEach
    void setUp() {
        evaluationService = new EvaluationServiceImpl();
    }

    @Test
    @DisplayName("Should evaluate Single Choice question correctly with full marks on correct answer")
    void testEvaluateSingleChoice_Correct() {
        Question q1 = new Question();
        q1.setId("q1");
        q1.setType(QuestionType.SINGLE_CHOICE);
        q1.setMarks(2.0);
        q1.setOptions(Arrays.asList(
                new QuestionOption("opt1", "Option A", true),
                new QuestionOption("opt2", "Option B", false)
        ));

        Exam exam = new Exam();
        exam.setQuestions(List.of(q1));
        exam.setTotalMarks(2.0);
        exam.setPassingMarks(1.0);

        ExamAttempt attempt = new ExamAttempt();
        attempt.setId("att1");
        Map<String, StudentAnswer> answers = new HashMap<>();
        answers.put("q1", new StudentAnswer("q1", Set.of("opt1"), null));
        attempt.setAnswers(answers);

        ExamAttempt evaluated = evaluationService.evaluateAttempt(attempt, exam);

        assertEquals(2.0, evaluated.getScore());
        assertEquals(100.0, evaluated.getPercentage());
        assertTrue(evaluated.isPassed());
        assertEquals(EvaluationStatus.COMPLETED, evaluated.getEvaluationStatus());
        assertTrue(evaluated.getAnswers().get("q1").getIsCorrect());
        assertEquals(2.0, evaluated.getAnswers().get("q1").getAwardedMarks());
    }

    @Test
    @DisplayName("Should apply negative marking when configured and single choice answer is wrong")
    void testEvaluateSingleChoice_IncorrectWithNegativeMarking() {
        Question q1 = new Question();
        q1.setId("q1");
        q1.setType(QuestionType.SINGLE_CHOICE);
        q1.setMarks(4.0);
        q1.setNegativeMarks(1.0);
        q1.setOptions(Arrays.asList(
                new QuestionOption("opt1", "Option A", true),
                new QuestionOption("opt2", "Option B", false)
        ));

        Exam exam = new Exam();
        exam.setQuestions(List.of(q1));
        exam.setTotalMarks(4.0);
        exam.setPassingMarks(2.0);
        exam.setNegativeMarking(true);

        ExamAttempt attempt = new ExamAttempt();
        attempt.setId("att1");
        Map<String, StudentAnswer> answers = new HashMap<>();
        answers.put("q1", new StudentAnswer("q1", Set.of("opt2"), null)); // Wrong answer
        attempt.setAnswers(answers);

        ExamAttempt evaluated = evaluationService.evaluateAttempt(attempt, exam);

        assertEquals(0.0, evaluated.getScore()); // Minimum bounded score is 0.0
        assertEquals(0.0, evaluated.getPercentage());
        assertFalse(evaluated.isPassed());
        assertEquals(EvaluationStatus.COMPLETED, evaluated.getEvaluationStatus());
        assertFalse(evaluated.getAnswers().get("q1").getIsCorrect());
        assertEquals(-1.0, evaluated.getAnswers().get("q1").getAwardedMarks());
    }

    @Test
    @DisplayName("Should evaluate Multiple Choice question with all-or-nothing policy")
    void testEvaluateMultipleChoice() {
        Question q1 = new Question();
        q1.setId("q1");
        q1.setType(QuestionType.MULTIPLE_CHOICE);
        q1.setMarks(5.0);
        q1.setOptions(Arrays.asList(
                new QuestionOption("opt1", "Option A", true),
                new QuestionOption("opt2", "Option B", true),
                new QuestionOption("opt3", "Option C", false)
        ));

        Exam exam = new Exam();
        exam.setQuestions(List.of(q1));
        exam.setTotalMarks(5.0);
        exam.setPassingMarks(2.5);

        // Case A: Correct both options
        ExamAttempt attemptA = new ExamAttempt();
        attemptA.setAnswers(Map.of("q1", new StudentAnswer("q1", Set.of("opt1", "opt2"), null)));
        ExamAttempt evaluatedA = evaluationService.evaluateAttempt(attemptA, exam);
        assertEquals(5.0, evaluatedA.getScore());
        assertTrue(evaluatedA.getAnswers().get("q1").getIsCorrect());

        // Case B: Incomplete options (only 1 of 2 selected)
        ExamAttempt attemptB = new ExamAttempt();
        attemptB.setAnswers(Map.of("q1", new StudentAnswer("q1", Set.of("opt1"), null)));
        ExamAttempt evaluatedB = evaluationService.evaluateAttempt(attemptB, exam);
        assertEquals(0.0, evaluatedB.getScore());
        assertFalse(evaluatedB.getAnswers().get("q1").getIsCorrect());
    }

    @Test
    @DisplayName("Should evaluate True/False question successfully")
    void testEvaluateTrueFalse() {
        Question q1 = new Question();
        q1.setId("q1");
        q1.setType(QuestionType.TRUE_FALSE);
        q1.setMarks(1.0);
        q1.setCorrectAnswerText("true");

        Exam exam = new Exam();
        exam.setQuestions(List.of(q1));
        exam.setTotalMarks(1.0);
        exam.setPassingMarks(1.0);

        ExamAttempt attempt = new ExamAttempt();
        attempt.setAnswers(Map.of("q1", new StudentAnswer("q1", Collections.emptySet(), "TRUE")));

        ExamAttempt evaluated = evaluationService.evaluateAttempt(attempt, exam);
        assertEquals(1.0, evaluated.getScore());
        assertTrue(evaluated.isPassed());
    }

    @Test
    @DisplayName("Should flag short answer questions without exact deterministic match as REQUIRES_MANUAL_GRADING without fabricated marks")
    void testEvaluateShortAnswer_ManualGradingRequired() {
        Question q1 = new Question();
        q1.setId("q1");
        q1.setType(QuestionType.SHORT_ANSWER);
        q1.setMarks(10.0);
        q1.setCorrectAnswerText(null); // Open subjective question

        Exam exam = new Exam();
        exam.setQuestions(List.of(q1));
        exam.setTotalMarks(10.0);
        exam.setPassingMarks(5.0);

        ExamAttempt attempt = new ExamAttempt();
        attempt.setAnswers(Map.of("q1", new StudentAnswer("q1", Collections.emptySet(), "Detailed architectural explanation...")));

        ExamAttempt evaluated = evaluationService.evaluateAttempt(attempt, exam);

        assertEquals(0.0, evaluated.getScore());
        assertEquals(EvaluationStatus.REQUIRES_MANUAL_GRADING, evaluated.getEvaluationStatus());
        assertNull(evaluated.getAnswers().get("q1").getIsCorrect());
    }
}
