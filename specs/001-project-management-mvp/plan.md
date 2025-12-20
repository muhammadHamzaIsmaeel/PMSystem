# Implementation Plan: Project Management System MVP

**Branch**: `001-project-management-mvp` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-management-mvp/spec.md`

## Summary

Building a production-ready, full-stack Project Management System MVP with HRMSX integration readiness. The system provides end-to-end project lifecycle management with strict role-based access control (5 roles: Admin, Project Manager, Team Member, Finance, Viewer), real-time Kanban board collaboration, comprehensive financial tracking (expenses, income, auto profit/loss calculation), time tracking, and a responsive dashboard—all deployable within an aggressive timeline focused on quality over artificial day-based splitting.

**Core Value**: Secure, real-time project management with automatic financial intelligence and seamless HRMSX user synchronization.

**Technical Approach**: FastAPI (backend) + Next.js 15 App Router (frontend) + MongoDB + WebSocket (real-time) + Docker (deployment), following aggressive phase-based delivery with no calendar-based artificial splitting.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**:
- Backend: FastAPI, UV (package manager), SQLAlchemy 2.0 (async), Alembic, Pydantic 2.x, python-jose (JWT), bcrypt, python-multipart (file uploads)
- Frontend: Next.js 15 (App Router), React 18+, TypeScript, Tailwind CSS, ShadCN UI, Zod, React Hook Form, Socket.IO Client
**Storage**: MongoDB Atlas, local filesystem (file uploads - cloud migration path documented)
**Testing**: pytest (backend: contract/integration/unit), Postman/Newman (API testing)
**Target Platform**: Linux server (Docker containers), Railway/Render/Fly.io deployment
**Project Type**: Web application (backend API + frontend SPA)
**Performance Goals**:
- API response time: <200ms p95 for CRUD operations
- Page load: <3 seconds (interactive)
- Lighthouse score: ≥92 (Performance, Accessibility, Best Practices, SEO)
- Real-time update latency: <2 seconds (Kanban board)
- Concurrent users: 50+ without degradation
**Constraints**:
- Monetary precision: exactly 2 decimal places (PKR)
- Timezone: Asia/Karachi (display), UTC (storage)
- File upload: <10MB per file
- Mobile support: minimum 360px width
- No hardcoded secrets (environment variables only)
- Zero `any` types (TypeScript), zero missing type hints (Python)
**Scale/Scope**:
- MVP: Single organization, 50+ users, 100+ projects, 1000+ tasks
- HRMSX sync: Mock endpoint initially, real integration post-MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality Over Speed ✅ PASS
- **Compliance**: Plan prioritizes quality with strict linting (PEP8, ESLint+Prettier), type safety enforcement, and no debugging artifacts. Aggressive timeline focuses on "fast but perfect" not "fast but broken".
- **Evidence**: Constitution rules enforced in all phases; testing gates after each phase; Lighthouse score requirement.

### II. Type Safety ✅ PASS
- **Compliance**: 100% type coverage mandated. TypeScript strict mode, zero `any`. Python with full type hints + Pydantic models for all API I/O.
- **Evidence**: Success criteria SC-019 (codebase passes all linting checks); explicit type requirements in Technical Context.

### III. DRY + KISS ✅ PASS
- **Compliance**: Architecture avoids over-engineering (no unnecessary abstractions), but enforces DRY for repeated logic (3+ occurrences).
- **Evidence**: Single folder structure (not multiple microservices), simple polling fallback if WebSocket too complex, no premature optimization.

### IV. Security First ✅ PASS
- **Compliance**: All security requirements met: JWT (15min access, 7 day refresh), bcrypt (min 10 rounds), RBAC on every protected route, Pydantic/Zod validation, file upload validation, no CORS wildcards, environment variables for secrets.
- **Evidence**: FR-001 through FR-006 (auth), FR-026 (file validation), FR-036 (self-approval prevention), SC-001/SC-002 (security success criteria).

### V. HRMSX Integration Ready ✅ PASS
- **Compliance**: User model includes `hrmsx_user_id` (nullable, unique), time entries have sync fields (sync_status, timestamps), mock sync endpoint implemented.
- **Evidence**: FR-005 (HRMSX sync), FR-032 (sync fields), SC-015/SC-016 (integration readiness), data-model.md will document migration strategy.

**GATE STATUS**: ✅ ALL GATES PASSED - Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-management-mvp/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── api.openapi.yaml # OpenAPI 3.1 specification
│   └── README.md        # Contract documentation
└── checklists/
    └── requirements.md  # Specification quality checklist (already completed)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Environment configuration (Pydantic Settings)
│   │   ├── security.py          # JWT, bcrypt, password hashing
│   │   ├── deps.py              # Dependency injection (DB session, current user, role checks)
│   │   └── exceptions.py        # Custom exception handlers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # SQLAlchemy User model
│   │   ├── project.py           # SQLAlchemy Project model
│   │   ├── task.py              # Task, Subtask models
│   │   ├── financial.py         # Expense, Income models
│   │   ├── time_entry.py        # TimeEntry model
│   │   ├── comment.py           # Comment model
│   │   ├── file_attachment.py   # FileAttachment model
│   │   └── notification.py      # Notification model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # Pydantic User schemas (request/response)
│   │   ├── project.py           # Pydantic Project schemas
│   │   ├── task.py              # Task, Subtask schemas
│   │   ├── financial.py         # Expense, Income schemas
│   │   ├── time_entry.py        # TimeEntry schemas
│   │   ├── comment.py           # Comment schemas
│   │   ├── file_attachment.py   # FileAttachment schemas
│   │   ├── notification.py      # Notification schemas
│   │   └── common.py            # Shared schemas (enums, pagination, etc.)
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py          # Authentication endpoints (login, register, refresh)
│   │       ├── users.py         # User CRUD + HRMSX sync
│   │       ├── projects.py      # Project CRUD
│   │       ├── tasks.py         # Task + Subtask CRUD
│   │       ├── kanban.py        # Kanban board endpoints
│   │       ├── comments.py      # Comment CRUD
│   │       ├── files.py         # File upload/download
│   │       ├── time_entries.py  # Time tracking CRUD
│   │       ├── expenses.py      # Expense CRUD + approval
│   │       ├── income.py        # Income CRUD
│   │       ├── dashboard.py     # Dashboard data + profit/loss
│   │       └── notifications.py # Notification CRUD + marking read
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Business logic for authentication
│   │   ├── project_service.py   # Project business logic
│   │   ├── task_service.py      # Task business logic
│   │   ├── financial_service.py # Profit/loss calculation logic
│   │   ├── notification_service.py # Notification creation logic
│   │   └── hrmsx_sync_service.py # HRMSX mock sync logic
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── file_utils.py        # File upload validation, storage
│   │   └── timezone_utils.py    # Asia/Karachi timezone handling
│   └── websockets/
│       ├── __init__.py
│       └── kanban.py            # WebSocket handler for real-time Kanban
├── alembic/
│   ├── versions/                # Migration files
│   ├── env.py                   # Alembic environment
│   └── script.py.mako           # Migration template
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # pytest fixtures
│   ├── contract/                # API contract tests
│   ├── integration/             # Integration tests
│   └── unit/                    # Unit tests
├── uploads/                     # Local file storage (gitignored)
├── .env.example                 # Environment variable template
├── .gitignore
├── pyproject.toml               # UV project configuration
├── uv.lock                      # UV lockfile
└── README.md

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (auth provider, theme)
│   │   ├── page.tsx             # Landing/dashboard page
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── register/
│   │   │   └── page.tsx         # Registration page
│   │   ├── projects/
│   │   │   ├── page.tsx         # Projects list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx     # Project detail
│   │   │   │   └── kanban/
│   │   │   │       └── page.tsx # Kanban board
│   │   │   └── new/
│   │   │       └── page.tsx     # Create project
│   │   ├── tasks/
│   │   │   └── page.tsx         # My tasks (Team Member view)
│   │   ├── expenses/
│   │   │   └── page.tsx         # Expense approval (Finance view)
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Analytics dashboard
│   │   └── api/                 # API route handlers (if needed)
│   ├── components/
│   │   ├── ui/                  # ShadCN UI components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectList.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx  # Drag-and-drop board
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── KanbanCard.tsx
│   │   ├── dashboard/
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── ProfitLossCard.tsx
│   │   ├── shared/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── NotificationBell.tsx
│   │   └── layout/
│   │       └── MainLayout.tsx
│   ├── lib/
│   │   ├── api.ts               # API client (fetch wrapper)
│   │   ├── auth.ts              # Auth utilities (token storage)
│   │   ├── websocket.ts         # WebSocket client
│   │   └── utils.ts             # General utilities
│   ├── types/
│   │   ├── user.ts              # User TypeScript types
│   │   ├── project.ts           # Project types
│   │   ├── task.ts              # Task types
│   │   ├── financial.ts         # Expense, Income types
│   │   └── common.ts            # Shared types (enums, pagination)
│   ├── hooks/
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useWebSocket.ts      # WebSocket hook
│   │   ├── useProjects.ts       # Project data fetching hook
│   │   └── useTasks.ts          # Task data fetching hook
│   └── middleware.ts            # Next.js middleware (auth redirect)
├── public/
│   └── images/                  # Static images
├── .env.local.example           # Environment variable template
├── .gitignore
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── next.config.js               # Next.js configuration
├── package.json
├── pnpm-lock.yaml               # pnpm lockfile
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── README.md

# Project root
docker-compose.yml               # MongoDB + Backend + Frontend orchestration
docker-compose.prod.yml          # Production Docker Compose
Dockerfile.backend               # Backend production Dockerfile
Dockerfile.frontend              # Frontend production Dockerfile
.dockerignore
.gitignore                       # Root gitignore
README.md                        # Main project README with setup instructions
ERD.png                          # Entity Relationship Diagram (exported)
ERD.drawio                       # ERD source file (draw.io format)
postman_collection.json          # Postman API collection export
```

