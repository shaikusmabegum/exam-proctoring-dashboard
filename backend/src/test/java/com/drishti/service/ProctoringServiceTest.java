package com.drishti.service;

import com.drishti.dto.request.ProctoringEventRequest;
import com.drishti.dto.request.ReviewUpdateRequest;
import com.drishti.dto.response.ProctoringEventResponse;
import com.drishti.dto.response.ProctoringReviewResponse;
import com.drishti.dto.response.ProctoringSessionResponse;
import com.drishti.dto.response.ProctoringSummaryResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.CameraStreamStatus;
import com.drishti.entity.EventSeverity;
import com.drishti.entity.EventSource;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.ProctoringEvent;
import com.drishti.entity.ProctoringEventType;
import com.drishti.entity.ProctoringReview;
import com.drishti.entity.ProctoringReviewStatus;
import com.drishti.entity.ProctoringSession;
import com.drishti.entity.ProctoringSessionStatus;
import com.drishti.entity.Role;
import com.drishti.entity.User;
import com.drishti.exception.RateLimitExceededException;
import com.drishti.proctoring.ai.FaceDetectionProvider;
import com.drishti.proctoring.ai.ProviderStatus;
import com.drishti.repository.ExamAttemptRepository;
import com.drishti.repository.ExamRepository;
import com.drishti.repository.ProctoringEventRepository;
import com.drishti.repository.ProctoringReviewRepository;
import com.drishti.repository.ProctoringSessionRepository;
import com.drishti.repository.UserRepository;
import com.drishti.security.ratelimit.RateLimitingService;
import com.drishti.service.sse.LecturerMonitoringEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProctoringServiceTest {

    @Mock
    private ProctoringSessionRepository proctoringSessionRepository;

    @Mock
    private ProctoringEventRepository proctoringEventRepository;

    @Mock
    private ProctoringReviewRepository proctoringReviewRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamAttemptRepository examAttemptRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private LecturerMonitoringEventPublisher eventPublisher;

    @Mock
    private RateLimitingService rateLimitingService;

    @Mock
    private FaceDetectionProvider faceDetectionProvider;

    private ProctoringService proctoringService;

    private User student;
    private User lecturer;
    private Exam exam;
    private ExamAttempt attempt;
    private ProctoringSession activeSession;

    @BeforeEach
    void setUp() {
        proctoringService = new ProctoringServiceImpl(
                proctoringSessionRepository,
                proctoringEventRepository,
                proctoringReviewRepository,
                examRepository,
                examAttemptRepository,
                userRepository,
                auditLogService,
                eventPublisher,
                rateLimitingService,
                faceDetectionProvider
        );

        student = new User("Alice Student", "student@drishti.edu", "pass123", Role.STUDENT);
        student.setId("student-1");

        lecturer = new User("Dr. Smith", "prof@drishti.edu", "pass123", Role.LECTURER);
        lecturer.setId("lecturer-1");

        exam = new Exam();
        exam.setId("exam-1");
        exam.setTitle("AI & Ethics Midterm");
        exam.setLecturerId(lecturer.getId());

        attempt = new ExamAttempt();
        attempt.setId("attempt-1");
        attempt.setExamId(exam.getId());
        attempt.setStudentId(student.getId());
        attempt.setStatus(AttemptStatus.IN_PROGRESS);

        activeSession = new ProctoringSession(
                "attempt-1",
                student.getId(),
                student.getFullName(),
                student.getEmail(),
                exam.getId(),
                exam.getTitle(),
                "BROWSER_CLIENT_INFERENCE",
                List.of("BROWSER_CLIENT_FACE_DETECTION")
        );
        activeSession.setId("session-1");
        activeSession.setStatus(ProctoringSessionStatus.ACTIVE);
    }

    @Test
    @DisplayName("startOrGetSession creates new proctoring session if none exists")
    void startOrGetSession_CreatesNew() {
        when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
        when(examAttemptRepository.findById("attempt-1")).thenReturn(Optional.of(attempt));
        when(examRepository.findById(exam.getId())).thenReturn(Optional.of(exam));
        when(proctoringSessionRepository.findByAttemptId("attempt-1")).thenReturn(Optional.empty());
        when(faceDetectionProvider.getProviderStatus()).thenReturn(
                new ProviderStatus("BROWSER_CLIENT_INFERENCE", true, "Active", List.of("FACE_DETECTION"))
        );
        when(proctoringSessionRepository.save(any(ProctoringSession.class))).thenAnswer(i -> {
            ProctoringSession s = i.getArgument(0);
            s.setId("new-session-id");
            return s;
        });

        ProctoringSessionResponse response = proctoringService.startOrGetSession(student.getEmail(), "attempt-1");

        assertNotNull(response);
        assertEquals("new-session-id", response.getId());
        assertEquals(ProctoringSessionStatus.ACTIVE, response.getStatus());
        verify(proctoringSessionRepository).save(any(ProctoringSession.class));
        verify(auditLogService).logAction(eq("student-1"), eq("student@drishti.edu"), eq("PROCTORING_SESSION_START"), anyString(), anyString(), eq("SUCCESS"), any(), any(), any());
        verify(eventPublisher).publishEvent(eq(exam.getId()), any());
    }

    @Test
    @DisplayName("startOrGetSession denies access if attempt does not belong to student")
    void startOrGetSession_DeniesUnauthorizedStudent() {
        attempt.setStudentId("different-student");
        when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
        when(examAttemptRepository.findById("attempt-1")).thenReturn(Optional.of(attempt));

        assertThrows(AccessDeniedException.class, () ->
                proctoringService.startOrGetSession(student.getEmail(), "attempt-1"));
    }

    @Test
    @DisplayName("recordHeartbeat updates heartbeat time when under rate limit")
    void recordHeartbeat_Success() {
        when(rateLimitingService.tryAcquire(anyString(), anyInt(), anyDouble())).thenReturn(true);
        when(proctoringSessionRepository.findById("session-1")).thenReturn(Optional.of(activeSession));

        assertDoesNotThrow(() -> proctoringService.recordHeartbeat(student.getEmail(), "session-1"));

        verify(proctoringSessionRepository).save(activeSession);
    }

    @Test
    @DisplayName("recordHeartbeat throws RateLimitExceededException when rate limited")
    void recordHeartbeat_RateLimited() {
        when(rateLimitingService.tryAcquire(anyString(), anyInt(), anyDouble())).thenReturn(false);

        assertThrows(RateLimitExceededException.class, () ->
                proctoringService.recordHeartbeat(student.getEmail(), "session-1"));
        verify(proctoringSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateCameraStatus modifies stream status and increments violations if interrupted")
    void updateCameraStatus_Success() {
        when(proctoringSessionRepository.findById("session-1")).thenReturn(Optional.of(activeSession));
        when(proctoringSessionRepository.save(any(ProctoringSession.class))).thenReturn(activeSession);

        ProctoringSessionResponse res = proctoringService.updateCameraStatus(
                student.getEmail(), "session-1", CameraStreamStatus.STREAM_INTERRUPTED);

        assertNotNull(res);
        assertEquals(CameraStreamStatus.STREAM_INTERRUPTED, activeSession.getCameraStatus());
        assertEquals(1, activeSession.getViolationCount());
        verify(eventPublisher).publishEvent(eq(exam.getId()), any());
    }

    @Test
    @DisplayName("ingestEvents rejects batch exceeding 20 items")
    void ingestEvents_RejectsLargeBatch() {
        List<ProctoringEventRequest> largeBatch = Collections.nCopies(21, new ProctoringEventRequest(
                ProctoringEventType.EXAM_STARTED, Instant.now(), null, null));

        assertThrows(IllegalArgumentException.class, () ->
                proctoringService.ingestEvents(student.getEmail(), "session-1", largeBatch));
    }

    @Test
    @DisplayName("ingestEvents processes valid events, detects critical violations and auto-triggers review")
    void ingestEvents_ProcessesAndTriggersReview() {
        when(rateLimitingService.tryAcquire(anyString(), anyInt(), anyDouble())).thenReturn(true);
        when(proctoringSessionRepository.findById("session-1")).thenReturn(Optional.of(activeSession));
        when(proctoringReviewRepository.findBySessionId("session-1")).thenReturn(Optional.empty());
        when(proctoringEventRepository.save(any(ProctoringEvent.class))).thenAnswer(i -> {
            ProctoringEvent e = i.getArgument(0);
            e.setId("evt-1");
            return e;
        });

        ProctoringEventRequest eventReq = new ProctoringEventRequest(
                ProctoringEventType.MULTIPLE_FACES_DETECTED,
                Instant.now(),
                "idemp-123",
                Map.of("confidence", 0.95)
        );

        List<ProctoringEventResponse> responses = proctoringService.ingestEvents(
                student.getEmail(), "session-1", List.of(eventReq));

        assertEquals(1, responses.size());
        assertEquals(EventSeverity.CRITICAL, responses.get(0).getSeverity());
        assertEquals(EventSource.BROWSER_REPORTED, responses.get(0).getSource());

        // Verify automated review creation
        ArgumentCaptor<ProctoringReview> reviewCaptor = ArgumentCaptor.forClass(ProctoringReview.class);
        verify(proctoringReviewRepository).save(reviewCaptor.capture());
        ProctoringReview savedReview = reviewCaptor.getValue();
        assertEquals(ProctoringReviewStatus.OPEN, savedReview.getStatus());
        assertEquals("MULTIPLE_FACES_DETECTED", savedReview.getViolationCategory());
        assertEquals(EventSeverity.CRITICAL, savedReview.getSeverity());

        // Verify broadcast
        verify(eventPublisher).publishEvent(eq(exam.getId()), any(ProctoringEventResponse.class));
    }

    @Test
    @DisplayName("ingestEvents performs idempotent deduplication on repeated idempotencyKey")
    void ingestEvents_IdempotentDeduplication() {
        when(rateLimitingService.tryAcquire(anyString(), anyInt(), anyDouble())).thenReturn(true);
        when(proctoringSessionRepository.findById("session-1")).thenReturn(Optional.of(activeSession));

        ProctoringEvent existingEvent = new ProctoringEvent();
        existingEvent.setId("existing-evt-id");
        existingEvent.setEventType(ProctoringEventType.TAB_VISIBILITY_CHANGED);
        when(proctoringEventRepository.findBySessionIdAndIdempotencyKey("session-1", "idemp-dup"))
                .thenReturn(Optional.of(existingEvent));

        ProctoringEventRequest duplicateReq = new ProctoringEventRequest(
                ProctoringEventType.TAB_VISIBILITY_CHANGED, Instant.now(), "idemp-dup", null);

        List<ProctoringEventResponse> responses = proctoringService.ingestEvents(
                student.getEmail(), "session-1", List.of(duplicateReq));

        assertEquals(1, responses.size());
        assertEquals("existing-evt-id", responses.get(0).getId());
        verify(proctoringEventRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateReview allows lecturer to record final incident verdict")
    void updateReview_LecturerVerdict() {
        ProctoringReview review = new ProctoringReview();
        review.setId("rev-1");
        review.setExamId(exam.getId());
        review.setStatus(ProctoringReviewStatus.OPEN);

        when(userRepository.findByEmail(lecturer.getEmail())).thenReturn(Optional.of(lecturer));
        when(proctoringReviewRepository.findById("rev-1")).thenReturn(Optional.of(review));
        when(examRepository.findById(exam.getId())).thenReturn(Optional.of(exam));
        when(proctoringReviewRepository.save(any(ProctoringReview.class))).thenReturn(review);

        ReviewUpdateRequest request = new ReviewUpdateRequest(
                ProctoringReviewStatus.CONFIRMED,
                "Student was indeed conversing with another individual",
                "Secondary face confirmed in multiple consecutive camera snapshots"
        );

        ProctoringReviewResponse res = proctoringService.updateReview(lecturer.getEmail(), "rev-1", request);

        assertNotNull(res);
        assertEquals(ProctoringReviewStatus.CONFIRMED, review.getStatus());
        assertEquals(lecturer.getId(), review.getReviewerId());
        verify(auditLogService).logAction(eq("lecturer-1"), eq("prof@drishti.edu"), eq("PROCTORING_REVIEW_UPDATE"), anyString(), eq("rev-1"), eq("SUCCESS"), any(), any(), any());
    }
}
