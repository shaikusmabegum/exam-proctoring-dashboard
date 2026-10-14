package com.drishti.proctoring.ai;

public interface FaceDetectionProvider {

    /**
     * Returns the operational availability and capability matrix of the AI detection provider.
     */
    ProviderStatus getProviderStatus();

    /**
     * Performs face detection on a captured video frame / image if server-side inference is active.
     *
     * @param imageBytes Image byte payload
     * @param contentType MIME type (e.g. image/jpeg, image/png)
     * @return Result containing detected faces count and server verification flag
     */
    FaceDetectionResult analyzeFrame(byte[] imageBytes, String contentType);
}