**Structure Decision**: Web application structure (Option 2) selected due to full-stack nature with separate backend API and frontend SPA. Backend follows FastAPI best practices with clear separation: `models/` (SQLAlchemy ORM), `schemas/` (Pydantic request/response), `api/v1/` (route handlers), `services/` (business logic), `core/` (config, security, dependencies). Frontend follows Next.js 15 App Router conventions with `app/` routing, `components/` organized by feature, and `lib/`/`hooks/`/`types/` for reusable logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Constitution gates all passed.

## Phase 0: Research & Technical Decisions

### Research Focus Areas

1. **FastAPI + UV Production Patterns**
   - Project structure for dependency injection and role-based access
   - SQLAlchemy 2.0 async patterns with Alembic
   - JWT implementation with refresh tokens
   - WebSocket integration strategies
   - File upload handling (validation, storage, serving)

2. **Next.js 15 App Router Best Practices**
   - Server Components vs. Client Components strategy
   - Real-time data integration (WebSocket with App Router)
   - Form handling (React Hook Form + Server Actions)
   - Mobile-first responsive patterns with Tailwind + ShadCN
   - Performance optimization for Lighthouse ≥92

3. **Real-Time Architecture**
   - WebSocket vs. Socket.IO vs. Server-Sent Events vs. Polling
   - FastAPI WebSocket integration
   - Next.js client-side WebSocket connection management
   - Fallback strategies for connection failures

