# Tasks: Project Management System MVP

**Input**: Design documents from `/specs/001-project-management-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this implementation as they were not explicitly requested in the feature specification. Focus is on aggressive delivery with quality built-in through linting, type safety, and constitution compliance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/`
- **Frontend**: `frontend/src/`
- **Root**: Repository root for Docker, docs, configs

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure with app/, tests/, alembic/, uploads/ folders
- [X] T002 Initialize backend Python project with UV in backend/pyproject.toml
- [X] T003 [P] Create frontend directory structure with Next.js 15 App Router in frontend/
- [X] T004 [P] Initialize frontend with pnpm and Next.js 15 in frontend/package.json
- [X] T005 [P] Configure backend linting (flake8, black, mypy) in backend/pyproject.toml
- [X] T006 [P] Configure frontend linting (ESLint + Prettier) in frontend/.eslintrc.json
- [X] T007 Create root Docker Compose with MongoDB, backend, frontend services in docker-compose.yml
- [X] T008 [P] Create backend Dockerfile with multi-stage build in Dockerfile.backend
- [X] T009 [P] Create frontend Dockerfile with Next.js optimization in Dockerfile.frontend
- [X] T010 [P] Create backend .env.example with all required environment variables
- [X] T011 [P] Create frontend .env.local.example with API and WebSocket URLs
- [X] T012 [P] Create root .gitignore with backend, frontend, Docker ignores
- [X] T013 [P] Create backend .gitignore for Python (venv, pycache, uploads)
- [X] T014 [P] Create frontend .gitignore for Node.js (node_modules, .next, build)
- [X] T015 Create README.md with project overview and quickstart reference

**Checkpoint**: Project structure ready, dependencies installable

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [X] T016 Install backend dependencies: FastAPI, UV, SQLAlchemy 2.0, Alembic, Pydantic 2.x, python-jose, bcrypt, python-multipart, uvicorn
- [X] T017 Create backend config module with Pydantic Settings in backend/app/core/config.py
- [X] T018 [P] Setup Alembic configuration in backend/alembic.ini and backend/alembic/env.py
- [X] T019 [P] Create database base model with UUID, timestamps in backend/app/models/__init__.py
- [X] T020 [P] Create MongoDB async client and connection factory in backend/app/core/database.py
- [X] T021 Create JWT utilities (create_token, decode_token) in backend/app/core/security.py
- [X] T022 [P] Create password hashing utilities (hash_password, verify_password) in backend/app/core/security.py
- [X] T023 Create dependency injection for DB session in backend/app/core/deps.py
- [X] T024 Create get_current_user dependency in backend/app/core/deps.py
- [X] T025 Create require_role dependency factory for RBAC in backend/app/core/deps.py
- [X] T026 [P] Create custom exception handlers in backend/app/core/exceptions.py
- [X] T027 [P] Create common Pydantic schemas (enums, pagination, base schemas) in backend/app/schemas/common.py
- [X] T028 Create FastAPI application with CORS, middleware in backend/app/main.py
- [X] T029 Add health check endpoint GET /health in backend/app/main.py
- [X] T030 Create API v1 router aggregator in backend/app/api/v1/__init__.py

### Frontend Foundation

- [X] T031 Install frontend dependencies: Next.js 15, React 18, TypeScript, Tailwind CSS, ShadCN UI, Zod, React Hook Form, Socket.IO Client, Zustand
- [X] T032 Configure Tailwind CSS with mobile-first config in frontend/tailwind.config.ts
- [X] T033 [P] Configure TypeScript with strict mode in frontend/tsconfig.json
- [X] T034 [P] Create common TypeScript types (enums matching backend) in frontend/src/types/common.ts
- [X] T035 Create API client with fetch wrapper and token handling in frontend/src/lib/api.ts
- [X] T036 [P] Create auth utilities (token storage, retrieval) in frontend/src/lib/auth.ts
- [X] T037 Create Zustand auth store with login, logout, persist in frontend/src/hooks/useAuth.ts
- [X] T038 [P] Create Next.js middleware for auth redirect in frontend/src/middleware.ts
- [X] T039 Create root layout with auth provider in frontend/src/app/layout.tsx
- [X] T040 [P] Create shared UI components: Navbar, Sidebar, NotificationBell in frontend/src/components/shared/
- [X] T041 [P] Create MainLayout wrapper component in frontend/src/components/layout/MainLayout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Role-Based Access (Priority: P1) 🎯 MVP

**Goal**: Implement rock-solid authentication and RBAC so each user (Admin, Project Manager, Team Member, Finance, Viewer) can only access data appropriate to their role.

**Independent Test**: Log in as different roles and verify each sees only permitted data and actions. Test unauthorized access attempts return 403.

### Backend: Authentication & Users

