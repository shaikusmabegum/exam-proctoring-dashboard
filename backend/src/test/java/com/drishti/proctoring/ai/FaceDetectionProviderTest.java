package com.drishti.proctoring.ai;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FaceDetectionProviderTest {

    private final BrowserReportedFaceDetectionProvider provider = new BrowserReportedFaceDetectionProvider();

    @Test
    @DisplayName("Provider honestly declares client-reported mode when server inference is unattached")
    void testProviderStatusHonesty() {
        ProviderStatus status = provider.getProviderStatus();
        assertNotNull(status);
        assertEquals("BROWSER_CLIENT_INFERENCE", status.getProviderName());
        assertTrue(status.isAvailable());
        assertTrue(status.getStatusMessage().contains("Client-side TensorFlow.js/MediaPipe"));
        assertTrue(status.getSupportedCapabilities().contains("BROWSER_CLIENT_FACE_DETECTION"));
    }

    @Test
    @DisplayName("analyzeFrame indicates unverified result without fabricating fake detections")
    void testAnalyzeFrameHonesty() {
        byte[] dummyFrame = new byte[]{1, 2, 3};
        FaceDetectionResult result = provider.analyzeFrame(dummyFrame, "image/jpeg");
        assertNotNull(result);
        assertFalse(result.isVerifiedByServer());
        assertTrue(result.getNotes().contains("Server-side neural inference service is offline"));
    }
}