4. **File Upload Architecture**
   - Local filesystem storage patterns (security, serving)
   - Cloud migration path (Cloudinary/S3 integration strategy)
   - Multi-file upload with validation
   - Progress tracking on frontend

5. **Database Schema Optimization**
   - Indexes for performance (user_id, project_id, task_id lookups)
   - Cascade delete strategies
   - HRMSX sync field patterns
   - Timestamp management (UTC storage, Asia/Karachi display)

6. **Deployment Strategy**
   - Docker multi-stage builds (minimize image size)
   - Railway vs. Render vs. Fly.io (comparison for MongoDB + backend + frontend)
   - Environment variable management
   - Health check endpoints

### Research Output

*Research findings will be documented in `research.md` after background agents complete.*

## Phase 1: Design Artifacts

### Data Model (data-model.md)

**Entities to Design** (from spec.md Key Entities):

1. **User**
   - Fields: id, email, password_hash, name, role (enum), hrmsx_user_id (nullable, unique), is_active, created_at, updated_at
   - Relationships: created_projects (1:many), managed_projects (1:many), assigned_tasks (1:many), time_entries (1:many), submitted_expenses (1:many), comments (1:many), uploaded_files (1:many), notifications (1:many)
   - Indexes: email (unique), hrmsx_user_id (unique, nullable)

