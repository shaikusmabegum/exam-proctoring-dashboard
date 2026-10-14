package com.drishti.service.sse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class LecturerMonitoringEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(LecturerMonitoringEventPublisher.class);
    private static final long SSE_TIMEOUT_MS = 15 * 60 * 1000L; // 15 minutes

    private final Map<String, List<SseEmitter>> examEmitters = new ConcurrentHashMap<>();

    /**
     * Subscribes a lecturer to live real-time proctoring updates for an exam.
     */
    public SseEmitter subscribe(String examId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        List<SseEmitter> emitters = examEmitters.computeIfAbsent(examId, k -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> {
            log.debug("SSE emitter completed for exam: [{}]", examId);
            emitters.remove(emitter);
        });

        emitter.onTimeout(() -> {
            log.debug("SSE emitter timed out for exam: [{}]", examId);
            emitters.remove(emitter);
        });

        emitter.onError(ex -> {
            log.debug("SSE emitter error for exam [{}]: {}", examId, ex.getMessage());
            emitters.remove(emitter);
        });

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Connected to live proctoring stream for exam: " + examId));
        } catch (IOException e) {
            log.warn("Failed to send initial SSE connected event: {}", e.getMessage());
            emitters.remove(emitter);
        }

        return emitter;
    }

    /**
     * Publishes a proctoring event to all active lecturer connections for the specified exam.
     */
    public void publishEvent(String examId, Object eventData) {
        List<SseEmitter> emitters = examEmitters.get(examId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("PROCTORING_EVENT")
                        .data(eventData));
            } catch (Exception e) {
                log.debug("Removing failed SSE emitter for exam [{}]: {}", examId, e.getMessage());
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    /**
     * Periodic keepalive heartbeat comment to prevent proxy or browser timeout.
     */
    @Scheduled(fixedRate = 15000)
    public void sendHeartbeats() {
        examEmitters.forEach((examId, emitters) -> {
            List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().comment("keepalive"));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            emitters.removeAll(deadEmitters);
        });
    }
}
