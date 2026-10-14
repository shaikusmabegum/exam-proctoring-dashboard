package com.drishti.service;

import com.drishti.dto.request.ExamCreateRequest;
import com.drishti.dto.request.ExamUpdateRequest;
import com.drishti.dto.request.QuestionCreateRequest;
import com.drishti.dto.request.QuestionOptionRequest;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.LecturerExamAnalyticsResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Question;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LecturerExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamAttemptRepository examAttemptRepository;

    @Mock
    private UserRepository userRepository;

    private LecturerExamService lecturerExamService;

    private User lecturer;

    @BeforeEach
    void setUp() {
        lecturerExamService = new LecturerExamServiceImpl(examRepository, examAttemptRepository, userRepository);

        lecturer = new User("Prof. Smith", "smith@drishti.edu", "pwd", Role.LECTURER);
        lecturer.setId("lec_1");
    }

    @Test
    @DisplayName("Should successfully create a draft exam for the lecturer")
    void testCreateExam_Success() {
        ExamCreateRequest request = new ExamCreateRequest();
        request.setTitle("Java Certification Exam");
        request.setCourseName("CS 101");
        request.setDurationMinutes(60);
        request.setPassingMarks(40.0);
        request.setStartTime(Instant.now().plus(1, ChronoUnit.DAYS));
        request.setEndTime(Instant.now().plus(2, ChronoUnit.DAYS));

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam e = invocation.getArgument(0);
            e.setId("exam_123");
            return e;
        });

        ExamResponse response = lecturerExamService.createExam("smith@drishti.edu", request);

        assertNotNull(response);
        assertEquals("exam_123", response.getId());
        assertEquals("Java Certification Exam", response.getTitle());
        assertEquals("lec_1", response.getLecturerId());
        assertEquals(ExamStatus.DRAFT, response.getStatus());
    }

    @Test
    @DisplayName("Should reject exam creation when start time is after end time")
    void testCreateExam_InvalidSchedule() {
        ExamCreateRequest request = new ExamCreateRequest();
        request.setTitle("Java Certification Exam");
        request.setCourseName("CS 101");
        request.setDurationMinutes(60);
        request.setPassingMarks(40.0);
        request.setStartTime(Instant.now().plus(2, ChronoUnit.DAYS));
        request.setEndTime(Instant.now().plus(1, ChronoUnit.DAYS)); // End before start

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));

        assertThrows(IllegalArgumentException.class, () -> lecturerExamService.createExam("smith@drishti.edu", request));
    }

    @Test
    @DisplayName("Should enforce ownership: throwing AccessDeniedException when accessing another lecturer's exam")
    void testOwnershipEnforcement() {
        Exam foreignExam = new Exam();
        foreignExam.setId("exam_foreign");
        foreignExam.setLecturerId("other_lecturer_id");

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_foreign")).thenReturn(Optional.of(foreignExam));

        assertThrows(AccessDeniedException.class, () ->
                lecturerExamService.getLecturerExamById("smith@drishti.edu", "exam_foreign"));
    }

    @Test
    @DisplayName("Should add a valid question to draft exam and update total marks")
    void testAddQuestion_Success() {
        Exam exam = new Exam();
        exam.setId("exam_1");
        exam.setLecturerId("lec_1");
        exam.setStatus(ExamStatus.DRAFT);
        exam.setQuestions(new ArrayList<>());

        QuestionCreateRequest qReq = new QuestionCreateRequest();
        qReq.setQuestionText("What is Polymorphism?");
        qReq.setType(QuestionType.SINGLE_CHOICE);
        qReq.setMarks(5.0);
        qReq.setOptions(Arrays.asList(
                new QuestionOptionRequest("1", "Many forms", true),
                new QuestionOptionRequest("2", "Single form", false)
        ));

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_1")).thenReturn(Optional.of(exam));
        when(examRepository.save(any(Exam.class))).thenAnswer(i -> i.getArgument(0));

        ExamResponse response = lecturerExamService.addQuestion("smith@drishti.edu", "exam_1", qReq);

        assertNotNull(response);
        assertEquals(1, response.getQuestionCount());
        assertEquals(5.0, response.getTotalMarks());
    }

    @Test
    @DisplayName("Should reject publishing an exam that has no questions")
    void testPublishExam_NoQuestions() {
        Exam exam = new Exam();
        exam.setId("exam_1");
        exam.setLecturerId("lec_1");
        exam.setStatus(ExamStatus.DRAFT);
        exam.setQuestions(new ArrayList<>());

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_1")).thenReturn(Optional.of(exam));

        assertThrows(IllegalStateException.class, () ->
                lecturerExamService.publishExam("smith@drishti.edu", "exam_1"));
    }

    @Test
    @DisplayName("Should calculate accurate analytics from attempts")
    void testGetExamAnalytics() {
        Exam exam = new Exam();
        exam.setId("exam_1");
        exam.setTitle("Midterm Exam");
        exam.setLecturerId("lec_1");
        exam.setTotalMarks(100.0);
        exam.setPassingMarks(50.0);

        ExamAttempt a1 = new ExamAttempt();
        a1.setStatus(AttemptStatus.SUBMITTED);
        a1.setScore(80.0);
        a1.setPercentage(80.0);
        a1.setPassed(true);

        ExamAttempt a2 = new ExamAttempt();
        a2.setStatus(AttemptStatus.SUBMITTED);
        a2.setScore(40.0);
        a2.setPercentage(40.0);
        a2.setPassed(false);

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_1")).thenReturn(Optional.of(exam));
        when(examAttemptRepository.findByExamId("exam_1")).thenReturn(List.of(a1, a2));

        LecturerExamAnalyticsResponse analytics = lecturerExamService.getExamAnalytics("smith@drishti.edu", "exam_1");

        assertNotNull(analytics);
        assertEquals(2, analytics.getTotalAttempts());
        assertEquals(2, analytics.getCompletedAttempts());
        assertEquals(60.0, analytics.getAverageScore());
        assertEquals(1, analytics.getPassCount());
        assertEquals(1, analytics.getFailCount());
        assertEquals(50.0, analytics.getPassRate());
    }

    @Test
    @DisplayName("Should successfully update settings of a published exam when no attempts exist")
    void testUpdateExam_PublishedExamSuccess() {
        Exam exam = new Exam();
        exam.setId("exam_pub");
        exam.setTitle("Old Title");
        exam.setCourseName("CS101");
        exam.setLecturerId("lec_1");
        exam.setStatus(ExamStatus.PUBLISHED);
        exam.setTotalMarks(50.0);
        exam.setPassingMarks(20.0);

        ExamUpdateRequest updateReq = new ExamUpdateRequest();
        updateReq.setTitle("Updated Title");
        updateReq.setCourseName("CS102");
        updateReq.setDurationMinutes(90);
        updateReq.setPassingMarks(25.0);
        updateReq.setStartTime(Instant.now().plus(1, ChronoUnit.HOURS));
        updateReq.setEndTime(Instant.now().plus(3, ChronoUnit.HOURS));

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(exam));
        when(examAttemptRepository.countByExamId("exam_pub")).thenReturn(0L);
        when(examRepository.save(any(Exam.class))).thenAnswer(i -> i.getArgument(0));

        ExamResponse response = lecturerExamService.updateExam("smith@drishti.edu", "exam_pub", updateReq);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("CS102", response.getCourseName());
        assertEquals(90, response.getDurationMinutes());
        assertEquals(25.0, response.getPassingMarks());
    }

    @Test
    @DisplayName("Should revert a published exam to draft mode if no attempts exist")
    void testUnpublishExam_Success() {
        Exam exam = new Exam();
        exam.setId("exam_pub");
        exam.setLecturerId("lec_1");
        exam.setStatus(ExamStatus.PUBLISHED);

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(exam));
        when(examAttemptRepository.countByExamId("exam_pub")).thenReturn(0L);
        when(examRepository.save(any(Exam.class))).thenAnswer(i -> i.getArgument(0));

        ExamResponse response = lecturerExamService.unpublishExam("smith@drishti.edu", "exam_pub");

        assertNotNull(response);
        assertEquals(ExamStatus.DRAFT, response.getStatus());
    }

    @Test
    @DisplayName("Should reject unpublishing when student attempts already exist")
    void testUnpublishExam_ThrowsWhenAttemptsExist() {
        Exam exam = new Exam();
        exam.setId("exam_pub");
        exam.setLecturerId("lec_1");
        exam.setStatus(ExamStatus.PUBLISHED);

        when(userRepository.findByEmail("smith@drishti.edu")).thenReturn(Optional.of(lecturer));
        when(examRepository.findById("exam_pub")).thenReturn(Optional.of(exam));
        when(examAttemptRepository.countByExamId("exam_pub")).thenReturn(3L);

        assertThrows(IllegalStateException.class, () ->
                lecturerExamService.unpublishExam("smith@drishti.edu", "exam_pub"));
    }
}