- [X] T042 [P] [US1] Create User SQLAlchemy model with 9 fields (id, email, password_hash, name, role, hrmsx_user_id, is_active, timestamps) in backend/app/models/user.py
- [X] T043 [P] [US1] Create UserRole enum (Admin, ProjectManager, TeamMember, Finance, Viewer) in backend/app/models/user.py
- [X] T044 [P] [US1] Create User Pydantic schemas (UserCreate, UserLogin, UserResponse, UserUpdate) in backend/app/schemas/user.py
- [X] T045 [US1] Create Alembic migration for User table with indexes on email, hrmsx_user_id, role, is_active
- [X] T046 [US1] Create AuthService with register, login, refresh_token methods in backend/app/services/auth_service.py
- [X] T047 [US1] Implement POST /api/v1/auth/register endpoint in backend/app/api/v1/auth.py
- [X] T048 [US1] Implement POST /api/v1/auth/login endpoint (returns access + refresh tokens) in backend/app/api/v1/auth.py
- [X] T049 [US1] Implement POST /api/v1/auth/refresh endpoint in backend/app/api/v1/auth.py
- [X] T050 [US1] Implement POST /api/v1/auth/logout endpoint in backend/app/api/v1/auth.py
- [X] T051 [US1] Implement GET /api/v1/users/me endpoint in backend/app/api/v1/users.py
- [X] T052 [US1] Implement POST /api/v1/users/sync-hrmsx mock endpoint (Admin only) in backend/app/api/v1/users.py
- [X] T053 [US1] Create seed script with 5 default users (one per role) in backend/app/seed.py
- [X] T054 [US1] Integrate auth router into main app in backend/app/main.py
- [X] T055 [US1] Integrate users router into main app in backend/app/main.py

### Frontend: Authentication UI

- [X] T056 [P] [US1] Create User TypeScript types (User, UserRole, LoginRequest, RegisterRequest) in frontend/src/types/user.ts
- [X] T057 [P] [US1] Create LoginForm component with React Hook Form + Zod validation in frontend/src/components/auth/LoginForm.tsx
- [X] T058 [P] [US1] Create RegisterForm component with React Hook Form + Zod validation in frontend/src/components/auth/RegisterForm.tsx
- [X] T059 [US1] Create login page at frontend/src/app/login/page.tsx
- [X] T060 [US1] Create register page at frontend/src/app/register/page.tsx
- [X] T061 [US1] Create landing/dashboard page with role-based greeting at frontend/src/app/page.tsx
- [X] T062 [US1] Implement logout functionality in Navbar component
- [X] T063 [US1] Add role-based navigation visibility in Sidebar component (Admin sees all, Finance sees only financial, etc.)

**Checkpoint**: US1 complete - Users can register, login, logout. RBAC enforced on all endpoints. Role-based UI navigation works.

---

## Phase 4: User Story 2 - Complete Project-to-Task Workflow (Priority: P2)

**Goal**: Implement end-to-end project management: create projects, tasks/subtasks, log time, record expenses/income, view auto-calculated profit/loss.

**Independent Test**: Create a project, add tasks, log time entries, record expenses/income, view calculated profit/loss on dashboard. All data correctly linked and calculations accurate.

### Backend: Projects, Tasks, Time, Financial

