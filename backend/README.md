# DRISHTI — AI-Powered Online Examination & Remote Proctoring Platform
## Production-Grade Spring Boot Backend Architecture & Operation Guide

DRISHTI is an enterprise-grade backend platform built with **Spring Boot 3.4.2**, **Java 17+ (LTS)**, **Spring Security 6**, and **MongoDB**. It provides complete examination lifecycle management, automated and manual grading engines, student execution controls, and a multi-layered AI remote proctoring system with live lecturer monitoring.

---

## 1. System Architecture & Technology Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Runtime & Language** | Java 17 LTS / 21 / 25 | Bytecode targeted for Java 17, verified on Java 25 runtime |
| **Framework** | Spring Boot 3.4.2 | Cloud-native production readiness, zero boilerplate |
| **Database** | MongoDB 7.0 (Spring Data MongoDB) | Audited entities, compound indexing, TTL/heartbeat queries |
| **Security** | Spring Security 6 & JJWT 0.12.6 | Stateless JWT authentication, BCrypt cost 12, `@EnableMethodSecurity` |
| **Proctoring Telemetry** | REST & TokenBucket Rate Limiter | Resilient event ingestion (30/min), heartbeats (6/min), idempotency deduplication |
| **Live Monitoring** | Server-Sent Events (SSE) | Non-blocking Spring MVC `SseEmitter` with 15s keepalive pings |
| **AI Inference Model** | `FaceDetectionProvider` Abstraction | Honest capability negotiation distinguishing browser client inference from server inference |
| **Audit Trail** | Structured Audit Service | Comprehensive operational logging with automated credential redaction |
| **Deployment** | Docker & Docker Compose | Multi-stage build with non-root user, healthchecks, automated GitHub Actions CI |

---

## 2. Layered Package Structure

```
com.drishti/
├── DrishtiApplication.java               # Application entry point (@EnableScheduling, @EnableMongoAuditing)
├── config/
│   ├── AdminBootstrapConfig.java         # Safe bootstrap of initial admin account via env vars
│   ├── CorsConfig.java                   # Environment-configurable CORS
│   ├── MongoConfig.java                  # Auditing configuration (@EnableMongoAuditing)
│   ├── OpenApiConfig.java                # Springdoc OpenAPI 3 with JWT Bearer SecurityScheme
│   └── SecurityConfig.java               # Spring Security 6 filter chain, stateless auth, BCrypt
├── controller/
│   ├── AdminController.java              # Admin platform management & proctoring summary
│   ├── AuditLogController.java           # Admin security & audit log inspection
│   ├── AuthController.java               # Registration, login, profile, logout
│   ├── LecturerExamController.java       # Lecturer exam management, questions, analytics
│   ├── LecturerProctoringController.java # Lecturer live monitoring, SSE stream, incident reviews
│   ├── StudentExamController.java        # Student exam discovery, attempt execution, submission
│   └── StudentProctoringController.java  # Student proctoring session, heartbeat, telemetry ingestion
├── dto/
│   ├── common/
│   │   └── PageResponse.java             # Standard pagination envelope
│   ├── request/                          # Validated request payloads
│   └── response/                         # Encapsulated, sanitized response payloads
├── entity/
│   ├── AuditLog.java                     # Security audit document
│   ├── Exam.java & ExamAttempt.java      # Examination and attempt documents
│   ├── ProctoringEvent.java              # Client-reported telemetry & incident event document
│   ├── ProctoringReview.java             # Human-in-the-loop instructor incident review
│   ├── ProctoringSession.java            # Real-time student proctoring session document
│   ├── User.java                         # User identity document (ADMIN, LECTURER, STUDENT)
│   └── ... (Enums for statuses, severities, event types)
├── proctoring/
│   └── ai/
│       ├── BrowserReportedFaceDetectionProvider.java # Honest client-side detection provider
│       ├── FaceDetectionProvider.java    # AI inference interface
│       ├── FaceDetectionResult.java      # Inference result model
│       └── ProviderStatus.java           # Model metadata and supported capabilities
├── repository/
│   ├── AuditLogRepository.java
│   ├── ExamAttemptRepository.java
│   ├── ExamRepository.java
│   ├── ProctoringEventRepository.java
│   ├── ProctoringReviewRepository.java
│   ├── ProctoringSessionRepository.java
│   └── UserRepository.java
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtService.java
│   ├── SecurityUtils.java
│   └── ratelimit/
│       └── RateLimitingService.java      # In-memory TokenBucket rate limiter
├── service/
│   ├── AdminService.java
│   ├── AuditLogService.java
│   ├── AuthService.java
│   ├── EvaluationService.java            # Automated & manual grading engine
│   ├── LecturerExamService.java
│   ├── ProctoringService.java            # Proctoring lifecycle & event processing
│   ├── StudentExamService.java
│   └── sse/
│       └── LecturerMonitoringEventPublisher.java # SSE pub/sub with scheduled keepalive
└── util/
    └── EmailNormalizer.java
```

