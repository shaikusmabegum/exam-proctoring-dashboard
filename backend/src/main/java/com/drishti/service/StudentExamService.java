package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.SaveAnswerRequest;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.StudentDashboardResponse;
import com.drishti.dto.response.StudentExamResponse;
import com.drishti.dto.response.StudentResultResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StudentExamService {

    PageResponse<StudentExamResponse> getAvailableExams(String studentEmail, Pageable pageable);

    StudentExamResponse getStudentExamById(String studentEmail, String examId);

    ExamAttemptResponse startOrResumeAttempt(String studentEmail, String examId);

    ExamAttemptResponse getAttempt(String studentEmail, String attemptId);

    ExamAttemptResponse saveAnswers(String studentEmail, String attemptId, List<SaveAnswerRequest> answers);

    StudentResultResponse submitAttempt(String studentEmail, String attemptId, String reason);

    StudentResultResponse getAttemptResult(String studentEmail, String attemptId);

    PageResponse<StudentResultResponse> getStudentResults(String studentEmail, Pageable pageable);

    StudentDashboardResponse getStudentDashboard(String studentEmail);
}
