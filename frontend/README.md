# DRISHTI — Frontend Foundation & Client Architecture

> Intelligent assessments. Trusted outcomes.  
> Enterprise-grade web client for the DRISHTI AI-powered online examination and proctoring platform.

---

## 1. Overview & Technology Stack

DRISHTI is built with a modern, high-performance, strictly typed React ecosystem:

- **Framework**: React 19 + TypeScript (Strict Mode)
- **Bundler & Tooling**: Vite 8 (with `@tailwindcss/vite` and fast rolldown chunking)
- **Styling**: Tailwind CSS with custom enterprise design tokens
- **Routing**: React Router v7 with route-level code splitting (`React.lazy` + `Suspense`)
- **API Client**: Axios with centralized error normalization and Bearer token interception
- **Forms & Validation**: React Hook Form with Zod schemas
- **Icons**: Lucide React
- **Notifications**: Lightweight custom accessible Toast system (`useToast`)
- **Linting**: Oxlint for ultrafast, zero-warning code health checks

---

## 2. Prerequisites & Environment

- **Node.js**: `v18.0.0` or higher (tested on `v24.14.0`)
- **npm**: `v9.0.0` or higher (tested on `npm 11.8.0`)
- **Backend**: DRISHTI Spring Boot application running on `http://localhost:8080`

---

## 3. Installation & Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the environment configuration file:
   ```bash
   cp .env.example .env
   ```

3. Install project dependencies:
   ```bash
   npm install
   ```

---

## 4. Running the Application

### Development Server
Starts the Vite local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

### Production Build
Runs TypeScript compilation followed by Vite asset optimization and route code-splitting:
```bash
npm run build
```
Production assets are generated in `frontend/dist/`.

### Preview Production Build
Locally preview the built distribution files:
```bash
npm run preview
```

### Linting & Code Quality
Executes Oxlint on all source files:
```bash
npm run lint
```

### TypeScript Verification
```bash
npx tsc -b
```

---

## 5. Environment Variables

All client environment variables must start with the `VITE_` prefix. Configure them in `.env`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base URL of the Spring Boot REST API |

> **Security Note**: Never place MongoDB connection strings, JWT signing keys, private API keys, or server secrets in any `.env` file within `frontend/`. Vite exposes all `VITE_*` variables to the client browser bundle.

---

## 6. Architecture & Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                     # Top-level application shell with providers & router
│   │   ├── lazyPages.ts                # Route-level code-split lazy page imports (20 pages)
│   │   ├── router.tsx                  # React Router configuration with role-based routing
│   │   └── providers/
│   │       ├── AppProviders.tsx        # Composite provider wrapper
│   │       ├── AuthProvider.tsx        # Authentication state machine & session manager
│   │       ├── authContext.ts          # AuthContext definition & interfaces
│   │       ├── ToastProvider.tsx       # Toast notification provider & viewport
│   │       └── toastContext.ts         # ToastContext definition & types
│   ├── components/
│   │   ├── ui/                         # Reusable atomic UI (Button, Input, Badge, Card, Avatar, Checkbox)
│   │   ├── feedback/                   # Alert, PageLoader, Spinner, EmptyState, Modal, Skeleton, Toast
│   │   └── layout/                     # DashboardLayout (authenticated shell), AppShell, PageContainer
│   ├── features/
│   │   ├── admin/                      # Admin dashboard, users directory, exams, attempts, audit logs
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── AdminUsersPage.tsx
│   │   │   │   ├── AdminExamsPage.tsx
│   │   │   │   ├── AdminAttemptsPage.tsx
│   │   │   │   └── AdminReportsPage.tsx
│   │   │   └── services/adminService.ts
│   │   ├── lecturer/                   # Lecturer authoring, question builder, lifecycle & analytics
│   │   │   ├── pages/
│   │   │   │   ├── LecturerDashboardPage.tsx
│   │   │   │   ├── LecturerExamsPage.tsx
│   │   │   │   ├── LecturerExamCreatePage.tsx
│   │   │   │   ├── LecturerExamDetailPage.tsx
│   │   │   │   ├── LecturerQuestionsPage.tsx
│   │   │   │   ├── LecturerExamAttemptsPage.tsx
│   │   │   │   ├── LecturerExamResultsPage.tsx
│   │   │   │   └── LecturerExamAnalyticsPage.tsx
│   │   │   └── services/lecturerService.ts
│   │   ├── student/                    # Student testing portal, exam runner, timer & results
│   │   │   ├── pages/
│   │   │   │   ├── StudentDashboardPage.tsx
│   │   │   │   ├── StudentExamsPage.tsx
│   │   │   │   ├── StudentExamDetailPage.tsx
│   │   │   │   ├── StudentExamInterfacePage.tsx
│   │   │   │   ├── StudentAttemptResultPage.tsx
│   │   │   │   ├── StudentResultsHistoryPage.tsx
│   │   │   │   └── StudentProfilePage.tsx
│   │   │   └── services/studentService.ts
│   │   └── auth/                       # Login, registration, forgot password, reset password
│   ├── hooks/                          # useAuth, useToast
│   ├── lib/
│   │   ├── api/                        # Centralized Axios client & normalized error handling
│   │   └── utils/                      # cn utility, constants
│   ├── routes/                         # ProtectedRoute, RoleRoute, PublicRoute, Landing, 403, 404
│   ├── types/                          # admin.ts, attempt.ts, exam.ts, user.ts, api.ts
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 7. Role-Based Navigation & Workflow Routing