- [X] T064 [P] [US2] Create Project SQLAlchemy model with 11 fields (id, name, client_name, manager_id, budget, dates, status, description, creator, timestamps) in backend/app/models/project.py
- [X] T065 [P] [US2] Create ProjectStatus enum in backend/app/models/project.py
- [X] T066 [P] [US2] Create Task SQLAlchemy model with 12 fields (id, title, description, project_id, assigned_user_id, parent_task_id, priority, status, deadline, progress, creator, timestamps) in backend/app/models/task.py
- [X] T067 [P] [US2] Create TaskPriority and TaskStatus enums in backend/app/models/task.py
- [X] T068 [P] [US2] Create TimeEntry SQLAlchemy model with 9 fields (id, task_id, user_id, start_time, end_time, duration_minutes, description, hrmsx_sync_status, timestamps) in backend/app/models/time_entry.py
- [X] T069 [P] [US2] Create SyncStatus enum in backend/app/models/time_entry.py
- [X] T070 [P] [US2] Create Expense SQLAlchemy model with 12 fields (id, amount, category, date, description, project_id, task_id, approval_status, submitter, approver, receipt_file_id, timestamps) in backend/app/models/financial.py
- [X] T071 [P] [US2] Create Income SQLAlchemy model with 8 fields (id, amount, date, description, project_id, payment_method, creator, timestamps) in backend/app/models/financial.py
- [X] T072 [P] [US2] Create ApprovalStatus enum in backend/app/models/financial.py
- [X] T073 [US2] Create Alembic migration for Project table with indexes and foreign keys
- [X] T074 [US2] Create Alembic migration for Task table with indexes, foreign keys, self-referential parent_task_id
- [X] T075 [US2] Create Alembic migration for TimeEntry table with indexes and foreign keys
- [X] T076 [US2] Create Alembic migration for Expense table with indexes, foreign keys, and CHECK constraint (approved_by_id != submitted_by_id)
- [X] T077 [US2] Create Alembic migration for Income table with indexes and foreign keys
- [X] T078 [P] [US2] Create Project Pydantic schemas (ProjectCreate, ProjectUpdate, ProjectResponse, ProjectList) in backend/app/schemas/project.py
- [X] T079 [P] [US2] Create Task Pydantic schemas (TaskCreate, TaskUpdate, TaskResponse, SubtaskCreate) in backend/app/schemas/task.py
- [X] T080 [P] [US2] Create TimeEntry Pydantic schemas (TimeEntryCreate, TimeEntryUpdate, TimeEntryResponse) in backend/app/schemas/time_entry.py
- [X] T081 [P] [US2] Create Financial Pydantic schemas (ExpenseCreate, IncomeCreate, ExpenseApproval, ProfitLoss) in backend/app/schemas/financial.py
- [X] T082 [US2] Create ProjectService with CRUD operations and role-based filtering in backend/app/services/project_service.py
- [X] T083 [US2] Create TaskService with CRUD operations, subtask creation, role-based filtering in backend/app/services/task_service.py
- [X] T084 [US2] Create FinancialService with profit/loss calculation logic in backend/app/services/financial_service.py
- [X] T085 [US2] Implement GET /api/v1/projects (role-filtered list with pagination) in backend/app/api/v1/projects.py
- [X] T086 [US2] Implement POST /api/v1/projects (Admin/PM only) in backend/app/api/v1/projects.py
- [X] T087 [US2] Implement GET /api/v1/projects/{id} (role-based access) in backend/app/api/v1/projects.py
- [X] T088 [US2] Implement PUT /api/v1/projects/{id} (PM can update own, Admin can update all) in backend/app/api/v1/projects.py
- [X] T089 [US2] Implement DELETE /api/v1/projects/{id} (Admin only) in backend/app/api/v1/projects.py
- [X] T090 [US2] Implement GET /api/v1/tasks (role-filtered list) in backend/app/api/v1/tasks.py
- [X] T091 [US2] Implement POST /api/v1/tasks (Admin/PM only) in backend/app/api/v1/tasks.py
- [X] T092 [US2] Implement GET /api/v1/tasks/{id} in backend/app/api/v1/tasks.py
- [X] T093 [US2] Implement PUT /api/v1/tasks/{id} (assigned user can update status, PM/Admin can reassign) in backend/app/api/v1/tasks.py
- [X] T094 [US2] Implement DELETE /api/v1/tasks/{id} in backend/app/api/v1/tasks.py
- [X] T095 [US2] Implement POST /api/v1/tasks/{id}/subtasks in backend/app/api/v1/tasks.py
- [X] T096 [US2] Implement GET /api/v1/time-entries (role-filtered) in backend/app/api/v1/time_entries.py
- [X] T097 [US2] Implement POST /api/v1/time-entries (Team Member/Admin) with auto-duration calculation in backend/app/api/v1/time_entries.py
- [X] T098 [US2] Implement PUT /api/v1/time-entries/{id} in backend/app/api/v1/time_entries.py
- [X] T099 [US2] Implement DELETE /api/v1/time-entries/{id} in backend/app/api/v1/time_entries.py
- [X] T100 [US2] Implement GET /api/v1/expenses (role-filtered) in backend/app/api/v1/expenses.py
- [X] T101 [US2] Implement POST /api/v1/expenses in backend/app/api/v1/expenses.py
- [X] T102 [US2] Implement GET /api/v1/expenses/{id} in backend/app/api/v1/expenses.py
- [X] T103 [US2] Implement PUT /api/v1/expenses/{id} in backend/app/api/v1/expenses.py
- [X] T104 [US2] Implement PATCH /api/v1/expenses/{id}/approve (Finance only, validates submitter != approver) in backend/app/api/v1/expenses.py
- [X] T105 [US2] Implement PATCH /api/v1/expenses/{id}/reject (Finance only) in backend/app/api/v1/expenses.py
- [X] T106 [US2] Implement GET /api/v1/income (role-filtered) in backend/app/api/v1/income.py
- [X] T107 [US2] Implement POST /api/v1/income (Admin/PM only) in backend/app/api/v1/income.py
- [X] T108 [US2] Implement GET /api/v1/income/{id} in backend/app/api/v1/income.py
- [X] T109 [US2] Implement PUT /api/v1/income/{id} in backend/app/api/v1/income.py
- [X] T110 [US2] Implement DELETE /api/v1/income/{id} in backend/app/api/v1/income.py
- [X] T111 [US2] Integrate projects, tasks, time_entries, expenses, income routers into main app in backend/app/main.py

