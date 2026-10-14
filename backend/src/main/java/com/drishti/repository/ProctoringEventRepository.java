package com.drishti.repository;

import com.drishti.entity.EventSeverity;
import com.drishti.entity.ProctoringEvent;
import com.drishti.entity.ProctoringEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProctoringEventRepository extends MongoRepository<ProctoringEvent, String> {

    Page<ProctoringEvent> findBySessionId(String sessionId, Pageable pageable);

    Page<ProctoringEvent> findByAttemptId(String attemptId, Pageable pageable);

    Page<ProctoringEvent> findByExamId(String examId, Pageable pageable);

    Page<ProctoringEvent> findByExamIdAndSeverity(String examId, EventSeverity severity, Pageable pageable);

    Optional<ProctoringEvent> findBySessionIdAndIdempotencyKey(String sessionId, String idempotencyKey);

    long countBySessionId(String sessionId);

    long countByExamId(String examId);

    long countByExamIdAndSeverity(String examId, EventSeverity severity);

    long countBySessionIdAndEventType(String sessionId, ProctoringEventType eventType);

    List<ProctoringEvent> findBySessionId(String sessionId);
}