The application implements three dedicated, role-authorized route trees wrapped inside the responsive `DashboardLayout` application shell:

### Administrator (`ROLE_ADMIN`)
- `/admin/dashboard`: Platform KPIs, user distribution charts, and exam status distributions.
- `/admin/users`: User directory with full-text search, role filters, status badges, and status toggle modal (with self-deactivation safeguards).
- `/admin/exams`: Platform-wide examination registry with status filters and metadata overview.
- `/admin/attempts`: Live and completed examination attempts monitoring across all subjects.
- `/admin/reports`: Security audit trail log browser with actor, action, and status filtering.

### Lecturer (`ROLE_LECTURER`)
- `/lecturer/dashboard`: Exam authoring metrics, recent exams, quick creation links, and candidate attempt activity.
- `/lecturer/exams`: Examination repository with quick actions to edit questions, inspect attempts, release results, and view analytics.
- `/lecturer/exams/new`: Multi-section examination creation wizard (basic details, schedule window, passing marks, negative marking, question randomization).
- `/lecturer/exams/:examId`: Exam lifecycle command center (publish exam, archive exam, release results toggle, metadata breakdown).
- `/lecturer/exams/:examId/questions`: Interactive Question Builder supporting Single Choice, Multiple Choice, True/False, and Short Answer question types with option editing, answer keys, marks, rationales, accessible reordering (Up/Down), and delete confirmation.
- `/lecturer/exams/:examId/attempts`: Student attempt log table for the examination session.
- `/lecturer/exams/:examId/results`: Student submission evaluations and public result release toggle.
- `/lecturer/exams/:examId/analytics`: Summary KPIs, Recharts score distribution histogram, and pass/fail breakdown.

### Student (`ROLE_STUDENT`)
- `/student/dashboard`: Personalized dashboard with greeting, active session counter, upcoming testing windows, and recent scorecard summaries.
- `/student/exams`: Available exams list with search, timing parameters, and direct entry buttons.
- `/student/exams/:examId`: Examination instructions, integrity code, and attempt confirmation modal.
- `/student/attempts/:attemptId`: Distraction-minimized examination runner featuring:
  - Authoritative server timer countdown synchronized with backend attempt expiry.
  - Automatic submission when the timer expires.
  - Compact proctoring indicator showing active session state, webcam feed status, and network connection.
  - Automated telemetry listeners for tab visibility switches (`visibilitychange`), fullscreen changes, and network offline/online events.
  - Grid-based Question Navigator indicating answered, unanswered, and active items.
  - Debounced answer autosaving with saving/saved/error status indicators.
  - Full support for single choice, multiple choice, true/false, and short answer inputs.
  - Keyboard accessible and responsive across mobile, tablet, and desktop viewports.
  - Final submission confirmation modal summarizing unanswered questions and closing proctoring session.
- `/student/exams/:examId/pre-check`: Pre-examination hardware readiness and privacy consent console:
  - Fetches exam details and proctoring requirements from backend.
  - Explains what signals are collected and why before requesting hardware access.
  - Explicit user-triggered webcam and microphone checks using `navigator.mediaDevices.getUserMedia`.
  - Live video preview with mirror toggle and stream status overlays.
  - Safe track teardown on component unmount and retry diagnostics for denied/busy devices.
  - Network stability indicator and fullscreen mode tester.
  - Enforces mandatory hardware pass and legal student consent acknowledgment before exam entry.
