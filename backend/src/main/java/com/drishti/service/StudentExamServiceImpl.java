package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.SaveAnswerRequest;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.QuestionOptionResponse;
import com.drishti.dto.response.QuestionResultDetail;
import com.drishti.dto.response.StudentDashboardResponse;
import com.drishti.dto.response.StudentExamResponse;
import com.drishti.dto.response.StudentResultResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Question;
import com.drishti.entity.QuestionOption;
import com.drishti.entity.StudentAnswer;
import com.drishti.entity.User;
import com.drishti.exception.ResourceNotFoundException;
import com.drishti.repository.ExamAttemptRepository;
import com.drishti.repository.ExamRepository;
import com.drishti.repository.UserRepository;
import com.drishti.util.EmailNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentExamServiceImpl implements StudentExamService {

    private static final Logger log = LoggerFactory.getLogger(StudentExamServiceImpl.class);

    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final UserRepository userRepository;
    private final EvaluationService evaluationService;

    public StudentExamServiceImpl(
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository,
            UserRepository userRepository,
            EvaluationService evaluationService) {
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.userRepository = userRepository;
        this.evaluationService = evaluationService;
    }

    private User getStudent(String email) {
        String normalized = EmailNormalizer.normalize(email);
        return userRepository.findByEmail(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + normalized));
    }

    private ExamAttempt getAndVerifyOwnedAttempt(String attemptId, String studentId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam attempt not found with ID: " + attemptId));

        if (!attempt.getStudentId().equals(studentId)) {
            log.warn("Access denied: student ID [{}] attempted to access attempt ID [{}] owned by [{}]",
                    studentId, attemptId, attempt.getStudentId());
            throw new AccessDeniedException("Access denied: you do not own this attempt");
        }
        return attempt;
    }

    @Override
    public PageResponse<StudentExamResponse> getAvailableExams(String studentEmail, Pageable pageable) {
        User student = getStudent(studentEmail);
        Instant now = Instant.now();

        Page<Exam> examsPage = examRepository.findActivePublishedExams(now, pageable);

        List<StudentExamResponse> mapped = examsPage.getContent().stream()
                .map(exam -> {
                    StudentExamResponse res = StudentExamResponse.fromEntity(exam);
                    List<ExamAttempt> studentAttempts = examAttemptRepository.findByExamIdAndStudentId(exam.getId(), student.getId());
                    boolean hasInProgress = studentAttempts.stream().anyMatch(a -> a.getStatus() == AttemptStatus.IN_PROGRESS);
                    int count = studentAttempts.size();

                    if (hasInProgress) {
                        res.setCanAttempt(true);
                        res.setAttemptStatusMessage("Resume in-progress attempt");
                    } else if (count < exam.getMaxAttempts()) {
                        res.setCanAttempt(true);
                        res.setAttemptStatusMessage("Eligible (Attempt " + (count + 1) + " of " + exam.getMaxAttempts() + ")");
                    } else {
                        res.setCanAttempt(false);
                        res.setAttemptStatusMessage("Maximum attempts (" + exam.getMaxAttempts() + ") completed");
                    }
                    return res;
                })
                .collect(Collectors.toList());

        return PageResponse.fromPage(examsPage, mapped);
    }

    @Override
    public StudentExamResponse getStudentExamById(String studentEmail, String examId) {
        User student = getStudent(studentEmail);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + examId));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new AccessDeniedException("Exam is not currently published");
        }

        StudentExamResponse res = StudentExamResponse.fromEntity(exam);
        List<ExamAttempt> studentAttempts = examAttemptRepository.findByExamIdAndStudentId(exam.getId(), student.getId());
        boolean hasInProgress = studentAttempts.stream().anyMatch(a -> a.getStatus() == AttemptStatus.IN_PROGRESS);
        int count = studentAttempts.size();

        if (hasInProgress) {
            res.setCanAttempt(true);
            res.setAttemptStatusMessage("Resume in-progress attempt");
        } else if (count < exam.getMaxAttempts()) {
            res.setCanAttempt(true);
            res.setAttemptStatusMessage("Eligible (Attempt " + (count + 1) + " of " + exam.getMaxAttempts() + ")");
        } else {
            res.setCanAttempt(false);
            res.setAttemptStatusMessage("Maximum attempts (" + exam.getMaxAttempts() + ") completed");
        }

        return res;
    }

    @Override
    public ExamAttemptResponse startOrResumeAttempt(String studentEmail, String examId) {
        User student = getStudent(studentEmail);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + examId));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new IllegalStateException("Exam is not published and cannot be started");
        }

        Instant now = Instant.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new IllegalStateException("Exam has not started yet. Scheduled start: " + exam.getStartTime());
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new IllegalStateException("Exam has ended. Scheduled end: " + exam.getEndTime());
        }

        // Check for an existing active in-progress attempt
        Optional<ExamAttempt> existingActive = examAttemptRepository.findByExamIdAndStudentIdAndStatus(
                examId, student.getId(), AttemptStatus.IN_PROGRESS
        );

        if (existingActive.isPresent()) {
            ExamAttempt activeAttempt = existingActive.get();
            // Check if active attempt expired
            if (activeAttempt.getExpiryTime() != null && now.isAfter(activeAttempt.getExpiryTime())) {
                log.info("Active attempt ID [{}] expired on resume. Auto-submitting.", activeAttempt.getId());
                activeAttempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
                activeAttempt.setSubmittedTime(activeAttempt.getExpiryTime());
                activeAttempt.setSubmissionReason("TIME_EXPIRED");
                evaluationService.evaluateAttempt(activeAttempt, exam);
                examAttemptRepository.save(activeAttempt);
            } else {
                log.info("Resuming active attempt ID [{}] for student: [{}]", activeAttempt.getId(), student.getEmail());
                return ExamAttemptResponse.fromEntity(activeAttempt, exam);
            }
        }

        // Check attempt count
        List<ExamAttempt> attempts = examAttemptRepository.findByExamIdAndStudentId(examId, student.getId());
        if (attempts.size() >= exam.getMaxAttempts()) {
            throw new IllegalStateException("Maximum attempt limit (" + exam.getMaxAttempts() + ") reached for this exam");
        }

        // Calculate authoritative server expiry time
        Instant durationLimit = now.plus(Duration.ofMinutes(exam.getDurationMinutes()));
        Instant expiryTime = durationLimit.isBefore(exam.getEndTime()) ? durationLimit : exam.getEndTime();

        ExamAttempt newAttempt = new ExamAttempt(
                exam.getId(),
                exam.getTitle(),
                student.getId(),
                student.getEmail(),
                student.getFullName(),
                attempts.size() + 1,
                now,
                expiryTime
        );

        // Prepare randomized question order if configured
        List<String> questionIds = exam.getQuestions().stream().map(Question::getId).collect(Collectors.toList());
        if (exam.isRandomizeQuestions()) {
            Collections.shuffle(questionIds);
        }
        newAttempt.setQuestionOrder(questionIds);

        ExamAttempt savedAttempt = examAttemptRepository.save(newAttempt);
        log.info("Started new exam attempt ID: [{}] for student: [{}] on exam: [{}]",
                savedAttempt.getId(), student.getEmail(), exam.getTitle());

        return ExamAttemptResponse.fromEntity(savedAttempt, exam);
    }

    @Override
    public ExamAttemptResponse getAttempt(String studentEmail, String attemptId) {
        User student = getStudent(studentEmail);
        ExamAttempt attempt = getAndVerifyOwnedAttempt(attemptId, student.getId());
        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + attempt.getExamId()));

        // Auto-expire check on read
        Instant now = Instant.now();
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS && attempt.getExpiryTime() != null && now.isAfter(attempt.getExpiryTime())) {
            log.info("Attempt ID [{}] expired on read. Auto-submitting.", attemptId);
            attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
            attempt.setSubmittedTime(attempt.getExpiryTime());
            attempt.setSubmissionReason("TIME_EXPIRED");
            evaluationService.evaluateAttempt(attempt, exam);
            examAttemptRepository.save(attempt);
        }

        return ExamAttemptResponse.fromEntity(attempt, exam);
    }

    @Override
    public ExamAttemptResponse saveAnswers(String studentEmail, String attemptId, List<SaveAnswerRequest> answers) {
        User student = getStudent(studentEmail);
        ExamAttempt attempt = getAndVerifyOwnedAttempt(attemptId, student.getId());
        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + attempt.getExamId()));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot save answers for an attempt that is " + attempt.getStatus());
        }

        Instant now = Instant.now();
        if (attempt.getExpiryTime() != null && now.isAfter(attempt.getExpiryTime())) {
            log.info("Attempt ID [{}] expired on save answers. Auto-submitting.", attemptId);
            attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
            attempt.setSubmittedTime(attempt.getExpiryTime());
            attempt.setSubmissionReason("TIME_EXPIRED");
            evaluationService.evaluateAttempt(attempt, exam);
            examAttemptRepository.save(attempt);
            throw new IllegalStateException("Exam attempt deadline has expired. Your attempt has been automatically submitted.");
        }

        Map<String, Question> examQuestionMap = exam.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        for (SaveAnswerRequest req : answers) {
            Question question = examQuestionMap.get(req.getQuestionId());
            if (question == null) {
                throw new IllegalArgumentException("Question ID [" + req.getQuestionId() + "] does not belong to this exam");
            }

            // Validate option IDs if provided
            if (req.getSelectedOptionIds() != null && !req.getSelectedOptionIds().isEmpty()) {
                Set<String> validOptionIds = question.getOptions().stream().map(QuestionOption::getId).collect(Collectors.toSet());
                if (!validOptionIds.containsAll(req.getSelectedOptionIds())) {
                    throw new IllegalArgumentException("One or more selected option IDs are invalid for question ID [" + req.getQuestionId() + "]");
                }
            }

            StudentAnswer answer = attempt.getAnswers().computeIfAbsent(
                    req.getQuestionId(),
                    k -> new StudentAnswer(req.getQuestionId(), req.getSelectedOptionIds(), req.getTextAnswer())
            );
            answer.setSelectedOptionIds(req.getSelectedOptionIds());
            answer.setTextAnswer(req.getTextAnswer());
            answer.setLastSavedAt(now);
        }

        attempt.setLastSavedTime(now);
        attempt.setUpdatedAt(now);
        ExamAttempt saved = examAttemptRepository.save(attempt);

        return ExamAttemptResponse.fromEntity(saved, exam);
    }

    @Override
    public StudentResultResponse submitAttempt(String studentEmail, String attemptId, String reason) {
        User student = getStudent(studentEmail);
        ExamAttempt attempt = getAndVerifyOwnedAttempt(attemptId, student.getId());
        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + attempt.getExamId()));

        if (attempt.getStatus() == AttemptStatus.SUBMITTED || attempt.getStatus() == AttemptStatus.AUTO_SUBMITTED || attempt.getStatus() == AttemptStatus.EVALUATED) {
            log.info("Attempt ID [{}] already submitted. Returning idempotent evaluation result.", attemptId);
            return buildResultResponse(attempt, exam);
        }

        Instant now = Instant.now();
        boolean isTimeout = (reason != null && reason.contains("EXPIRED"))
                || (attempt.getExpiryTime() != null && now.isAfter(attempt.getExpiryTime()));

        attempt.setStatus(isTimeout ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED);
        attempt.setSubmittedTime(now);
        attempt.setSubmissionReason(isTimeout ? "TIME_EXPIRED" : (reason != null ? reason : "MANUAL_SUBMISSION"));

        // Trigger evaluation
        evaluationService.evaluateAttempt(attempt, exam);

        ExamAttempt finalized = examAttemptRepository.save(attempt);
        log.info("Finalized and evaluated attempt ID [{}] with score: {}/{}", finalized.getId(), finalized.getScore(), finalized.getTotalMarks());

        return buildResultResponse(finalized, exam);
    }

    @Override
    public StudentResultResponse getAttemptResult(String studentEmail, String attemptId) {
        User student = getStudent(studentEmail);
        ExamAttempt attempt = getAndVerifyOwnedAttempt(attemptId, student.getId());
        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + attempt.getExamId()));

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new IllegalStateException("Attempt is still in progress. Please submit before viewing results.");
        }

        return buildResultResponse(attempt, exam);
    }

    @Override
    public PageResponse<StudentResultResponse> getStudentResults(String studentEmail, Pageable pageable) {
        User student = getStudent(studentEmail);
        Page<ExamAttempt> attemptsPage = examAttemptRepository.findByStudentId(student.getId(), pageable);

        List<StudentResultResponse> mapped = attemptsPage.getContent().stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .map(a -> {
                    Exam exam = examRepository.findById(a.getExamId()).orElse(null);
                    double passingMarks = exam != null ? exam.getPassingMarks() : 0.0;
                    boolean resultsPublished = exam != null && exam.isResultsPublished();
                    List<QuestionResultDetail> details = (resultsPublished && exam != null) ? buildQuestionResultDetails(a, exam) : null;
                    return StudentResultResponse.fromAttempt(a, passingMarks, resultsPublished, details);
                })
                .collect(Collectors.toList());

        return PageResponse.fromPage(attemptsPage, mapped);
    }

    @Override
    public StudentDashboardResponse getStudentDashboard(String studentEmail) {
        User student = getStudent(studentEmail);
        Instant now = Instant.now();

        Page<Exam> availablePage = examRepository.findActivePublishedExams(now, PageRequest.of(0, 5, Sort.by("endTime").ascending()));
        List<ExamAttempt> studentAttempts = examAttemptRepository.findByStudentId(student.getId());

        long activeAttemptsCount = studentAttempts.stream().filter(a -> a.getStatus() == AttemptStatus.IN_PROGRESS).count();
        List<ExamAttempt> completedAttempts = studentAttempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED || a.getStatus() == AttemptStatus.AUTO_SUBMITTED || a.getStatus() == AttemptStatus.EVALUATED)
                .toList();

        double avgPercentage = completedAttempts.isEmpty() ? 0.0 :
                completedAttempts.stream().mapToDouble(ExamAttempt::getPercentage).average().orElse(0.0);

        List<StudentExamResponse> upcomingExams = availablePage.getContent().stream()
                .map(StudentExamResponse::fromEntity)
                .collect(Collectors.toList());

        List<StudentResultResponse> recentResults = completedAttempts.stream()
                .sorted((a, b) -> b.getSubmittedTime().compareTo(a.getSubmittedTime()))
                .limit(5)
                .map(a -> {
                    Exam exam = examRepository.findById(a.getExamId()).orElse(null);
                    double passingMarks = exam != null ? exam.getPassingMarks() : 0.0;
                    boolean resultsPublished = exam != null && exam.isResultsPublished();
                    return StudentResultResponse.fromAttempt(a, passingMarks, resultsPublished, null);
                })
                .collect(Collectors.toList());

        StudentDashboardResponse dashboard = new StudentDashboardResponse();
        dashboard.setAvailableExamsCount(availablePage.getTotalElements());
        dashboard.setActiveAttemptsCount(activeAttemptsCount);
        dashboard.setCompletedAttemptsCount(completedAttempts.size());
        dashboard.setAverageScorePercentage(BigDecimal.valueOf(avgPercentage).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dashboard.setUpcomingOrAvailableExams(upcomingExams);
        dashboard.setRecentResults(recentResults);

        return dashboard;
    }

    private StudentResultResponse buildResultResponse(ExamAttempt attempt, Exam exam) {
        boolean resultsPublished = exam.isResultsPublished();
        List<QuestionResultDetail> details = resultsPublished ? buildQuestionResultDetails(attempt, exam) : null;
        return StudentResultResponse.fromAttempt(attempt, exam.getPassingMarks(), resultsPublished, details);
    }

    private List<QuestionResultDetail> buildQuestionResultDetails(ExamAttempt attempt, Exam exam) {
        List<QuestionResultDetail> details = new ArrayList<>();
        Map<String, StudentAnswer> answersMap = attempt.getAnswers();

        for (Question question : exam.getQuestions()) {
            StudentAnswer answer = answersMap != null ? answersMap.get(question.getId()) : null;

            QuestionResultDetail detail = new QuestionResultDetail();
            detail.setQuestionId(question.getId());
            detail.setQuestionText(question.getQuestionText());
            detail.setType(question.getType());
            detail.setMaxMarks(question.getMarks());
            detail.setAwardedMarks(answer != null ? answer.getAwardedMarks() : 0.0);
            detail.setIsCorrect(answer != null ? answer.getIsCorrect() : false);
            detail.setStudentSelectedOptionIds(answer != null ? answer.getSelectedOptionIds() : Collections.emptySet());
            detail.setStudentTextAnswer(answer != null ? answer.getTextAnswer() : null);
            detail.setCorrectAnswerText(question.getCorrectAnswerText());
            detail.setExplanation(question.getExplanation());
            detail.setOptions(question.getOptions().stream().map(QuestionOptionResponse::fromEntity).collect(Collectors.toList()));

            details.add(detail);
        }
        return details;
    }
}