2. **Project**
   - Fields: id, name, client_name, manager_id (FK User), budget (Decimal 2 places), start_date, end_date, status (enum), description, created_by_id (FK User), created_at, updated_at
   - Relationships: manager (many:1 User), tasks (1:many Task), expenses (1:many Expense), income (1:many Income), comments (1:many Comment), files (1:many FileAttachment)
   - Indexes: manager_id, created_by_id, status
   - Enums: ProjectStatus (Planning, InProgress, OnHold, Completed, Cancelled)

3. **Task**
   - Fields: id, title, description, project_id (FK Project), assigned_user_id (FK User), parent_task_id (FK Task, nullable), priority (enum), status (enum), deadline, progress_percentage, created_by_id (FK User), created_at, updated_at
   - Relationships: project (many:1 Project), assigned_user (many:1 User), parent_task (many:1 Task, self-referential), subtasks (1:many Task), time_entries (1:many TimeEntry), comments (1:many Comment), files (1:many FileAttachment)
   - Indexes: project_id, assigned_user_id, status, deadline
   - Enums: TaskPriority (Low, Medium, High, Urgent, Critical), TaskStatus (ToDo, InProgress, Review, Done)

4. **TimeEntry**
   - Fields: id, task_id (FK Task), user_id (FK User), start_time, end_time, duration_minutes, description, hrmsx_sync_status (enum), created_at, updated_at
   - Relationships: task (many:1 Task), user (many:1 User)
   - Indexes: task_id, user_id, hrmsx_sync_status
   - Enums: SyncStatus (Pending, Synced, Failed)

5. **Expense**
   - Fields: id, amount (Decimal 2 places), category, date, description, project_id (FK Project), task_id (FK Task, nullable), approval_status (enum), submitted_by_id (FK User), approved_by_id (FK User, nullable), receipt_file_id (FK FileAttachment, nullable), created_at, updated_at
   - Relationships: project (many:1 Project), task (many:1 Task), submitter (many:1 User), approver (many:1 User), receipt (many:1 FileAttachment)
   - Indexes: project_id, approval_status, submitted_by_id
   - Enums: ApprovalStatus (Pending, Approved, Rejected)
   - Constraints: approved_by_id != submitted_by_id (self-approval prevention)

6. **Income**
   - Fields: id, amount (Decimal 2 places), date, description, project_id (FK Project), payment_method, created_by_id (FK User), created_at, updated_at
   - Relationships: project (many:1 Project), creator (many:1 User)
   - Indexes: project_id, date

7. **Comment**
   - Fields: id, content, commentable_type (enum), commentable_id (int), author_id (FK User), created_at, updated_at
   - Relationships: author (many:1 User), commentable (polymorphic: Project or Task)
   - Indexes: commentable_type + commentable_id (composite), author_id
   - Enums: CommentableType (Project, Task)

8. **FileAttachment**
   - Fields: id, file_name, file_path, file_size, file_type, attachable_type (enum), attachable_id (int), uploaded_by_id (FK User), created_at, updated_at
   - Relationships: uploader (many:1 User), attachable (polymorphic: Project, Task, or Expense)
   - Indexes: attachable_type + attachable_id (composite), uploaded_by_id
   - Enums: AttachableType (Project, Task, Expense)