- `/student/attempts/:attemptId/result`: Comprehensive scorecard featuring raw score, percentage, pass/fail badge, and question-by-question breakdown when released by the instructor.
- `/student/results`: Historical transcript of completed examinations.
- `/student/profile`: Student profile card with role verification and session management.
- `/lecturer/monitoring`: Live monitoring hub listing all lecturer examinations with active testing window indicators.
- `/lecturer/monitoring/:examId`: Full-featured exam operations monitoring dashboard:
  - 6 KPI summary cards (Total Sessions, Active Streams, Connection Drops, Signals Ingested, Flagged Reviews, Confirmed Violations).
  - Searchable and status-filterable candidate session table.
  - Slide-out audit drawer (`SessionDetailDrawer`) showing student metadata, keepalive timestamp, and full chronological telemetry event timeline.
  - Flagged incident adjudication table and modal (`ReviewDecisionDialog`) for recording lecturer decisions (`CONFIRMED`, `DISMISSED`, `UNDER_REVIEW`, `OPEN`) with notes.
  - Resilient polling connection manager with visible last-updated timestamp and honest status badge.

---

## 8. Proctoring Architecture & Privacy Principles

### 1. Privacy & Consent First
- **No Background Hardware Spying**: Camera and microphone access is never requested on page mount. It requires an explicit user action ("Enable Camera").
- **No Video Recording Storage**: The frontend previews the local camera stream purely for validation; it never uploads video blobs or stores recordings without user consent and backend support.
- **Immediate Resource Teardown**: All media tracks are stopped immediately upon page navigation or component unmount.

### 2. Live Connection & Resilient Polling
- **Native SSE Limitation**: The native browser `EventSource` cannot send `Authorization: Bearer <token>` headers without insecurely exposing JWTs in URL query strings. Drishti avoids URL tokens and implements resilient 10s polling with an honest `Live Polling (10s)` indicator.
- **Keepalive Heartbeat**: Student proctoring sessions send keepalive pings every 30 seconds to `/api/v1/student/proctoring/sessions/{sessionId}/heartbeat`. Heartbeats immediately stop on exam submission.
- **Batch Event Queuing**: Telemetry signals (tab switch, fullscreen exit, network loss) are queued and batched to `/api/v1/student/proctoring/sessions/{sessionId}/events`.

### 3. Objective Provenance & Human Oversight
- Every telemetry signal displays its objective provenance (`BROWSER_REPORTED`, `AI_PROVIDER_VERIFIED`, or `SERVER_LIFECYCLE`).
- Flagged events are neutrally labeled ("Flagged Incident", "Requires Review"). Students are never automatically disqualified by client-side heuristics.
- Lecturers adjudicate flagged incidents using the backend review workflow with mandatory audit notes.

---

## 9. Backend API Endpoints & Contract Matrix

