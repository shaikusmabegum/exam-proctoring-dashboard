package com.drishti.dto.request;

import com.drishti.entity.ProctoringReviewStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReviewUpdateRequest {

    @NotNull(message = "Review status is required")
    private ProctoringReviewStatus status;

    @Size(max = 1000, message = "Reviewer notes cannot exceed 1000 characters")
    private String reviewerNotes;

    @Size(max = 250, message = "Resolution reason cannot exceed 250 characters")
    private String resolutionReason;

    public ReviewUpdateRequest() {
    }

    public ReviewUpdateRequest(ProctoringReviewStatus status, String reviewerNotes, String resolutionReason) {
        this.status = status;
        this.reviewerNotes = reviewerNotes;
        this.resolutionReason = resolutionReason;
    }

    public ProctoringReviewStatus getStatus() {
        return status;
    }

    public void setStatus(ProctoringReviewStatus status) {
        this.status = status;
    }

    public String getReviewerNotes() {
        return reviewerNotes;
    }

    public void setReviewerNotes(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }

    public String getResolutionReason() {
        return resolutionReason;
    }

    public void setResolutionReason(String resolutionReason) {
        this.resolutionReason = resolutionReason;
    }
}
