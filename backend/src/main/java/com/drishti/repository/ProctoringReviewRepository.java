package com.drishti.repository;

import com.drishti.entity.ProctoringReview;
import com.drishti.entity.ProctoringReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProctoringReviewRepository extends MongoRepository<ProctoringReview, String> {

    Optional<ProctoringReview> findBySessionId(String sessionId);

    Optional<ProctoringReview> findByAttemptId(String attemptId);

    Page<ProctoringReview> findByExamId(String examId, Pageable pageable);

    Page<ProctoringReview> findByExamIdAndStatus(String examId, ProctoringReviewStatus status, Pageable pageable);

    long countByExamId(String examId);

    long countByExamIdAndStatus(String examId, ProctoringReviewStatus status);

    long countByStatus(ProctoringReviewStatus status);
}
