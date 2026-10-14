package com.drishti.repository;

import com.drishti.entity.ProctoringSession;
import com.drishti.entity.ProctoringSessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProctoringSessionRepository extends MongoRepository<ProctoringSession, String> {

    Optional<ProctoringSession> findByAttemptId(String attemptId);

    Page<ProctoringSession> findByExamId(String examId, Pageable pageable);

    Page<ProctoringSession> findByExamIdAndStatus(String examId, ProctoringSessionStatus status, Pageable pageable);

    Page<ProctoringSession> findByStudentId(String studentId, Pageable pageable);

    long countByExamId(String examId);

    long countByExamIdAndStatus(String examId, ProctoringSessionStatus status);

    long countByStatus(ProctoringSessionStatus status);

    List<ProctoringSession> findByStatusAndLastHeartbeatTimeBefore(ProctoringSessionStatus status, Instant threshold);
}