---

## 3. Complete REST API Catalog

### Authentication APIs (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new student account (`Role.STUDENT`) |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials; returns signed Bearer JWT |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile and role |
| `POST` | `/api/v1/auth/logout` | Authenticated | Stateless client token discard |

### Examination Management (`/api/v1/lecturer`) — Role `LECTURER`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/lecturer/exams` | Create draft exam |
| `GET` | `/api/v1/lecturer/exams` | List exams owned by lecturer (paginated) |
| `GET` | `/api/v1/lecturer/exams/{examId}` | Get full exam details including question bank & answer keys |
| `PUT` | `/api/v1/lecturer/exams/{examId}` | Update draft exam metadata, duration and schedule |
| `POST` | `/api/v1/lecturer/exams/{examId}/questions` | Add question (Single Choice, Multiple Choice, True/False, Short Answer) |
| `PUT` | `/api/v1/lecturer/exams/{examId}/questions/{questionId}` | Update question text, options, marks, or answer keys |
| `DELETE` | `/api/v1/lecturer/exams/{examId}/questions/{questionId}` | Delete question and recalculate total marks |
| `PUT` | `/api/v1/lecturer/exams/{examId}/questions/reorder` | Update sequential question display order |
| `POST` | `/api/v1/lecturer/exams/{examId}/publish` | Validate questions/schedule and publish exam |
| `POST` | `/api/v1/lecturer/exams/{examId}/archive` | Archive exam to prevent further attempts |
| `GET` | `/api/v1/lecturer/exams/{examId}/attempts` | List student submissions and evaluated scores |
| `GET` | `/api/v1/lecturer/exams/{examId}/analytics` | Exam analytics (avg score, pass rate, score distribution) |
| `POST` | `/api/v1/lecturer/exams/{examId}/results/release` | Toggle student visibility for answer keys & detailed review |

### Student Execution & Assessment (`/api/v1/student`) — Role `STUDENT`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/student/exams/available` | List available exams within schedule |
| `GET` | `/api/v1/student/exams/{examId}` | Get exam instructions (student-safe, NO answer keys) |
| `POST` | `/api/v1/student/exams/{examId}/attempts` | Start timed attempt or resume active in-progress attempt |
| `GET` | `/api/v1/student/attempts/{attemptId}` | Get attempt state, authoritative remaining seconds, safe questions |
| `PUT` | `/api/v1/student/attempts/{attemptId}/answers` | Save answer for a question |
| `PUT` | `/api/v1/student/attempts/{attemptId}/answers/batch` | Save answers in batch |
| `POST` | `/api/v1/student/attempts/{attemptId}/submit` | Submit attempt, trigger server evaluation, return scores |
| `GET` | `/api/v1/student/attempts/{attemptId}/result` | View score and detailed breakdown (if released) |
| `GET` | `/api/v1/student/results` | Paginated list of completed attempts and score history |

### Student Proctoring Telemetry (`/api/v1/student/proctoring`) — Role `STUDENT`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/student/proctoring/session/{attemptId}` | Initialize or retrieve active proctoring session |
| `GET` | `/api/v1/student/proctoring/session/{attemptId}` | Get current proctoring session metadata |
| `POST` | `/api/v1/student/proctoring/session/{sessionId}/heartbeat` | Send keepalive heartbeat (rate limited: 6/min) |
| `PUT` | `/api/v1/student/proctoring/session/{sessionId}/camera-status` | Report camera stream status (`STREAM_ACTIVE`, `STREAM_INTERRUPTED`) |
| `POST` | `/api/v1/student/proctoring/session/{sessionId}/events` | Ingest batch of browser telemetry events (max 20/batch, 30/min) |
| `POST` | `/api/v1/student/proctoring/session/{sessionId}/complete` | Mark proctoring session completed upon exam submission |

