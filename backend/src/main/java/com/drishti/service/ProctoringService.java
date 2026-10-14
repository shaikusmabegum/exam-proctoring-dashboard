package com.drishti.service;

import com.drishti.dto.common.PageResponse;
import com.drishti.dto.request.ProctoringEventRequest;
import com.drishti.dto.request.ReviewUpdateRequest;
import com.drishti.dto.response.ProctoringEventResponse;
import com.drishti.dto.response.ProctoringReviewResponse;
import com.drishti.dto.response.ProctoringSessionResponse;
import com.drishti.dto.response.ProctoringSummaryResponse;
import com.drishti.entity.CameraStreamStatus;
import com.drishti.entity.ProctoringReviewStatus;
import com.drishti.entity.ProctoringSessionStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProctoringService {

    ProctoringSessionResponse startOrGetSession(String studentEmail, String attemptId);

    ProctoringSessionResponse getSession(String studentEmail, String attemptId);

    void recordHeartbeat(String studentEmail, String sessionId);

    ProctoringSessionResponse updateCameraStatus(String studentEmail, String sessionId, CameraStreamStatus status);

    List<ProctoringEventResponse> ingestEvents(String studentEmail, String sessionId, List<ProctoringEventRequest> eventRequests);

    ProctoringSessionResponse completeSession(String studentEmail, String sessionId);

    PageResponse<ProctoringSessionResponse> getLecturerExamSessions(String lecturerEmail, String examId, ProctoringSessionStatus status, Pageable pageable);

    ProctoringSessionResponse getLecturerSessionDetails(String lecturerEmail, String sessionId);

    PageResponse<ProctoringEventResponse> getLecturerSessionEvents(String lecturerEmail, String sessionId, Pageable pageable);

    ProctoringSummaryResponse getLecturerExamProctoringSummary(String lecturerEmail, String examId);

    PageResponse<ProctoringReviewResponse> getLecturerReviews(String lecturerEmail, String examId, ProctoringReviewStatus status, Pageable pageable);

    ProctoringReviewResponse updateReview(String lecturerEmail, String reviewId, ReviewUpdateRequest request);

    ProctoringSummaryResponse getAdminProctoringSummary();
}