### Frontend: Projects, Tasks, Time, Financial UI

- [X] T112 [P] [US2] Create Project TypeScript types (Project, ProjectStatus, ProjectCreate) in frontend/src/types/project.ts
- [X] T113 [P] [US2] Create Task TypeScript types (Task, TaskPriority, TaskStatus, TaskCreate, Subtask) in frontend/src/types/task.ts
- [X] T114 [P] [US2] Create Financial TypeScript types (Expense, Income, ApprovalStatus, ProfitLoss) in frontend/src/types/financial.ts
- [X] T115 [P] [US2] Create ProjectCard component with role-based action visibility in frontend/src/components/projects/ProjectCard.tsx
- [X] T116 [P] [US2] Create ProjectForm component with Zod validation in frontend/src/components/projects/ProjectForm.tsx
- [X] T117 [P] [US2] Create ProjectList component with pagination in frontend/src/components/projects/ProjectList.tsx
- [X] T118 [P] [US2] Create TaskCard component with priority/status badges in frontend/src/components/tasks/TaskCard.tsx
- [X] T119 [P] [US2] Create TaskForm component with subtask support in frontend/src/components/tasks/TaskForm.tsx
- [X] T120 [P] [US2] Create TaskList component with filtering in frontend/src/components/tasks/TaskList.tsx
- [X] T121 [US2] Create projects list page at frontend/src/app/projects/page.tsx (Server Component)
- [X] T122 [US2] Create new project page at frontend/src/app/projects/new/page.tsx
- [X] T123 [US2] Create project detail page at frontend/src/app/projects/[id]/page.tsx (shows tasks, expenses, income, profit/loss)
- [X] T124 [US2] Create my tasks page at frontend/src/app/tasks/page.tsx (Team Member view)
- [X] T125 [US2] Create expenses page at frontend/src/app/expenses/page.tsx (Finance approval view with filters)
- [X] T126 [US2] Add time tracking form to task detail (start time, end time, auto-duration) - Created TimeEntryForm component in frontend/src/components/timeTracking/TimeEntryForm.tsx
- [X] T127 [US2] Add expense form with category dropdown and receipt upload - Created ExpenseForm component in frontend/src/components/financial/ExpenseForm.tsx
- [X] T128 [US2] Add income form for Admin/PM roles - Created IncomeForm component in frontend/src/components/financial/IncomeForm.tsx
- [X] T129 [US2] Display profit/loss calculation on project detail page (Total Income - Approved Expenses - Labor Costs) - Created ProfitLossDisplay component in frontend/src/components/financial/ProfitLossDisplay.tsx

**Checkpoint**: US2 complete - Full project-to-task workflow functional. Time tracking, expenses, income work. Profit/loss auto-calculates correctly.

---

## Phase 5: User Story 3 - Real-Time Kanban Board (Priority: P3)

**Goal**: Implement visual Kanban board with drag-and-drop task status updates and real-time WebSocket synchronization across all connected users.

**Independent Test**: Open Kanban board in two browsers, drag task in one, see real-time update in other within 2 seconds. Works on mobile 360px with touch gestures.

### Backend: Kanban & WebSocket

- [X] T130 [US3] Create WebSocket ConnectionManager for Kanban in backend/app/websockets/kanban.py
- [X] T131 [US3] Implement WebSocket connection handler with JWT authentication in backend/app/websockets/kanban.py
- [X] T132 [US3] Implement WebSocket project room join/leave logic in backend/app/websockets/kanban.py
- [X] T133 [US3] Implement broadcast_task_update method in ConnectionManager in backend/app/websockets/kanban.py
- [X] T134 [US3] Implement GET /api/v1/kanban/projects/{project_id} (returns tasks grouped by status) in backend/app/api/v1/kanban.py
- [X] T135 [US3] Implement PATCH /api/v1/kanban/tasks/{task_id}/status (updates task status, broadcasts WebSocket event) in backend/app/api/v1/kanban.py
- [X] T136 [US3] Add WebSocket endpoint ws://backend/api/v1/kanban/ws in backend/app/main.py
- [X] T137 [US3] Integrate kanban router into main app in backend/app/main.py

### Frontend: Kanban UI & WebSocket Client

