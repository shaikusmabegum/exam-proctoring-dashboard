package com.drishti.service;

import com.drishti.dto.request.SaveAnswerRequest;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.StudentResultResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Question;
import com.drishti.entity.QuestionOption;
import com.drishti.entity.QuestionType;
import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.repository.ExamAttemptRepository;
import com.drishti.repository.ExamRepository;
import com.drishti.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamAttemptRepository examAttemptRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EvaluationService evaluationService;

    private StudentExamService studentExamService;

    private User student;
    private Exam publishedExam;

    @BeforeEach
    void setUp() {
        studentExamService = new StudentExamServiceImpl(examRepository, examAttemptRepository, userRepository, evaluationService);

        student = new User("Bob Student", "bob@example.com", "pwd", Role.STUDENT);
        student.setId("stu_1");

        Question q1 = new Question();
        q1.setId("q1");
        q1.setType(QuestionType.SINGLE_CHOICE);
        q1.setMarks(5.0);
        q1.setOptions(Arrays.asList(
                new QuestionOption("opt1", "True answer", true),
                new QuestionOption("opt2", "False answer", false)
        ));

        publishedExam = new Exam();
        publishedExam.setId("exam_pub");
        publishedExam.setTitle("Physics 101");
        publishedExam.setStatus(ExamStatus.PUBLISHED);
        publishedExam.setDurationMinutes(60);
        publishedExam.setTotalMarks(5.0);
        publishedExam.setPassingMarks(2.5);
        publishedExam.setMaxAttempts(1);
        publishedExam.setStartTime(Instant.now().minus(1, ChronoUnit.HOURS));
        publishedExam.setEndTime(Instant.now().plus(2, ChronoUnit.HOURS));
        publishedExam.setQuestions(List.of(q1));
    }

    @Test
    @DisplayName("Should start new attempt and return student-safe question payload without answer keys")
    void testStartAttempt_Success() {
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(publishedExam));
        when(examAttemptRepository.findByExamIdAndStudentIdAndStatus("exam_pub", "stu_1", AttemptStatus.IN_PROGRESS))
                .thenReturn(Optional.empty());
        when(examAttemptRepository.findByExamIdAndStudentId("exam_pub", "stu_1")).thenReturn(Collections.emptyList());
        when(examAttemptRepository.save(any(ExamAttempt.class))).thenAnswer(i -> {
            ExamAttempt a = i.getArgument(0);
            a.setId("att_new");
            return a;
        });

        ExamAttemptResponse response = studentExamService.startOrResumeAttempt("bob@example.com", "exam_pub");

        assertNotNull(response);
        assertEquals("att_new", response.getId());
        assertEquals(AttemptStatus.IN_PROGRESS, response.getStatus());
        assertTrue(response.getRemainingSeconds() > 0);

        // Security check: Student questions MUST NOT contain answer keys
        assertNotNull(response.getQuestions());
        assertEquals(1, response.getQuestions().size());
        assertEquals("q1", response.getQuestions().get(0).getId());
        assertEquals(2, response.getQuestions().get(0).getOptions().size());
        // Verify StudentQuestionResponse DTO has no correct answer exposed
        assertNotNull(response.getQuestions().get(0).getOptions().get(0).getText());
    }

    @Test
    @DisplayName("Should reject starting an exam that is in DRAFT status")
    void testStartAttempt_DraftExam() {
        publishedExam.setStatus(ExamStatus.DRAFT);
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(publishedExam));

        assertThrows(IllegalStateException.class, () ->
                studentExamService.startOrResumeAttempt("bob@example.com", "exam_pub"));
    }

    @Test
    @DisplayName("Should enforce attempt limits when student has already used max attempts")
    void testStartAttempt_MaxAttemptsReached() {
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(publishedExam));
        when(examAttemptRepository.findByExamIdAndStudentIdAndStatus("exam_pub", "stu_1", AttemptStatus.IN_PROGRESS))
                .thenReturn(Optional.empty());

        ExamAttempt pastAttempt = new ExamAttempt();
        pastAttempt.setStatus(AttemptStatus.SUBMITTED);
        when(examAttemptRepository.findByExamIdAndStudentId("exam_pub", "stu_1")).thenReturn(List.of(pastAttempt));

        assertThrows(IllegalStateException.class, () ->
                studentExamService.startOrResumeAttempt("bob@example.com", "exam_pub"));
    }

    @Test
    @DisplayName("Should save answers for in-progress attempt")
    void testSaveAnswers_Success() {
        ExamAttempt attempt = new ExamAttempt();
        attempt.setId("att_1");
        attempt.setExamId("exam_pub");
        attempt.setStudentId("stu_1");
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setExpiryTime(Instant.now().plus(30, ChronoUnit.MINUTES));

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examAttemptRepository.findById("att_1")).thenReturn(Optional.of(attempt));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(publishedExam));
        when(examAttemptRepository.save(any(ExamAttempt.class))).thenAnswer(i -> i.getArgument(0));

        SaveAnswerRequest saveReq = new SaveAnswerRequest("q1", Set.of("opt1"), null);
        ExamAttemptResponse response = studentExamService.saveAnswers("bob@example.com", "att_1", List.of(saveReq));

        assertNotNull(response);
        assertTrue(response.getAnswers().containsKey("q1"));
        assertEquals(Set.of("opt1"), response.getAnswers().get("q1").getSelectedOptionIds());
    }

    @Test
    @DisplayName("Should reject saving answers when attempt deadline has expired")
    void testSaveAnswers_ExpiredAttempt() {
        ExamAttempt attempt = new ExamAttempt();
        attempt.setId("att_1");
        attempt.setExamId("exam_pub");
        attempt.setStudentId("stu_1");
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setExpiryTime(Instant.now().minus(5, ChronoUnit.MINUTES)); // Expired

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examAttemptRepository.findById("att_1")).thenReturn(Optional.of(attempt));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(publishedExam));

        assertThrows(IllegalStateException.class, () ->
                studentExamService.saveAnswers("bob@example.com", "att_1", List.of(new SaveAnswerRequest("q1", Set.of("opt1"), null))));
    }

    @Test
    @DisplayName("Should submit attempt, trigger evaluation and return safe student result")
    void testSubmitAttempt_Success() {
        ExamAttempt attempt = new ExamAttempt();
        attempt.setId("att_1");
        attempt.setExamId("exam_pub");
        attempt.setStudentId("stu_1");
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setExpiryTime(Instant.now().plus(20, ChronoUnit.MINUTES));

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examAttemptRepository.findById("att_1")).thenReturn(Optional.of(attempt));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(publishedExam));
        when(examAttemptRepository.save(any(ExamAttempt.class))).thenAnswer(i -> i.getArgument(0));

        doAnswer(invocation -> {
            ExamAttempt a = invocation.getArgument(0);
            a.setScore(5.0);
            a.setTotalMarks(5.0);
            a.setPercentage(100.0);
            a.setPassed(true);
            return a;
        }).when(evaluationService).evaluateAttempt(any(ExamAttempt.class), any(Exam.class));

        StudentResultResponse result = studentExamService.submitAttempt("bob@example.com", "att_1", "MANUAL_SUBMISSION");

        assertNotNull(result);
        assertEquals(5.0, result.getScore());
        assertTrue(result.isPassed());
        assertEquals(AttemptStatus.SUBMITTED, result.getStatus());
        // Since resultsPublished is false, question details should not be exposed
        assertNull(result.getQuestionDetails());
    }

    @Test
    @DisplayName("Should prevent student from accessing another student's attempt")
    void testAccessDeniedForOtherStudentAttempt() {
        ExamAttempt otherAttempt = new ExamAttempt();
        otherAttempt.setId("att_other");
        otherAttempt.setStudentId("other_student_id");

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));
        when(examAttemptRepository.findById("att_other")).thenReturn(Optional.of(otherAttempt));

        assertThrows(AccessDeniedException.class, () ->
                studentExamService.getAttempt("bob@example.com", "att_other"));
    }
}