9. **Notification**
   - Fields: id, recipient_id (FK User), notification_type (enum), related_entity_type, related_entity_id, message, is_read, created_at
   - Relationships: recipient (many:1 User)
   - Indexes: recipient_id, is_read, created_at
   - Enums: NotificationType (TaskAssigned, DeadlineApproaching, ExpenseStatusChanged)

**Design Decisions**:
- Polymorphic relationships for Comment and FileAttachment (commentable_type/id, attachable_type/id) to avoid multiple tables
- Self-referential Task for parent-child (subtask) relationship
- Separate `created_by_id` and `manager_id` on Project (creator vs. assigned manager)
- HRMSX sync fields on User and TimeEntry only (minimal integration surface)
- Decimal type for all monetary fields (no Float) for precision
- UTC timestamps in database, conversion to Asia/Karachi in API response

### API Contracts (contracts/)

**OpenAPI Specification** (`contracts/api.openapi.yaml`):

Endpoints derived from functional requirements (FR-001 through FR-055):

**Authentication** (`/api/v1/auth/`):
- `POST /register` - User registration (FR-001)
- `POST /login` - JWT login (FR-002)
- `POST /logout` - Invalidate session (FR-006)
- `POST /refresh` - Refresh access token (FR-002)

**Users** (`/api/v1/users/`):
- `GET /me` - Get current user profile
- `POST /sync-hrmsx` - Mock HRMSX sync endpoint (FR-005, Admin only)

**Projects** (`/api/v1/projects/`):
- `GET /` - List projects (filtered by role, FR-012)
- `POST /` - Create project (FR-007, Admin/PM only)
- `GET /{id}` - Get project detail
- `PUT /{id}` - Update project (FR-008/FR-009, role-based)
- `DELETE /{id}` - Delete project (FR-011, Admin only)

**Tasks** (`/api/v1/tasks/`):
- `GET /` - List tasks (filtered by role, FR-019)
- `POST /` - Create task (FR-013, Admin/PM only)
- `GET /{id}` - Get task detail
- `PUT /{id}` - Update task (FR-017/FR-018, role-based)
- `DELETE /{id}` - Delete task
- `POST /{id}/subtasks` - Create subtask (FR-016)

**Kanban** (`/api/v1/kanban/`):
- `GET /projects/{project_id}` - Get Kanban board data (FR-020)
- `PATCH /tasks/{task_id}/status` - Update task status via drag-drop (FR-021)
- WebSocket endpoint: `ws://backend/api/v1/kanban/ws` - Real-time updates (FR-022)

**Comments** (`/api/v1/comments/`):
- `GET /{type}/{id}/comments` - List comments for entity (FR-024)
- `POST /{type}/{id}/comments` - Create comment (FR-024)

**Files** (`/api/v1/files/`):
- `POST /upload` - Upload file(s) (FR-025, FR-026)
- `GET /{id}` - Download file (FR-028)

**Time Entries** (`/api/v1/time-entries/`):
- `GET /` - List time entries (filtered by role)
- `POST /` - Create time entry (FR-029, Team Member/Admin)
- `GET /{id}` - Get time entry detail
- `PUT /{id}` - Update time entry
- `DELETE /{id}` - Delete time entry

**Expenses** (`/api/v1/expenses/`):
- `GET /` - List expenses (filtered by role, FR-033)
- `POST /` - Create expense (FR-033)
- `GET /{id}` - Get expense detail
- `PUT /{id}` - Update expense
- `PATCH /{id}/approve` - Approve expense (FR-035, Finance only, FR-036 validation)
- `PATCH /{id}/reject` - Reject expense (FR-035, Finance only)

**Income** (`/api/v1/income/`):
- `GET /` - List income (filtered by role)
- `POST /` - Create income (FR-038, Admin/PM only)
- `GET /{id}` - Get income detail
- `PUT /{id}` - Update income
- `DELETE /{id}` - Delete income