| Endpoint | Method | Role Required | Frontend Service Method | Backend Controller |
| :--- | :---: | :---: | :--- | :--- |
| `/api/v1/auth/login` | POST | Public | `authService.login()` | `AuthController` |
| `/api/v1/auth/register` | POST | Public | `authService.register()` | `AuthController` |
| `/api/v1/auth/me` | GET | Authenticated | `authService.getCurrentUser()` | `AuthController` |
| `/api/v1/auth/logout` | POST | Authenticated | `authService.logout()` | `AuthController` |
| `/api/v1/admin/dashboard/stats` | GET | ADMIN | `adminService.getDashboardStats()` | `AdminController` |
| `/api/v1/admin/proctoring/summary` | GET | ADMIN | `adminService.getProctoringSummary()` | `AdminController` |
| `/api/v1/admin/users` | GET | ADMIN | `adminService.getUsers()` | `AdminController` |
| `/api/v1/admin/users/{userId}/status` | PUT | ADMIN | `adminService.updateUserStatus()` | `AdminController` |
| `/api/v1/admin/exams` | GET | ADMIN | `adminService.getAllExams()` | `AdminController` |
| `/api/v1/admin/attempts` | GET | ADMIN | `adminService.getAllAttempts()` | `AdminController` |
| `/api/v1/admin/audit-logs` | GET | ADMIN | `adminService.getAuditLogs()` | `AuditLogController` |
| `/api/v1/lecturer/dashboard/stats` | GET | LECTURER | `lecturerService.getDashboardStats()` | `LecturerExamController` |
| `/api/v1/lecturer/exams` | GET | LECTURER | `lecturerService.getExams()` | `LecturerExamController` |
| `/api/v1/lecturer/exams` | POST | LECTURER | `lecturerService.createExam()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}` | GET | LECTURER | `lecturerService.getExamById()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}` | PUT | LECTURER | `lecturerService.updateExam()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/questions` | POST | LECTURER | `lecturerService.addQuestion()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/questions/{qId}` | PUT | LECTURER | `lecturerService.updateQuestion()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/questions/{qId}` | DELETE | LECTURER | `lecturerService.deleteQuestion()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/questions/reorder` | PUT | LECTURER | `lecturerService.reorderQuestions()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/publish` | POST | LECTURER | `lecturerService.publishExam()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/archive` | POST | LECTURER | `lecturerService.archiveExam()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/results/release` | POST | LECTURER | `lecturerService.toggleResultsRelease()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/attempts` | GET | LECTURER | `lecturerService.getExamAttempts()` | `LecturerExamController` |
| `/api/v1/lecturer/exams/{examId}/analytics` | GET | LECTURER | `lecturerService.getExamAnalytics()` | `LecturerExamController` |
| `/api/v1/lecturer/proctoring/exams/{examId}/sessions` | GET | LECTURER | `lecturerMonitoringService.getExamSessions()` | `LecturerProctoringController` |
| `/api/v1/lecturer/proctoring/exams/{examId}/summary` | GET | LECTURER | `lecturerMonitoringService.getExamSummary()` | `LecturerProctoringController` |
| `/api/v1/lecturer/proctoring/exams/{examId}/reviews` | GET | LECTURER | `lecturerMonitoringService.getExamReviews()` | `LecturerProctoringController` |
| `/api/v1/lecturer/proctoring/sessions/{sessionId}` | GET | LECTURER | `lecturerMonitoringService.getSessionDetails()` | `LecturerProctoringController` |
| `/api/v1/lecturer/proctoring/sessions/{sessionId}/events` | GET | LECTURER | `lecturerMonitoringService.getSessionEvents()` | `LecturerProctoringController` |
| `/api/v1/lecturer/proctoring/reviews/{reviewId}` | PUT | LECTURER | `lecturerMonitoringService.updateReview()` | `LecturerProctoringController` |
| `/api/v1/student/dashboard` | GET | STUDENT | `studentService.getDashboard()` | `StudentExamController` |
| `/api/v1/student/exams/available` | GET | STUDENT | `studentService.getAvailableExams()` | `StudentExamController` |
| `/api/v1/student/exams/{examId}` | GET | STUDENT | `studentService.getExamById()` | `StudentExamController` |
| `/api/v1/student/exams/{examId}/attempts` | POST | STUDENT | `studentService.startOrResumeAttempt()` | `StudentExamController` |
| `/api/v1/student/attempts/{attemptId}` | GET | STUDENT | `studentService.getAttempt()` | `StudentExamController` |
| `/api/v1/student/attempts/{attemptId}/answers` | PUT | STUDENT | `studentService.saveAnswer()` | `StudentExamController` |
| `/api/v1/student/attempts/{attemptId}/submit` | POST | STUDENT | `studentService.submitAttempt()` | `StudentExamController` |
| `/api/v1/student/attempts/{attemptId}/result` | GET | STUDENT | `studentService.getAttemptResult()` | `StudentExamController` |
| `/api/v1/student/results` | GET | STUDENT | `studentService.getResults()` | `StudentExamController` |
| `/api/v1/student/proctoring/exams/{examId}/session` | POST | STUDENT | `studentProctoringService.startOrResumeSession()` | `StudentProctoringController` |
| `/api/v1/student/proctoring/exams/{examId}/session` | GET | STUDENT | `studentProctoringService.getCurrentSession()` | `StudentProctoringController` |
| `/api/v1/student/proctoring/sessions/{sessionId}/heartbeat` | POST | STUDENT | `studentProctoringService.sendHeartbeat()` | `StudentProctoringController` |
| `/api/v1/student/proctoring/sessions/{sessionId}/camera-status` | PUT | STUDENT | `studentProctoringService.updateCameraStatus()` | `StudentProctoringController` |
| `/api/v1/student/proctoring/sessions/{sessionId}/events` | POST | STUDENT | `studentProctoringService.ingestEvents()` | `StudentProctoringController` |
| `/api/v1/student/proctoring/sessions/{sessionId}/complete` | POST | STUDENT | `studentProctoringService.completeSession()` | `StudentProctoringController` |

---

## 10. Verification, Tests & Quality Assurance

- **Unit & Integration Test Suite**: 10 tests passing via Node test runner (`npm test`)
  - Device check state transitions and permission denial blocking
  - Stream cleanup track teardown verification
  - Event telemetry batching and queue flush logic
  - Duplicate session initiation prevention
  - Severity ranking comparison and adjudication transitions
  - Session candidate filtering and search logic
- **TypeScript Strict Compilation**: Zero errors (`npx tsc -b`)
- **Oxlint Code Quality**: Zero warnings and zero errors across all 101 files (`npm run lint`)
- **Vite Production Bundler**: Zero build errors, 23 chunk modules created (`npm run build`)
- **Accessibility & UX**: ARIA modal attributes, keyboard navigation, high-contrast badges, non-color-exclusive severity indicators, and mobile-responsive layouts tested down to 360px.
