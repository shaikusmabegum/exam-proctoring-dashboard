package com.drishti.service;

import com.drishti.dto.common.PageResponse;
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
import com.drishti.entity.User;
import com.drishti.exception.RateLimitExceededException;
import com.drishti.exception.ResourceNotFoundException;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProctoringServiceImpl implements ProctoringService {

    private static final Logger log = LoggerFactory.getLogger(ProctoringServiceImpl.class);

    private final ProctoringSessionRepository proctoringSessionRepository;
    private final ProctoringEventRepository proctoringEventRepository;
    private final ProctoringReviewRepository proctoringReviewRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final LecturerMonitoringEventPublisher eventPublisher;
    private final RateLimitingService rateLimitingService;
    private final FaceDetectionProvider faceDetectionProvider;

    public ProctoringServiceImpl(
            ProctoringSessionRepository proctoringSessionRepository,
            ProctoringEventRepository proctoringEventRepository,
            ProctoringReviewRepository proctoringReviewRepository,
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository,
            UserRepository userRepository,
            AuditLogService auditLogService,
            LecturerMonitoringEventPublisher eventPublisher,
            RateLimitingService rateLimitingService,
            FaceDetectionProvider faceDetectionProvider) {
        this.proctoringSessionRepository = proctoringSessionRepository;
        this.proctoringEventRepository = proctoringEventRepository;
        this.proctoringReviewRepository = proctoringReviewRepository;
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
        this.rateLimitingService = rateLimitingService;
        this.faceDetectionProvider = faceDetectionProvider;
    }

    @Override
    public ProctoringSessionResponse startOrGetSession(String studentEmail, String attemptId) {
        User student = getUserByEmail(studentEmail);
        ExamAttempt attempt = getAttempt(attemptId);

        if (!attempt.getStudentId().equals(student.getId())) {
            throw new AccessDeniedException("You are not authorized to start a proctoring session for this attempt");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Cannot start proctoring session: attempt is in " + attempt.getStatus() + " status");
        }

        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", attempt.getExamId()));

        Optional<ProctoringSession> existingOpt = proctoringSessionRepository.findByAttemptId(attemptId);
        if (existingOpt.isPresent()) {
            ProctoringSession existing = existingOpt.get();
            if (existing.getStatus() == ProctoringSessionStatus.INITIALIZING ||
                    existing.getStatus() == ProctoringSessionStatus.CONNECTION_INTERRUPTED) {
                existing.setStatus(ProctoringSessionStatus.ACTIVE);
                existing.setLastHeartbeatTime(Instant.now());
                existing = proctoringSessionRepository.save(existing);
            }
            return ProctoringSessionResponse.fromEntity(existing);
        }

        ProviderStatus status = faceDetectionProvider.getProviderStatus();
        ProctoringSession session = new ProctoringSession(
                attemptId,
                student.getId(),
                student.getFullName(),
                student.getEmail(),
                exam.getId(),
                exam.getTitle(),
                status.getProviderName(),
                status.getSupportedCapabilities()
        );
        session.setStatus(ProctoringSessionStatus.ACTIVE);
        session = proctoringSessionRepository.save(session);

        auditLogService.logAction(
                student.getId(),
                student.getEmail(),
                "PROCTORING_SESSION_START",
                "ProctoringSession",
                session.getId(),
                "SUCCESS",
                null,
                null,
                Map.of("examId", exam.getId(), "attemptId", attemptId)
        );

        eventPublisher.publishEvent(exam.getId(), Map.of(
                "eventType", "SESSION_STARTED",
                "sessionId", session.getId(),
                "studentId", student.getId(),
                "studentName", student.getFullName(),
                "studentEmail", student.getEmail(),
                "attemptId", attemptId
        ));

        return ProctoringSessionResponse.fromEntity(session);
    }

    @Override
    public ProctoringSessionResponse getSession(String studentEmail, String attemptId) {
        User student = getUserByEmail(studentEmail);
        ExamAttempt attempt = getAttempt(attemptId);

        if (!attempt.getStudentId().equals(student.getId())) {
            throw new AccessDeniedException("You are not authorized to access this proctoring session");
        }

        ProctoringSession session = proctoringSessionRepository.findByAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "attemptId", attemptId));

        return ProctoringSessionResponse.fromEntity(session);
    }

    @Override
    public void recordHeartbeat(String studentEmail, String sessionId) {
        // Rate limit: 12 tokens capacity, refills at 6 per minute (prevents spamming faster than 10s interval)
        if (!rateLimitingService.tryAcquire("heartbeat:" + sessionId, 12, 6.0)) {
            throw new RateLimitExceededException("Heartbeat rate limit exceeded. Please wait before retrying.");
        }

        ProctoringSession session = proctoringSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "id", sessionId));

        validateStudentOwnership(studentEmail, session);

        session.setLastHeartbeatTime(Instant.now());
        if (session.getStatus() == ProctoringSessionStatus.CONNECTION_INTERRUPTED ||
                session.getStatus() == ProctoringSessionStatus.INITIALIZING) {
            session.setStatus(ProctoringSessionStatus.ACTIVE);
        }

        proctoringSessionRepository.save(session);
    }

    @Override
    public ProctoringSessionResponse updateCameraStatus(String studentEmail, String sessionId, CameraStreamStatus status) {
        ProctoringSession session = proctoringSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "id", sessionId));

        validateStudentOwnership(studentEmail, session);

        session.setCameraStatus(status);
        if (status == CameraStreamStatus.PERMISSION_DENIED || status == CameraStreamStatus.STREAM_INTERRUPTED) {
            session.setViolationCount(session.getViolationCount() + 1);
        }

        session = proctoringSessionRepository.save(session);

        eventPublisher.publishEvent(session.getExamId(), Map.of(
                "eventType", "CAMERA_STATUS_CHANGED",
                "sessionId", session.getId(),
                "cameraStatus", status.name(),
                "studentId", session.getStudentId()
        ));

        return ProctoringSessionResponse.fromEntity(session);
    }

    @Override
    public List<ProctoringEventResponse> ingestEvents(String studentEmail, String sessionId, List<ProctoringEventRequest> eventRequests) {
        if (eventRequests == null || eventRequests.isEmpty()) {
            return new ArrayList<>();
        }

        if (eventRequests.size() > 20) {
            throw new IllegalArgumentException("Batch size limit exceeded: maximum 20 events per ingestion call");
        }

        // Rate limit: 30 tokens capacity, refills at 30 per minute
        if (!rateLimitingService.tryAcquire("events:" + sessionId, 30, 30.0)) {
            throw new RateLimitExceededException("Proctoring event ingestion rate limit exceeded.");
        }

        ProctoringSession session = proctoringSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "id", sessionId));

        validateStudentOwnership(studentEmail, session);

        List<ProctoringEventResponse> responses = new ArrayList<>();
        long newViolations = 0;

        for (ProctoringEventRequest req : eventRequests) {
            // Check idempotency
            if (req.getIdempotencyKey() != null && !req.getIdempotencyKey().trim().isEmpty()) {
                Optional<ProctoringEvent> existing = proctoringEventRepository
                        .findBySessionIdAndIdempotencyKey(sessionId, req.getIdempotencyKey().trim());
                if (existing.isPresent()) {
                    responses.add(ProctoringEventResponse.fromEntity(existing.get()));
                    continue;
                }
            }

            EventSeverity severity = determineSeverity(req.getEventType());
            EventSource source = EventSource.BROWSER_REPORTED;

            ProctoringEvent event = new ProctoringEvent(
                    sessionId,
                    session.getAttemptId(),
                    session.getStudentId(),
                    session.getExamId(),
                    req.getEventType(),
                    source,
                    req.getEventTimestamp(),
                    severity,
                    req.getMetadata(),
                    req.getIdempotencyKey()
            );
            event.setProcessed(true);
            event = proctoringEventRepository.save(event);

            if (severity == EventSeverity.HIGH || severity == EventSeverity.CRITICAL) {
                newViolations++;
                triggerAutomatedReview(session, req.getEventType(), severity);
            }

            ProctoringEventResponse response = ProctoringEventResponse.fromEntity(event);
            responses.add(response);

            // Publish to live lecturer stream
            eventPublisher.publishEvent(session.getExamId(), response);
        }

        session.setEventCount(session.getEventCount() + responses.size());
        session.setViolationCount(session.getViolationCount() + newViolations);
        session.setLastHeartbeatTime(Instant.now());
        proctoringSessionRepository.save(session);

        return responses;
    }

    @Override
    public ProctoringSessionResponse completeSession(String studentEmail, String sessionId) {
        ProctoringSession session = proctoringSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "id", sessionId));

        validateStudentOwnership(studentEmail, session);

        session.setStatus(ProctoringSessionStatus.COMPLETED);
        session.setEndTime(Instant.now());
        session = proctoringSessionRepository.save(session);

        eventPublisher.publishEvent(session.getExamId(), Map.of(
                "eventType", "SESSION_COMPLETED",
                "sessionId", session.getId(),
                "studentId", session.getStudentId()
        ));

        return ProctoringSessionResponse.fromEntity(session);
    }

    @Override
    public PageResponse<ProctoringSessionResponse> getLecturerExamSessions(String lecturerEmail, String examId, ProctoringSessionStatus status, Pageable pageable) {
        validateExamLecturer(lecturerEmail, examId);

        Page<ProctoringSession> page;
        if (status != null) {
            page = proctoringSessionRepository.findByExamIdAndStatus(examId, status, pageable);
        } else {
            page = proctoringSessionRepository.findByExamId(examId, pageable);
        }

        List<ProctoringSessionResponse> dtoList = page.getContent().stream()
                .map(ProctoringSessionResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(page, dtoList);
    }

    @Override
    public ProctoringSessionResponse getLecturerSessionDetails(String lecturerEmail, String sessionId) {
        ProctoringSession session = proctoringSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "id", sessionId));

        validateExamLecturer(lecturerEmail, session.getExamId());

        return ProctoringSessionResponse.fromEntity(session);
    }

    @Override
    public PageResponse<ProctoringEventResponse> getLecturerSessionEvents(String lecturerEmail, String sessionId, Pageable pageable) {
        ProctoringSession session = proctoringSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringSession", "id", sessionId));

        validateExamLecturer(lecturerEmail, session.getExamId());

        Page<ProctoringEvent> page = proctoringEventRepository.findBySessionId(sessionId, pageable);
        List<ProctoringEventResponse> dtoList = page.getContent().stream()
                .map(ProctoringEventResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(page, dtoList);
    }

    @Override
    public ProctoringSummaryResponse getLecturerExamProctoringSummary(String lecturerEmail, String examId) {
        validateExamLecturer(lecturerEmail, examId);
        return buildSummary(examId);
    }

    @Override
    public PageResponse<ProctoringReviewResponse> getLecturerReviews(String lecturerEmail, String examId, ProctoringReviewStatus status, Pageable pageable) {
        validateExamLecturer(lecturerEmail, examId);

        Page<ProctoringReview> page;
        if (status != null) {
            page = proctoringReviewRepository.findByExamIdAndStatus(examId, status, pageable);
        } else {
            page = proctoringReviewRepository.findByExamId(examId, pageable);
        }

        List<ProctoringReviewResponse> dtoList = page.getContent().stream()
                .map(ProctoringReviewResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(page, dtoList);
    }

    @Override
    public ProctoringReviewResponse updateReview(String lecturerEmail, String reviewId, ReviewUpdateRequest request) {
        User lecturer = getUserByEmail(lecturerEmail);
        ProctoringReview review = proctoringReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("ProctoringReview", "id", reviewId));

        validateExamLecturer(lecturerEmail, review.getExamId());

        review.setStatus(request.getStatus());
        review.setReviewerId(lecturer.getId());
        review.setReviewerEmail(lecturer.getEmail());
        review.setReviewerNotes(request.getReviewerNotes());
        review.setResolutionReason(request.getResolutionReason());
        review.setReviewedAt(Instant.now());

        review = proctoringReviewRepository.save(review);

        auditLogService.logAction(
                lecturer.getId(),
                lecturer.getEmail(),
                "PROCTORING_REVIEW_UPDATE",
                "ProctoringReview",
                review.getId(),
                "SUCCESS",
                null,
                null,
                Map.of("newStatus", request.getStatus().name(), "examId", review.getExamId())
        );

        return ProctoringReviewResponse.fromEntity(review);
    }

    @Override
    public ProctoringSummaryResponse getAdminProctoringSummary() {
        return buildSummary(null);
    }

    /**
     * Scheduled job running every 30 seconds to flag stalled active sessions whose heartbeats expired.
     */
    @Scheduled(fixedRate = 30000)
    public void detectStalledSessions() {
        Instant staleThreshold = Instant.now().minusSeconds(45);
        List<ProctoringSession> stalled = proctoringSessionRepository
                .findByStatusAndLastHeartbeatTimeBefore(ProctoringSessionStatus.ACTIVE, staleThreshold);

        for (ProctoringSession session : stalled) {
            session.setStatus(ProctoringSessionStatus.CONNECTION_INTERRUPTED);
            proctoringSessionRepository.save(session);

            eventPublisher.publishEvent(session.getExamId(), Map.of(
                "eventType", "CONNECTION_INTERRUPTED",
                "sessionId", session.getId(),
                "studentId", session.getStudentId(),
                "studentName", session.getStudentName()
            ));
            log.info("Session [{}] flagged as CONNECTION_INTERRUPTED due to heartbeat lapse", session.getId());
        }
    }

    private ProctoringSummaryResponse buildSummary(String examId) {
        ProctoringSummaryResponse summary = new ProctoringSummaryResponse();
        summary.setExamId(examId);

        if (examId != null) {
            summary.setTotalSessions(proctoringSessionRepository.countByExamId(examId));
            summary.setActiveSessions(proctoringSessionRepository.countByExamIdAndStatus(examId, ProctoringSessionStatus.ACTIVE));
            summary.setCompletedSessions(proctoringSessionRepository.countByExamIdAndStatus(examId, ProctoringSessionStatus.COMPLETED));
            summary.setConnectionInterruptedSessions(proctoringSessionRepository.countByExamIdAndStatus(examId, ProctoringSessionStatus.CONNECTION_INTERRUPTED));

            summary.setTotalEvents(proctoringEventRepository.countByExamId(examId));

            summary.setTotalReviews(proctoringReviewRepository.countByExamId(examId));
            summary.setOpenReviews(proctoringReviewRepository.countByExamIdAndStatus(examId, ProctoringReviewStatus.OPEN));
            summary.setConfirmedViolations(proctoringReviewRepository.countByExamIdAndStatus(examId, ProctoringReviewStatus.CONFIRMED));
            summary.setDismissedViolations(proctoringReviewRepository.countByExamIdAndStatus(examId, ProctoringReviewStatus.DISMISSED));
        } else {
            summary.setTotalSessions(proctoringSessionRepository.count());
            summary.setActiveSessions(proctoringSessionRepository.countByStatus(ProctoringSessionStatus.ACTIVE));
            summary.setCompletedSessions(proctoringSessionRepository.countByStatus(ProctoringSessionStatus.COMPLETED));
            summary.setConnectionInterruptedSessions(proctoringSessionRepository.countByStatus(ProctoringSessionStatus.CONNECTION_INTERRUPTED));

            summary.setTotalEvents(proctoringEventRepository.count());

            summary.setTotalReviews(proctoringReviewRepository.count());
            summary.setOpenReviews(proctoringReviewRepository.countByStatus(ProctoringReviewStatus.OPEN));
            summary.setConfirmedViolations(proctoringReviewRepository.countByStatus(ProctoringReviewStatus.CONFIRMED));
            summary.setDismissedViolations(proctoringReviewRepository.countByStatus(ProctoringReviewStatus.DISMISSED));
        }

        return summary;
    }

    private void triggerAutomatedReview(ProctoringSession session, ProctoringEventType type, EventSeverity severity) {
        Optional<ProctoringReview> existing = proctoringReviewRepository.findBySessionId(session.getId());
        if (existing.isEmpty() || existing.get().getStatus() != ProctoringReviewStatus.OPEN) {
            ProctoringReview review = new ProctoringReview(
                    session.getId(),
                    session.getAttemptId(),
                    session.getExamId(),
                    session.getExamTitle(),
                    session.getStudentId(),
                    session.getStudentName(),
                    session.getStudentEmail(),
                    type.name(),
                    severity
            );
            proctoringReviewRepository.save(review);
        }
    }

    private EventSeverity determineSeverity(ProctoringEventType type) {
        if (type == null) {
            return EventSeverity.LOW;
        }
        return switch (type) {
            case MULTIPLE_FACES_DETECTED -> EventSeverity.CRITICAL;
            case TAB_VISIBILITY_CHANGED, FULLSCREEN_EXITED, CAMERA_STREAM_INTERRUPTED -> EventSeverity.HIGH;
            case FACE_NOT_DETECTED, CAMERA_PERMISSION_DENIED -> EventSeverity.MEDIUM;
            case CAMERA_PERMISSION_GRANTED, CAMERA_STREAM_RESTORED, NETWORK_INTERRUPTED, NETWORK_RESTORED,
                 EXAM_STARTED, EXAM_SUBMITTED, FACE_DETECTION_UNAVAILABLE -> EventSeverity.LOW;
            case MANUAL_REVIEW_REQUIRED -> EventSeverity.HIGH;
        };
    }

    private void validateStudentOwnership(String studentEmail, ProctoringSession session) {
        if (!session.getStudentEmail().equalsIgnoreCase(studentEmail)) {
            throw new AccessDeniedException("You do not own this proctoring session");
        }
    }

    private void validateExamLecturer(String lecturerEmail, String examId) {
        User lecturer = getUserByEmail(lecturerEmail);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        if (!exam.getLecturerId().equals(lecturer.getId())) {
            throw new AccessDeniedException("You are not the instructor for this exam");
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ExamAttempt getAttempt(String attemptId) {
        return examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamAttempt", "id", attemptId));
    }
}
