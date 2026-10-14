package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.ExamCreateRequest;
import com.drishti.dto.request.ExamUpdateRequest;
import com.drishti.dto.request.QuestionCreateRequest;
import com.drishti.dto.request.QuestionReorderRequest;
import com.drishti.dto.request.QuestionUpdateRequest;
import com.drishti.dto.response.ExamAttemptResponse;
import com.drishti.dto.response.ExamResponse;
import com.drishti.dto.response.LecturerDashboardStatsResponse;
import com.drishti.dto.response.LecturerExamAnalyticsResponse;
import com.drishti.entity.ExamStatus;
import org.springframework.data.domain.Pageable;

public interface LecturerExamService {

    ExamResponse createExam(String lecturerEmail, ExamCreateRequest request);

    PageResponse<ExamResponse> getLecturerExams(String lecturerEmail, ExamStatus status, Pageable pageable);

    ExamResponse getLecturerExamById(String lecturerEmail, String examId);

    ExamResponse updateExam(String lecturerEmail, String examId, ExamUpdateRequest request);

    ExamResponse addQuestion(String lecturerEmail, String examId, QuestionCreateRequest request);

    ExamResponse updateQuestion(String lecturerEmail, String examId, String questionId, QuestionUpdateRequest request);

    ExamResponse deleteQuestion(String lecturerEmail, String examId, String questionId);

    ExamResponse reorderQuestions(String lecturerEmail, String examId, QuestionReorderRequest request);

    ExamResponse publishExam(String lecturerEmail, String examId);

    ExamResponse unpublishExam(String lecturerEmail, String examId);

    ExamResponse archiveExam(String lecturerEmail, String examId);

    PageResponse<ExamAttemptResponse> getExamAttempts(String lecturerEmail, String examId, Pageable pageable);

    LecturerExamAnalyticsResponse getExamAnalytics(String lecturerEmail, String examId);

    ExamResponse toggleResultsRelease(String lecturerEmail, String examId, boolean release);

    LecturerDashboardStatsResponse getDashboardStats(String lecturerEmail);
}
