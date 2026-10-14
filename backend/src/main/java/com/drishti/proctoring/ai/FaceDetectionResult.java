package com.drishti.proctoring.ai;

public class FaceDetectionResult {

    private int facesDetected;
    private double confidence;
    private boolean verifiedByServer;
    private long processingTimeMs;
    private String notes;

    public FaceDetectionResult() {
    }

    public FaceDetectionResult(int facesDetected, double confidence, boolean verifiedByServer, long processingTimeMs, String notes) {
        this.facesDetected = facesDetected;
        this.confidence = confidence;
        this.verifiedByServer = verifiedByServer;
        this.processingTimeMs = processingTimeMs;
        this.notes = notes;
    }

    public static FaceDetectionResult unverified(int facesDetected, String notes) {
        return new FaceDetectionResult(facesDetected, 0.0, false, 0, notes);
    }

    public static FaceDetectionResult verified(int facesDetected, double confidence, long processingTimeMs) {
        return new FaceDetectionResult(facesDetected, confidence, true, processingTimeMs, "Verified by server-side AI model");
    }

    public int getFacesDetected() {
        return facesDetected;
    }

    public void setFacesDetected(int facesDetected) {
        this.facesDetected = facesDetected;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public boolean isVerifiedByServer() {
        return verifiedByServer;
    }

    public void setVerifiedByServer(boolean verifiedByServer) {
        this.verifiedByServer = verifiedByServer;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