- [X] T138 [P] [US3] Create WebSocket client utilities with reconnection logic in frontend/src/lib/websocket.ts
- [X] T139 [P] [US3] Create useWebSocket hook with connection state management in frontend/src/hooks/useWebSocket.ts
- [X] T140 [P] [US3] Create useKanbanRealtime hook for task updates in frontend/src/hooks/useKanbanRealtime.ts
- [X] T141 [P] [US3] Create KanbanCard component with priority/status indicators in frontend/src/components/kanban/KanbanCard.tsx
- [X] T142 [P] [US3] Create KanbanColumn component with drop zone styling in frontend/src/components/kanban/KanbanColumn.tsx
- [X] T143 [US3] Create KanbanBoard component with @dnd-kit drag-and-drop (Client Component) in frontend/src/components/kanban/KanbanBoard.tsx
- [X] T144 [US3] Implement drag-and-drop status update with optimistic UI in KanbanBoard
- [X] T145 [US3] Integrate WebSocket listener for real-time task updates in KanbanBoard
- [X] T146 [US3] Add mobile touch gesture support for drag-and-drop (360px viewport)
- [X] T147 [US3] Create Kanban page at frontend/src/app/projects/[id]/kanban/page.tsx (Server Component wrapper)
- [X] T148 [US3] Add subtask progress indicators to Kanban cards
- [X] T149 [US3] Add task priority color coding to Kanban cards

**Checkpoint**: US3 complete - Kanban board displays tasks by status. Drag-and-drop updates status. Real-time sync works across browsers. Mobile-friendly.

---

## Phase 6: User Story 4 - Financial Dashboard & Reporting (Priority: P4)

**Goal**: Implement comprehensive dashboard with summary cards (projects count, active tasks, budget utilization, profit/loss), visual charts (project timeline, expense breakdown, task completion), role-based data filtering.

**Independent Test**: Navigate to dashboard and verify summary cards show accurate counts, charts render correctly with real data, profit/loss calculations match manual calculations. Finance role sees only financial data.

### Backend: Dashboard & Charts

- [X] T150 [US4] Implement GET /api/v1/dashboard/summary (returns role-filtered summary cards) in backend/app/api/v1/dashboard.py
- [X] T151 [US4] Implement GET /api/v1/dashboard/charts/project-timeline (returns project start/end dates for timeline chart) in backend/app/api/v1/dashboard.py
- [X] T152 [US4] Implement GET /api/v1/dashboard/charts/expense-breakdown (returns expenses grouped by category) in backend/app/api/v1/dashboard.py
- [X] T153 [US4] Implement GET /api/v1/dashboard/charts/task-completion (returns task counts by status) in backend/app/api/v1/dashboard.py
- [X] T154 [US4] Implement GET /api/v1/dashboard/projects/{id}/profit-loss (calculates Total Income - Approved Expenses - Labor Costs) in backend/app/api/v1/dashboard.py
- [X] T155 [US4] Integrate dashboard router into main app in backend/app/main.py

### Frontend: Dashboard UI & Charts

- [X] T156 [P] [US4] Create SummaryCard component with icon, label, value, change indicator in frontend/src/components/dashboard/SummaryCard.tsx
- [X] T157 [P] [US4] Create Charts component with Recharts library (timeline, pie/bar, completion) in frontend/src/components/dashboard/Charts.tsx
- [X] T158 [P] [US4] Create ProfitLossCard component with color-coded profit (green) or loss (red) in frontend/src/components/dashboard/ProfitLossCard.tsx
- [X] T159 [US4] Create dashboard page at frontend/src/app/dashboard/page.tsx with role-based data fetching
- [X] T160 [US4] Display 4 summary cards: Total Projects, Active Tasks, Budget Utilization, Overall Profit/Loss
- [X] T161 [US4] Display project timeline chart (Gantt-style or timeline)
- [X] T162 [US4] Display expense breakdown chart (pie chart by category)
- [X] T163 [US4] Display task completion chart (bar chart by status)
- [X] T164 [US4] Implement Finance role dashboard (only financial cards and charts, no task/project management)
- [X] T165 [US4] Make dashboard fully responsive for mobile 360px viewport

**Checkpoint**: US4 complete - Dashboard displays all summary cards and charts. Role-based filtering works. Charts are responsive. Profit/loss calculations accurate.

---

## Phase 7: User Story 5 - Notification System (Priority: P5)

**Goal**: Implement in-app notification system that alerts users for task assignments, approaching deadlines, and expense approval status changes. Email templates prepared (SMTP optional for MVP).

**Independent Test**: Assign a task and verify notification appears in recipient's notification center. Approve an expense and verify submitter receives notification. Deadline reminder triggers for tasks due within 24 hours.

### Backend: Notifications