### Lecturer Live Proctoring & Reviews (`/api/v1/lecturer/proctoring`) — Role `LECTURER`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/lecturer/proctoring/exams/{examId}/sessions` | List student proctoring sessions for an exam |
| `GET` | `/api/v1/lecturer/proctoring/sessions/{sessionId}` | Inspect proctoring session details |
| `GET` | `/api/v1/lecturer/proctoring/sessions/{sessionId}/events` | Paginated event history for an individual session |
| `GET` | `/api/v1/lecturer/proctoring/exams/{examId}/summary` | Aggregate proctoring metrics (active sessions, open reviews, violations) |
| `GET` | `/api/v1/lecturer/proctoring/exams/{examId}/reviews` | List flagged incident review tasks |
| `PUT` | `/api/v1/lecturer/proctoring/reviews/{reviewId}` | Submit instructor verdict (`CONFIRMED`, `DISMISSED`) with notes |
| `GET` | `/api/v1/lecturer/proctoring/exams/{examId}/stream` | **Server-Sent Events (SSE)** real-time telemetry stream |

### Admin Platform & Security Audit (`/api/v1/admin`) — Role `ADMIN`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard/stats` | Platform summary (users by role, exams by status, total attempts) |
| `GET` | `/api/v1/admin/proctoring/summary` | Platform-wide proctoring session and review statistics |
| `GET` | `/api/v1/admin/users` | Paginated system users list with role and status filters |
| `PATCH` | `/api/v1/admin/users/{userId}/status` | Activate or deactivate user accounts |
| `GET` | `/api/v1/admin/audit-logs` | Query sanitized administrative, proctoring, and security audit trail |

---

## 4. AI Proctoring & Operational Safeguards

1. **Honest AI Detection Capabilities**:
   - `BrowserReportedFaceDetectionProvider` explicitly advertises `BROWSER_CLIENT_FACE_DETECTION`.
   - All ingested telemetry events are tagged with `EventSource.BROWSER_REPORTED`.
   - No mock server inference or fake face scores are manufactured if an external server GPU inference model is not attached.
2. **Resilience & Rate Limiting (TokenBucket Algorithm)**:
   - Heartbeat endpoints are bounded to 12 tokens with 6 refills/min to reject client spam.
   - Event ingestion is bounded to 30 tokens with 30 refills/min, rejecting payloads over 20 items.
   - Returns RFC 7807 compliant `429 Too Many Requests` via `RateLimitExceededException`.
3. **Idempotent Ingestion**:
   - Every telemetry signal accepts an optional `idempotencyKey`. If a client replays an event on network reconnect, duplicate records are prevented.
4. **Automated Incident Flagging & Human Review**:
   - Critical events (`MULTIPLE_FACES_DETECTED`, `TAB_VISIBILITY_CHANGED`, `FULLSCREEN_EXITED`) trigger an automated `ProctoringReview` in `OPEN` status.
   - The final violation status requires human lecturer resolution (`CONFIRMED` or `DISMISSED`), separating raw sensor signals from academic decisions.
5. **Connection Liveness Detection**:
   - A `@Scheduled(fixedRate = 30000)` background job inspects active sessions without heartbeats for >45 seconds and transitions them to `CONNECTION_INTERRUPTED`, broadcasting alerts to instructors.
6. **Live SSE Streaming**:
   - Lecturers subscribe to `/stream` for instant pushes of `SESSION_STARTED`, `CAMERA_STATUS_CHANGED`, `CONNECTION_INTERRUPTED`, and `PROCTORING_EVENT`.
   - Every 15 seconds, a scheduled keepalive comment (`: keepalive`) is emitted to prevent proxy and browser timeouts.
7. **Security Audit Scrubbing**:
   - `AuditLogService` sanitizes all logged metadata dictionaries, replacing keys containing `password`, `secret`, `token`, or `auth` with `[REDACTED]`, and truncates entries over 500 characters.

---

## 5. Docker & Production Deployment

### Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed, then run:

```bash
# Start MongoDB and DRISHTI backend in containers
docker compose up -d --build

# Inspect logs
docker compose logs -f backend

# Verify health status
curl http://localhost:8080/actuator/health
```

### Environment Variables Template (`.env`)

```ini
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/drishti_db
JWT_SECRET=4c8a91f2e6b7d3a0c5e8f1b4a7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4
JWT_EXPIRATION_MS=86400000
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@drishti.edu
BOOTSTRAP_ADMIN_PASSWORD=AdminSecurePassword123!
```

---

## 6. Automated Test Verification

Execute all unit, integration, and MockMvc controller tests using the Maven wrapper:

```powershell
# From the backend directory:
.\mvnw.cmd test
```

### Verified Test Run Results:
```
[INFO] Results:
[INFO] 
[INFO] Tests run: 85, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
