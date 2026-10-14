package com.drishti.repository;

import com.drishti.entity.AttemptStatus;
import com.drishti.entity.ExamAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends MongoRepository<ExamAttempt, String> {

    Page<ExamAttempt> findByStudentId(String studentId, Pageable pageable);

    Page<ExamAttempt> findByStudentIdAndStatus(String studentId, AttemptStatus status, Pageable pageable);

    Page<ExamAttempt> findByExamId(String examId, Pageable pageable);

    Page<ExamAttempt> findByExamIdAndStatus(String examId, AttemptStatus status, Pageable pageable);

    List<ExamAttempt> findByExamIdAndStudentId(String examId, String studentId);

    Optional<ExamAttempt> findByExamIdAndStudentIdAndStatus(String examId, String studentId, AttemptStatus status);

    long countByExamId(String examId);

    long countByExamIdAndStatus(String examId, AttemptStatus status);

    long countByStudentId(String studentId);

    long countByStudentIdAndStatus(String studentId, AttemptStatus status);

    long countByStatus(AttemptStatus status);

    List<ExamAttempt> findByExamId(String examId);

    List<ExamAttempt> findByStudentId(String studentId);
}
