package com.drishti.dto.request;

public class SubmitAttemptRequest {

    private String reason; // e.g. "MANUAL_SUBMISSION" or "TIME_EXPIRED"

    public SubmitAttemptRequest() {
    }

    public SubmitAttemptRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
