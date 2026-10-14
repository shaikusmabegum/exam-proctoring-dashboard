package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.ExamCreateRequest;
import com.drishti.dto.request.ExamUpdateRequest;
import com.drishti.dto.request.QuestionCreateRequest;
import com.drishti.dto.request.QuestionOptionRequest;
import com.drishti.dto.request.QuestionReorderRequest;
import com.drishti.dto.request.QuestionUpdateRequest;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.LecturerDashboardStatsResponse;
import com.drishti.dto.response.LecturerExamAnalyticsResponse;
import com.drishti.entity.AttemptStatus;
import com.drishti.entity.Exam;
import com.drishti.entity.ExamAttempt;
import com.drishti.entity.ExamStatus;
import com.drishti.entity.Question;
import com.drishti.entity.QuestionOption;
import com.drishti.entity.QuestionType;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LecturerExamServiceImpl implements LecturerExamService {

    private static final Logger log = LoggerFactory.getLogger(LecturerExamServiceImpl.class);

    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final UserRepository userRepository;

    public LecturerExamServiceImpl(
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository,
            UserRepository userRepository) {
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.userRepository = userRepository;
    }

    private User getLecturer(String email) {
        String normalized = EmailNormalizer.normalize(email);
        return userRepository.findByEmail(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with email: " + normalized));
    }

    private Exam getAndVerifyOwnedExam(String examId, String lecturerId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + examId));

        if (!exam.getLecturerId().equals(lecturerId)) {
            log.warn("Unauthorized attempt by lecturer ID [{}] to access exam ID [{}]", lecturerId, examId);
            throw new AccessDeniedException("Access denied: you do not own this exam");
        }
        return exam;
    }

    @Override
    public ExamResponse createExam(String lecturerEmail, ExamCreateRequest request) {
        User lecturer = getLecturer(lecturerEmail);

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Exam start time must be before end time");
        }

        Exam exam = new Exam();
        exam.setTitle(request.getTitle().trim());
        exam.setDescription(request.getDescription());
        exam.setInstructions(request.getInstructions());
        exam.setCourseName(request.getCourseName().trim());
        exam.setLecturerId(lecturer.getId());
        exam.setLecturerName(lecturer.getFullName());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setStatus(ExamStatus.DRAFT);
        exam.setRandomizeQuestions(request.isRandomizeQuestions());
        exam.setNegativeMarking(request.isNegativeMarking());
        exam.setNegativeMarksPerQuestion(request.getNegativeMarksPerQuestion());
        exam.setMaxAttempts(Math.max(1, request.getMaxAttempts()));
        exam.setResultsPublished(false);
        exam.setCreatedAt(Instant.now());
        exam.setUpdatedAt(Instant.now());

        Exam savedExam = examRepository.save(exam);
        log.info("Created draft exam ID: [{}] by lecturer: [{}]", savedExam.getId(), lecturer.getEmail());
        return ExamResponse.fromEntity(savedExam);
    }

    @Override
    public PageResponse<ExamResponse> getLecturerExams(String lecturerEmail, ExamStatus status, Pageable pageable) {
        User lecturer = getLecturer(lecturerEmail);
        Page<Exam> examsPage;

        if (status != null) {
            examsPage = examRepository.findByLecturerIdAndStatus(lecturer.getId(), status, pageable);
        } else {
            examsPage = examRepository.findByLecturerId(lecturer.getId(), pageable);
        }

        List<ExamResponse> mapped = examsPage.getContent().stream()
                .map(ExamResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.fromPage(examsPage, mapped);
    }

    @Override
    public ExamResponse getLecturerExamById(String lecturerEmail, String examId) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());
        return ExamResponse.fromEntity(exam);
    }

    @Override
    public ExamResponse updateExam(String lecturerEmail, String examId, ExamUpdateRequest request) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        if (exam.getStatus() == ExamStatus.ARCHIVED) {
            throw new IllegalStateException("Cannot edit an archived exam");
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Exam start time must be before end time");
        }

        long attemptCount = examAttemptRepository.countByExamId(examId);
        if (attemptCount > 0) {
            // Guard against changing scoring configuration on attempts in progress / evaluated
            if (exam.isNegativeMarking() != request.isNegativeMarking()
                    || Double.compare(exam.getNegativeMarksPerQuestion(), request.getNegativeMarksPerQuestion()) != 0) {
                throw new IllegalStateException("Cannot change negative marking settings after student attempts have commenced");
            }
            if (exam.isRandomizeQuestions() != request.isRandomizeQuestions()) {
                throw new IllegalStateException("Cannot change question randomization after student attempts have commenced");
            }
        }

        if (exam.getStatus() == ExamStatus.PUBLISHED && exam.getTotalMarks() > 0 && request.getPassingMarks() > exam.getTotalMarks()) {
            throw new IllegalArgumentException("Passing marks (" + request.getPassingMarks() + ") cannot exceed total exam marks (" + exam.getTotalMarks() + ")");
        }

        exam.setTitle(request.getTitle().trim());
        exam.setDescription(request.getDescription());
        exam.setInstructions(request.getInstructions());
        exam.setCourseName(request.getCourseName().trim());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setRandomizeQuestions(request.isRandomizeQuestions());
        exam.setNegativeMarking(request.isNegativeMarking());
        exam.setNegativeMarksPerQuestion(request.getNegativeMarksPerQuestion());
        exam.setMaxAttempts(Math.max(1, request.getMaxAttempts()));
        exam.setUpdatedAt(Instant.now());

        Exam updated = examRepository.save(exam);
        log.info("Updated exam ID: [{}] by lecturer: [{}]", updated.getId(), lecturer.getEmail());
        return ExamResponse.fromEntity(updated);
    }

    @Override
    public ExamResponse addQuestion(String lecturerEmail, String examId, QuestionCreateRequest request) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        if (exam.getStatus() != ExamStatus.DRAFT) {
            long attemptCount = examAttemptRepository.countByExamId(examId);
            if (attemptCount > 0) {
                throw new IllegalStateException("Cannot add questions to an active or archived exam with existing student attempts");
            }
        }

        validateQuestionDetails(request.getType(), request.getOptions(), request.getCorrectAnswerText());

        Question question = new Question();
        question.setId(UUID.randomUUID().toString());
        question.setQuestionText(request.getQuestionText().trim());
        question.setType(request.getType());
        question.setMarks(request.getMarks());
        question.setNegativeMarks(request.getNegativeMarks() != null ? request.getNegativeMarks() : 0.0);
        question.setExplanation(request.getExplanation());
        question.setCorrectAnswerText(request.getCorrectAnswerText());
        question.setOrder(request.getOrder() != null ? request.getOrder() : exam.getQuestions().size() + 1);
        question.setCreatedAt(Instant.now());

        if (request.getOptions() != null) {
            List<QuestionOption> options = request.getOptions().stream()
                    .map(o -> new QuestionOption(
                            o.getId() != null ? o.getId() : UUID.randomUUID().toString(),
                            o.getText().trim(),
                            o.isCorrect()
                    ))
                    .collect(Collectors.toList());
            question.setOptions(options);
        }

        exam.getQuestions().add(question);
        exam.recalculateTotalMarks();
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        log.info("Added question ID: [{}] to exam: [{}]", question.getId(), examId);
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public ExamResponse updateQuestion(String lecturerEmail, String examId, String questionId, QuestionUpdateRequest request) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        if (exam.getStatus() != ExamStatus.DRAFT && examAttemptRepository.countByExamId(examId) > 0) {
            throw new IllegalStateException("Cannot modify questions for an exam with existing student attempts");
        }

        Question question = exam.getQuestions().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + questionId));

        validateQuestionDetails(request.getType(), request.getOptions(), request.getCorrectAnswerText());

        question.setQuestionText(request.getQuestionText().trim());
        question.setType(request.getType());
        question.setMarks(request.getMarks());
        question.setNegativeMarks(request.getNegativeMarks() != null ? request.getNegativeMarks() : 0.0);
        question.setExplanation(request.getExplanation());
        question.setCorrectAnswerText(request.getCorrectAnswerText());
        if (request.getOrder() != null) {
            question.setOrder(request.getOrder());
        }

        if (request.getOptions() != null) {
            List<QuestionOption> options = request.getOptions().stream()
                    .map(o -> new QuestionOption(
                            o.getId() != null ? o.getId() : UUID.randomUUID().toString(),
                            o.getText().trim(),
                            o.isCorrect()
                    ))
                    .collect(Collectors.toList());
            question.setOptions(options);
        }

        exam.recalculateTotalMarks();
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public ExamResponse deleteQuestion(String lecturerEmail, String examId, String questionId) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        if (exam.getStatus() != ExamStatus.DRAFT && examAttemptRepository.countByExamId(examId) > 0) {
            throw new IllegalStateException("Cannot delete questions for an exam with existing student attempts");
        }

        boolean removed = exam.getQuestions().removeIf(q -> q.getId().equals(questionId));
        if (!removed) {
            throw new ResourceNotFoundException("Question not found with ID: " + questionId);
        }

        exam.recalculateTotalMarks();
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        log.info("Deleted question ID: [{}] from exam: [{}]", questionId, examId);
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public ExamResponse reorderQuestions(String lecturerEmail, String examId, QuestionReorderRequest request) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        Map<String, Question> questionMap = exam.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        List<Question> reordered = new ArrayList<>();
        int order = 1;
        for (String qId : request.getOrderedQuestionIds()) {
            Question q = questionMap.get(qId);
            if (q != null) {
                q.setOrder(order++);
                reordered.add(q);
            }
        }

        // Add any remaining questions not present in the order list
        for (Question q : exam.getQuestions()) {
            if (!request.getOrderedQuestionIds().contains(q.getId())) {
                q.setOrder(order++);
                reordered.add(q);
            }
        }

        exam.setQuestions(reordered);
        exam.setUpdatedAt(Instant.now());
        Exam saved = examRepository.save(exam);
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public ExamResponse publishExam(String lecturerEmail, String examId) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        if (exam.getQuestions() == null || exam.getQuestions().isEmpty()) {
            throw new IllegalStateException("Cannot publish an exam with no questions");
        }

        if (exam.getStartTime() == null || exam.getEndTime() == null || !exam.getStartTime().isBefore(exam.getEndTime())) {
            throw new IllegalStateException("Exam must have a valid start and end schedule");
        }

        exam.recalculateTotalMarks();

        if (exam.getPassingMarks() > exam.getTotalMarks()) {
            throw new IllegalStateException("Passing marks (" + exam.getPassingMarks() + ") cannot exceed total exam marks (" + exam.getTotalMarks() + ")");
        }

        exam.setStatus(ExamStatus.PUBLISHED);
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        log.info("Published exam ID: [{}] with {} questions, total marks: {}", saved.getId(), saved.getQuestions().size(), saved.getTotalMarks());
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public ExamResponse unpublishExam(String lecturerEmail, String examId) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new IllegalStateException("Only published exams can be reverted to draft mode");
        }

        long attemptCount = examAttemptRepository.countByExamId(examId);
        if (attemptCount > 0) {
            throw new IllegalStateException("Cannot unpublish an exam with existing student attempts (" + attemptCount + " attempts recorded)");
        }

        exam.setStatus(ExamStatus.DRAFT);
        exam.setUpdatedAt(Instant.now());
        Exam saved = examRepository.save(exam);
        log.info("Reverted exam ID: [{}] to DRAFT status by lecturer: [{}]", saved.getId(), lecturer.getEmail());
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public ExamResponse archiveExam(String lecturerEmail, String examId) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        exam.setStatus(ExamStatus.ARCHIVED);
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        log.info("Archived exam ID: [{}]", saved.getId());
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public PageResponse<ExamAttemptResponse> getExamAttempts(String lecturerEmail, String examId, Pageable pageable) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        Page<ExamAttempt> attemptsPage = examAttemptRepository.findByExamId(exam.getId(), pageable);
        List<ExamAttemptResponse> mapped = attemptsPage.getContent().stream()
                .map(a -> ExamAttemptResponse.fromEntity(a, exam))
                .collect(Collectors.toList());

        return PageResponse.fromPage(attemptsPage, mapped);
    }

    @Override
    public LecturerExamAnalyticsResponse getExamAnalytics(String lecturerEmail, String examId) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        List<ExamAttempt> allAttempts = examAttemptRepository.findByExamId(exam.getId());

        LecturerExamAnalyticsResponse analytics = new LecturerExamAnalyticsResponse();
        analytics.setExamId(exam.getId());
        analytics.setExamTitle(exam.getTitle());
        analytics.setTotalAttempts(allAttempts.size());

        long completed = allAttempts.stream().filter(a -> a.getStatus() == AttemptStatus.SUBMITTED || a.getStatus() == AttemptStatus.AUTO_SUBMITTED || a.getStatus() == AttemptStatus.EVALUATED).count();
        long inProgress = allAttempts.stream().filter(a -> a.getStatus() == AttemptStatus.IN_PROGRESS).count();
        analytics.setCompletedAttempts(completed);
        analytics.setInProgressAttempts(inProgress);

        List<ExamAttempt> completedList = allAttempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED || a.getStatus() == AttemptStatus.AUTO_SUBMITTED || a.getStatus() == AttemptStatus.EVALUATED)
                .toList();

        if (!completedList.isEmpty()) {
            double avgScore = completedList.stream().mapToDouble(ExamAttempt::getScore).average().orElse(0.0);
            double avgPercentage = completedList.stream().mapToDouble(ExamAttempt::getPercentage).average().orElse(0.0);
            double highest = completedList.stream().mapToDouble(ExamAttempt::getScore).max().orElse(0.0);
            double lowest = completedList.stream().mapToDouble(ExamAttempt::getScore).min().orElse(0.0);
            long passCount = completedList.stream().filter(ExamAttempt::isPassed).count();
            long failCount = completedList.size() - passCount;
            double passRate = (double) passCount / completedList.size() * 100.0;

            analytics.setAverageScore(BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP).doubleValue());
            analytics.setAveragePercentage(BigDecimal.valueOf(avgPercentage).setScale(2, RoundingMode.HALF_UP).doubleValue());
            analytics.setHighestScore(highest);
            analytics.setLowestScore(lowest);
            analytics.setPassCount(passCount);
            analytics.setFailCount(failCount);
            analytics.setPassRate(BigDecimal.valueOf(passRate).setScale(2, RoundingMode.HALF_UP).doubleValue());

            // Score distribution bins
            Map<String, Long> dist = new LinkedHashMap<>();
            dist.put("0-20%", completedList.stream().filter(a -> a.getPercentage() >= 0 && a.getPercentage() <= 20).count());
            dist.put("21-40%", completedList.stream().filter(a -> a.getPercentage() > 20 && a.getPercentage() <= 40).count());
            dist.put("41-60%", completedList.stream().filter(a -> a.getPercentage() > 40 && a.getPercentage() <= 60).count());
            dist.put("61-80%", completedList.stream().filter(a -> a.getPercentage() > 60 && a.getPercentage() <= 80).count());
            dist.put("81-100%", completedList.stream().filter(a -> a.getPercentage() > 80 && a.getPercentage() <= 100).count());
            analytics.setScoreDistribution(dist);
        } else {
            analytics.setScoreDistribution(Map.of("0-20%", 0L, "21-40%", 0L, "41-60%", 0L, "61-80%", 0L, "81-100%", 0L));
        }

        return analytics;
    }

    @Override
    public ExamResponse toggleResultsRelease(String lecturerEmail, String examId, boolean release) {
        User lecturer = getLecturer(lecturerEmail);
        Exam exam = getAndVerifyOwnedExam(examId, lecturer.getId());

        exam.setResultsPublished(release);
        exam.setUpdatedAt(Instant.now());
        Exam saved = examRepository.save(exam);
        log.info("Results release status for exam ID [{}] updated to: {}", examId, release);
        return ExamResponse.fromEntity(saved);
    }

    @Override
    public LecturerDashboardStatsResponse getDashboardStats(String lecturerEmail) {
        User lecturer = getLecturer(lecturerEmail);

        long totalExams = examRepository.countByLecturerId(lecturer.getId());
        long draftExams = examRepository.countByLecturerIdAndStatus(lecturer.getId(), ExamStatus.DRAFT);
        long publishedExams = examRepository.countByLecturerIdAndStatus(lecturer.getId(), ExamStatus.PUBLISHED);
        long archivedExams = examRepository.countByLecturerIdAndStatus(lecturer.getId(), ExamStatus.ARCHIVED);

        List<Exam> lecturerExams = examRepository.findByLecturerId(lecturer.getId());
        List<String> examIds = lecturerExams.stream().map(Exam::getId).toList();

        long totalAttempts = 0;
        long completedAttempts = 0;
        long passedAttempts = 0;

        for (String eId : examIds) {
            List<ExamAttempt> attempts = examAttemptRepository.findByExamId(eId);
            totalAttempts += attempts.size();
            List<ExamAttempt> finished = attempts.stream()
                    .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED || a.getStatus() == AttemptStatus.AUTO_SUBMITTED || a.getStatus() == AttemptStatus.EVALUATED)
                    .toList();
            completedAttempts += finished.size();
            passedAttempts += finished.stream().filter(ExamAttempt::isPassed).count();
        }

        double overallPassRate = completedAttempts > 0
                ? BigDecimal.valueOf((double) passedAttempts / completedAttempts * 100.0).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        Page<Exam> recentExamsPage = examRepository.findByLecturerId(lecturer.getId(), PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<ExamResponse> recentExams = recentExamsPage.getContent().stream().map(ExamResponse::fromEntity).collect(Collectors.toList());

        LecturerDashboardStatsResponse stats = new LecturerDashboardStatsResponse();
        stats.setTotalExams(totalExams);
        stats.setDraftExams(draftExams);
        stats.setPublishedExams(publishedExams);
        stats.setArchivedExams(archivedExams);
        stats.setTotalAttempts(totalAttempts);
        stats.setCompletedAttempts(completedAttempts);
        stats.setOverallPassRate(overallPassRate);
        stats.setRecentExams(recentExams);

        return stats;
    }

    private void validateQuestionDetails(QuestionType type, List<QuestionOptionRequest> options, String correctAnswerText) {
        if (type == QuestionType.SINGLE_CHOICE) {
            if (options == null || options.size() < 2) {
                throw new IllegalArgumentException("Single choice questions must have at least 2 options");
            }
            long correctCount = options.stream().filter(QuestionOptionRequest::isCorrect).count();
            if (correctCount != 1) {
                throw new IllegalArgumentException("Single choice questions must have exactly 1 correct option");
            }
        } else if (type == QuestionType.MULTIPLE_CHOICE) {
            if (options == null || options.size() < 2) {
                throw new IllegalArgumentException("Multiple choice questions must have at least 2 options");
            }
            long correctCount = options.stream().filter(QuestionOptionRequest::isCorrect).count();
            if (correctCount < 1) {
                throw new IllegalArgumentException("Multiple choice questions must have at least 1 correct option");
            }
        } else if (type == QuestionType.TRUE_FALSE) {
            boolean hasValidAnswer = (correctAnswerText != null && (correctAnswerText.equalsIgnoreCase("true") || correctAnswerText.equalsIgnoreCase("false")))
                    || (options != null && options.stream().anyMatch(QuestionOptionRequest::isCorrect));
            if (!hasValidAnswer) {
                throw new IllegalArgumentException("True/False questions must specify a valid boolean answer");
            }
        }
    }
}