- [X] T166 [P] [US5] Create Notification SQLAlchemy model with 8 fields (id, recipient_id, notification_type, related_entity_type, related_entity_id, message, is_read, created_at) in backend/app/models/notification.py
- [X] T167 [P] [US5] Create NotificationType enum in backend/app/models/notification.py
- [X] T168 [US5] Create Alembic migration for Notification table with indexes on recipient_id, is_read, created_at
- [X] T169 [P] [US5] Create Notification Pydantic schemas (NotificationResponse, NotificationList, UnreadCount) in backend/app/schemas/notification.py
- [X] T170 [US5] Create NotificationService with create_notification, mark_as_read, get_unread_count methods in backend/app/services/notification_service.py
- [X] T171 [US5] Integrate notification creation in TaskService.assign_task (TaskAssigned) in backend/app/services/task_service.py
- [X] T172 [US5] Integrate notification creation in FinancialService.approve_expense (ExpenseStatusChanged) in backend/app/services/financial_service.py
- [X] T173 [US5] Integrate notification creation in FinancialService.reject_expense (ExpenseStatusChanged) in backend/app/services/financial_service.py
- [ ] T174 [US5] Create deadline reminder background job (checks tasks with deadline < 24 hours, creates DeadlineApproaching notifications) - implementation placeholder
- [X] T175 [US5] Implement GET /api/v1/notifications (returns user's notifications, sorted by created_at desc) in backend/app/api/v1/notifications.py
- [X] T176 [US5] Implement GET /api/v1/notifications/unread-count in backend/app/api/v1/notifications.py
- [X] T177 [US5] Implement PATCH /api/v1/notifications/{id}/read in backend/app/api/v1/notifications.py
- [X] T178 [US5] Implement PATCH /api/v1/notifications/read-all in backend/app/api/v1/notifications.py
- [X] T179 [US5] Integrate notifications router into main app in backend/app/main.py

### Frontend: Notifications UI

- [X] T180 [P] [US5] Create Notification TypeScript types (Notification, NotificationType, UnreadCount) in frontend/src/types/common.ts
- [X] T181 [P] [US5] Create useNotifications hook with polling or WebSocket for real-time updates in frontend/src/hooks/useNotifications.ts
- [X] T182 [US5] Update NotificationBell component to fetch unread count and display badge in frontend/src/components/shared/NotificationBell.tsx
- [X] T183 [US5] Create NotificationDropdown component with list of recent notifications in frontend/src/components/shared/NotificationBell.tsx
- [X] T184 [US5] Implement notification click navigation to related entity (task, expense)
- [X] T185 [US5] Implement mark as read functionality (individual and all)
- [X] T186 [US5] Add notification polling or WebSocket listener in root layout
- [X] T187 [US5] Style unread notifications distinctly (bold text, background color)

### Email Templates (Optional SMTP Integration)

- [X] T188 [P] [US5] Create email template for TaskAssigned notification in backend/app/templates/emails/task_assigned.html
- [X] T189 [P] [US5] Create email template for DeadlineApproaching notification in backend/app/templates/emails/deadline_approaching.html
- [X] T190 [P] [US5] Create email template for ExpenseStatusChanged notification in backend/app/templates/emails/expense_status_changed.html
- [X] T191 [US5] Document SMTP configuration in backend/app/templates/emails/README.md (optional for MVP)

**Checkpoint**: US5 complete - Notifications trigger on task assignment, expense approval. In-app notification center works. Email templates ready (SMTP optional).

---

## Phase 8: Comments & File Attachments (Cross-Story Feature)

**Purpose**: Enable commenting and file uploads on projects, tasks, and expenses (used by multiple user stories)

### Backend: Comments & Files

- [ ] T192 [P] Create Comment SQLAlchemy model with polymorphic relationship (commentable_type, commentable_id) in backend/app/models/comment.py
- [ ] T193 [P] Create FileAttachment SQLAlchemy model with polymorphic relationship (attachable_type, attachable_id) in backend/app/models/file_attachment.py
- [ ] T194 [P] Create CommentableType and AttachableType enums in backend/app/models/comment.py and backend/app/models/file_attachment.py
- [ ] T195 Create Alembic migration for Comment table with composite index on (commentable_type, commentable_id)
- [ ] T196 Create Alembic migration for FileAttachment table with composite index on (attachable_type, attachable_id)
- [ ] T197 [P] Create Comment Pydantic schemas (CommentCreate, CommentResponse) in backend/app/schemas/comment.py
- [ ] T198 [P] Create FileAttachment Pydantic schemas (FileUploadResponse, FileList) in backend/app/schemas/file_attachment.py
- [ ] T199 Create file upload utilities (validate type, size, sanitize filename, save to uploads/) in backend/app/utils/file_utils.py
- [ ] T200 Implement GET /api/v1/comments/{type}/{id}/comments (returns comments for entity) in backend/app/api/v1/comments.py
- [ ] T201 Implement POST /api/v1/comments/{type}/{id}/comments (creates comment) in backend/app/api/v1/comments.py
- [ ] T202 Implement POST /api/v1/files/upload (validates, saves files, returns file IDs) in backend/app/api/v1/files.py
- [ ] T203 Implement GET /api/v1/files/{id} (downloads file with proper headers) in backend/app/api/v1/files.py
- [ ] T204 Integrate comments and files routers into main app in backend/app/main.py

### Frontend: Comments & Files UI

- [ ] T205 [P] Create FileUpload component with drag-and-drop, file preview, validation (10MB max) in frontend/src/components/shared/FileUpload.tsx
- [ ] T206 [P] Create CommentSection component with comment list and add comment form in frontend/src/components/shared/CommentSection.tsx
- [ ] T207 Integrate FileUpload into ProjectForm, TaskForm, ExpenseForm
- [ ] T208 Integrate CommentSection into project detail and task detail pages
- [ ] T209 Display uploaded files with download links
- [ ] T210 Add file type icons and size display

**Checkpoint**: Comments and file attachments work on projects, tasks, expenses. File upload validation enforced (type, size). Download works.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality gates

### Code Quality & Linting

- [ ] T211 [P] Run backend linting (flake8) and fix all errors/warnings
- [ ] T212 [P] Run backend type checking (mypy) and fix all type errors
- [ ] T213 [P] Run backend code formatting (black) on all files
- [ ] T214 [P] Run frontend linting (ESLint) and fix all errors/warnings
- [ ] T215 [P] Run frontend type checking (tsc --noEmit) and ensure zero errors
- [ ] T216 [P] Run frontend code formatting (Prettier) on all files
- [ ] T217 Verify zero console errors in browser during normal usage
- [ ] T218 Remove all debugging artifacts (console.log, print statements)

### Documentation & Deployment

- [ ] T219 [P] Create comprehensive README.md with setup instructions, architecture overview, tech stack
- [ ] T220 [P] Verify quickstart.md instructions work end-to-end (<30 minutes deployment)
- [ ] T221 [P] Generate Postman collection from FastAPI OpenAPI spec at /docs
- [ ] T222 [P] Export API documentation as postman_collection.json in project root
- [ ] T223 [P] Create ERD.drawio with all 9 entities and relationships using draw.io
- [ ] T224 [P] Export ERD.png from draw.io for documentation
- [ ] T225 Create docker-compose.prod.yml for production deployment
- [ ] T226 Document production deployment steps for Railway/Render in README.md
- [ ] T227 Add example .env files to documentation (backend/.env.example, frontend/.env.local.example)

### Performance & Responsiveness

- [ ] T228 [P] Run Lighthouse audit on frontend and ensure score ≥92 (Performance, Accessibility, Best Practices, SEO)
- [ ] T229 [P] Test all pages on mobile 360px viewport and fix any layout issues
- [ ] T230 [P] Optimize images with Next.js Image component
- [ ] T231 [P] Implement code splitting for large components
- [ ] T232 Verify API response times <200ms p95 for CRUD operations
- [ ] T233 Test system with 50 concurrent users (load testing with Locust or similar)

### Security Hardening

- [ ] T234 [P] Verify JWT tokens have correct expiry (15 min access, 7 day refresh)
- [ ] T235 [P] Verify passwords hashed with bcrypt (min 10 rounds)
- [ ] T236 [P] Verify RBAC enforced on all protected endpoints (try unauthorized access)
- [ ] T237 [P] Verify file upload validation (type, size, filename sanitization)
- [ ] T238 [P] Verify no secrets in codebase (check .env.example has placeholders only)
- [ ] T239 [P] Verify CORS configuration excludes wildcards
- [ ] T240 Verify self-approval prevention works for expenses

### Testing & Validation

- [ ] T241 Test all 55 functional requirements from spec.md
- [ ] T242 Test all 20 success criteria from spec.md
- [ ] T243 Verify all API endpoints documented in contracts/README.md return correct responses
- [ ] T244 Test real-time Kanban update on 2 browsers simultaneously
- [ ] T245 Test expense approval workflow end-to-end (submit → approve → notification)
- [ ] T246 Test profit/loss calculation accuracy against manual calculation
- [ ] T247 Test HRMSX mock sync endpoint (create/update users)
- [ ] T248 Verify seed data loads correctly (5 users, sample projects/tasks)

### Final Deliverables Checklist

- [ ] T249 Clean git commit history with meaningful conventional commit messages
- [ ] T250 Deploy backend and frontend to Railway/Render/Fly.io
- [ ] T251 Verify live deployment URL works end-to-end
- [X] T252 Verify Docker Compose up starts full system (MongoDB + Backend + Frontend)
- [ ] T253 Verify Swagger UI accessible at /docs with all endpoints
- [ ] T254 Verify all constitution gates still PASSED (Code Quality, Type Safety, DRY+KISS, Security, HRMSX Ready)

**Checkpoint**: All quality gates passed. System production-ready. Documentation complete. Live deployment functional.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Foundational - No dependencies on other stories
  - US2 (P2): Can start after Foundational - No dependencies on other stories (independent project workflow)
  - US3 (P3): Depends on US2 tasks being implemented (Kanban displays tasks from US2)
  - US4 (P4): Depends on US2 (dashboard shows projects, tasks, expenses, income from US2)
  - US5 (P5): Depends on US2 (notifications trigger on task assignments, expense approvals from US2)
- **Comments & Files (Phase 8)**: Can start after Foundational, used by US2 and US3
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - Independently testable
- **User Story 2 (P2)**: Foundation only - Independently testable (delivers full project workflow)
- **User Story 3 (P3)**: Foundation + US2 tasks - Independently testable (Kanban with tasks from US2)
- **User Story 4 (P4)**: Foundation + US2 data - Independently testable (dashboard displays US2 data)
- **User Story 5 (P5)**: Foundation + US2 events - Independently testable (notifications from US2 triggers)

### Within Each User Story

- Backend models before migrations
- Migrations before services
- Services before API endpoints
- API endpoints before frontend integration
- Frontend types before components
- Components before pages
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: All tasks marked [P] can run in parallel (T003-T006, T008-T014)
- **Foundational Phase Backend**: T018-T027 can run in parallel after T016-T017
- **Foundational Phase Frontend**: T032-T037, T040-T041 can run in parallel after T031
- **US1 Backend**: T042-T044 (models and schemas) can run in parallel
- **US2 Backend**: T064-T072 (all models and enums) can run in parallel; T078-T081 (all schemas) can run in parallel after models
- **US3**: T138-T142 (frontend WebSocket and Kanban components) can run in parallel
- **US4**: T156-T158 (dashboard components) can run in parallel
- **US5**: T166-T167 (notification model), T188-T190 (email templates) can run in parallel
- **Comments & Files**: T192-T194 (models), T197-T198 (schemas), T205-T206 (components) can run in parallel
- **Polish**: T211-T218 (linting/formatting), T219-T227 (documentation), T228-T233 (performance), T234-T240 (security) can all run in parallel

---

## Parallel Example: User Story 2 (Backend Models)

```bash
# Launch all backend models for User Story 2 together:
Task: "Create Project model in backend/app/models/project.py"
Task: "Create Task model in backend/app/models/task.py"
Task: "Create TimeEntry model in backend/app/models/time_entry.py"
Task: "Create Expense model in backend/app/models/financial.py"
Task: "Create Income model in backend/app/models/financial.py"

# Then after models complete, launch all schemas together:
Task: "Create Project schemas in backend/app/schemas/project.py"
Task: "Create Task schemas in backend/app/schemas/task.py"
Task: "Create TimeEntry schemas in backend/app/schemas/time_entry.py"
Task: "Create Financial schemas in backend/app/schemas/financial.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup → Project structure ready
2. Complete Phase 2: Foundational → Foundation ready (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 → Authentication & RBAC working
4. Complete Phase 4: User Story 2 → Full project-to-task workflow functional
5. Complete Phase 8: Comments & Files → Enable collaboration features
6. Complete Phase 9: Polish → Quality gates passed
7. **STOP and VALIDATE**: Test MVP independently, deploy

**MVP Delivers**: Secure role-based project management system with complete project-to-task workflow, time tracking, financial management, auto profit/loss calculation. Ready for 2-3 week pilot with Admin + PM + Team Member roles.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (Secure access MVP)
3. Add User Story 2 + Comments/Files → Test independently → Deploy (Full workflow MVP!)
4. Add User Story 3 → Test independently → Deploy (Add Kanban visual management)
5. Add User Story 4 → Test independently → Deploy (Add business intelligence dashboard)
6. Add User Story 5 → Test independently → Deploy (Add proactive notifications)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: User Story 1 (T042-T063) → Authentication & RBAC
- **Developer B**: User Story 2 Backend (T064-T111) → Project workflow backend
- **Developer C**: User Story 2 Frontend (T112-T129) → Project workflow UI (waits for B's API endpoints)
- **Developer D**: Comments & Files (T192-T210) → Collaboration features (can start anytime after Foundation)

Stories integrate independently. Each developer tests their story before merging.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests NOT included per specification - focus on quality through linting, type safety, constitution compliance
- Aggressive delivery: Work in logical phases until 100% complete, parallel work encouraged
- Quality gates after each phase: All APIs pass, RBAC enforced, real-time works, zero errors, mobile perfect, Lighthouse ≥92
