package com.drishti.proctoring.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Standard provider when server-side external inference is not configured.
 * Reports AI signals as client-reported and avoids fabricating fake detection.
 */
@Component
public class BrowserReportedFaceDetectionProvider implements FaceDetectionProvider {

    private static final Logger log = LoggerFactory.getLogger(BrowserReportedFaceDetectionProvider.class);

    private static final List<String> CAPABILITIES = Arrays.asList(
            "BROWSER_CLIENT_FACE_DETECTION",
            "TAB_VISIBILITY_MONITORING",
            "FULLSCREEN_MONITORING",
            "HEARTBEAT_LIVENESS"
    );

    @Override
    public ProviderStatus getProviderStatus() {
        return new ProviderStatus(
                "BROWSER_CLIENT_INFERENCE",
                true,
                "Client-side TensorFlow.js/MediaPipe browser detection active. Server-side heavy inference is not attached.",
                CAPABILITIES
        );
    }

    @Override
    public FaceDetectionResult analyzeFrame(byte[] imageBytes, String contentType) {
        log.debug("analyzeFrame called on BrowserReportedFaceDetectionProvider - returning unverified signal");
        return FaceDetectionResult.unverified(
                1,
                "Server-side neural inference service is offline; relying on validated browser telemetry"
        );
    }
}