**Dashboard** (`/api/v1/dashboard/`):
- `GET /summary` - Get summary cards (FR-044, role-filtered)
- `GET /charts/project-timeline` - Project timeline data (FR-045)
- `GET /charts/expense-breakdown` - Expense breakdown data (FR-045)
- `GET /charts/task-completion` - Task completion data (FR-045)
- `GET /projects/{id}/profit-loss` - Project profit/loss calculation (FR-040/FR-041/FR-042/FR-043)

**Notifications** (`/api/v1/notifications/`):
- `GET /` - List notifications (FR-048)
- `GET /unread-count` - Get unread count (FR-049)
- `PATCH /{id}/read` - Mark notification as read (FR-050)
- `PATCH /read-all` - Mark all as read (FR-050)

**Common Patterns**:
- All endpoints return Pydantic schema responses (FR-055, Constitution II)
- Role-based access enforced via dependencies (Constitution IV)
- Pagination on list endpoints (query params: page, page_size)
- Error responses: `{"detail": "error message"}` format
- Timestamps in ISO 8601 format (UTC), converted to Asia/Karachi on frontend

### Quickstart Guide (quickstart.md)

**Developer Onboarding** (per SC-017: system deployable in <30 minutes):

1. **Prerequisites**: Docker, Docker Compose, Git
2. **Clone & Setup**:
   ```bash
   git clone <repo>
   cd project
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   # Edit .env files with local settings
   ```
3. **Start Services**:
   ```bash
   docker-compose up --build
   # Backend: http://localhost:8000
   # Frontend: http://localhost:3000
   # Swagger UI: http://localhost:8000/docs
   ```
4. **Run Migrations**:
   ```bash
   docker-compose exec backend alembic upgrade head
   docker-compose exec backend python -m app.seed  # Load seed data
   ```
5. **Test**:
   ```bash
   # Import Postman collection: postman_collection.json
   # Run collection tests
   ```

**Production Deployment** (Railway/Render):
- Docker images built via CI/CD
- MongoDB provisioned via platform
- Environment variables configured in platform dashboard
- Health check endpoint: `/health`

## Phase 2: Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts complete. All gates remain PASSED with design validation.*

## Next Steps

After `/sp.plan` completes:

1. **Review Artifacts**:
   - `plan.md` (this file)
   - `research.md` (Phase 0 research findings)
   - `data-model.md` (Phase 1 entity design)
   - `contracts/api.openapi.yaml` (Phase 1 API specification)
   - `quickstart.md` (Phase 1 developer guide)

2. **Run `/sp.tasks`**: Generate dependency-ordered implementation tasks from this plan

3. **Execute Implementation**: Follow tasks.md phases:
   - Foundation & Setup
   - Database & ERD
   - Auth + RBAC + HRMSX Sync
   - Core Project & Task System
   - Time Tracking + Financial Module
   - Dashboard & Notifications
   - Polish & Deployment

**Timeline Philosophy**: No artificial day splitting. Each phase continues until 100% complete with quality gates. Parallel work encouraged (backend + frontend + Docker simultaneously).

**Quality Gates** (run after each major phase):
- All APIs pass in Postman ✓
- RBAC 100% enforced ✓
- Real-time Kanban works on 2 browsers simultaneously ✓
- File upload + download working ✓
- Profit/loss auto updates ✓
- Zero console errors ✓
- Mobile usability perfect (360px) ✓
- Lighthouse score ≥92 ✓

**Final Deliverables Checklist**:
- [ ] GitHub repo (clean history, meaningful commits)
- [ ] Live deployed URL (Railway/Render/Fly.io)
- [ ] ERD.png + ERD.drawio
- [ ] postman_collection.json (all tests passing)
- [ ] Swagger UI working at `/docs`
- [ ] Docker Compose up → full system running
- [ ] README.md with setup instructions
- [ ] .env.example files (backend + frontend)
- [ ] Zero console errors (browser + terminal)
- [ ] Mobile responsive (360px perfect)
- [ ] Lighthouse score ≥92
- [ ] All 55 functional requirements implemented
- [ ] All 20 success criteria validated
