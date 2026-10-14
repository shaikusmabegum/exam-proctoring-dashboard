package com.drishti.proctoring.ai;

import java.util.List;

public class ProviderStatus {

    private String providerName;
    private boolean available;
    private String statusMessage;
    private List<String> supportedCapabilities;

    public ProviderStatus() {
    }

    public ProviderStatus(String providerName, boolean available, String statusMessage, List<String> supportedCapabilities) {
        this.providerName = providerName;
        this.available = available;
        this.statusMessage = statusMessage;
        this.supportedCapabilities = supportedCapabilities;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public List<String> getSupportedCapabilities() {
        return supportedCapabilities;
    }

    public void setSupportedCapabilities(List<String> supportedCapabilities) {
        this.supportedCapabilities = supportedCapabilities;
    }
}
