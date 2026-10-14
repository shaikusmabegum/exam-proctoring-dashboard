package com.drishti.dto.request;

import com.drishti.entity.CameraStreamStatus;
import jakarta.validation.constraints.NotNull;

public class CameraStatusUpdateRequest {

    @com.fasterxml.jackson.annotation.JsonAlias("status")
    private CameraStreamStatus cameraStatus;

    public CameraStatusUpdateRequest() {
    }

    public CameraStatusUpdateRequest(CameraStreamStatus cameraStatus) {
        this.cameraStatus = cameraStatus;
    }

    public CameraStreamStatus getCameraStatus() {
        return cameraStatus;
    }

    public void setCameraStatus(CameraStreamStatus cameraStatus) {
        this.cameraStatus = cameraStatus;
    }

    public CameraStreamStatus getStatus() {
        return cameraStatus;
    }

    public void setStatus(CameraStreamStatus cameraStatus) {
        this.cameraStatus = cameraStatus;
    }
}
