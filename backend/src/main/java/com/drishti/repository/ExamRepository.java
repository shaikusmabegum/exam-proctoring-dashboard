package com.drishti.repository;

import com.drishti.entity.Exam;
import com.drishti.entity.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {

    Page<Exam> findByLecturerId(String lecturerId, Pageable pageable);

    Page<Exam> findByLecturerIdAndStatus(String lecturerId, ExamStatus status, Pageable pageable);

    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);

    @Query("{ 'status': 'PUBLISHED', 'startTime': { $lte: ?0 }, 'endTime': { $gte: ?0 } }")
    Page<Exam> findActivePublishedExams(Instant now, Pageable pageable);

    @Query("{ 'status': 'PUBLISHED', 'startTime': { $gt: ?0 } }")
    Page<Exam> findUpcomingPublishedExams(Instant now, Pageable pageable);

    long countByLecturerId(String lecturerId);

    long countByLecturerIdAndStatus(String lecturerId, ExamStatus status);

    long countByStatus(ExamStatus status);

    List<Exam> findByLecturerId(String lecturerId);
}
