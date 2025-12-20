# Feature Specification: Project Management System MVP

**Feature Branch**: `001-project-management-mvp`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "2-Week Full-Stack Project Management System MVP (HRMSX Integration Ready)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Role-Based Access (Priority: P1)

As a system administrator, I need strict role-based access control so that each user (Admin, Project Manager, Team Member, Finance, Viewer) can only access and modify data appropriate to their role, ensuring data security and preventing unauthorized changes.

**Why this priority**: Security is foundational. Without proper RBAC, the entire system is compromised. This must work before any other features can be safely used.

**Independent Test**: Can be fully tested by logging in as different user roles and verifying that each role sees only permitted data and actions. Delivers secure access control that prevents data leakage.

**Acceptance Scenarios**:

1. **Given** a user logs in with Admin role, **When** they navigate the system, **Then** they can create/edit/delete all projects, tasks, users, and approve all expenses
2. **Given** a user logs in with Project Manager role, **When** they view projects, **Then** they can only manage projects where they are assigned as manager
3. **Given** a user logs in with Team Member role, **When** they view tasks, **Then** they can only see and update tasks assigned to them
4. **Given** a user logs in with Finance role, **When** they access the system, **Then** they can only view financial data (expenses, income, profit/loss) and approve/reject expenses
5. **Given** a user logs in with Viewer role, **When** they access the system, **Then** they can view all data but cannot create, edit, or delete anything
6. **Given** a Team Member tries to access another user's tasks, **When** they attempt to view or edit, **Then** the system denies access with appropriate error message
7. **Given** user credentials are synced from HRMSX, **When** a user logs in, **Then** their role and permissions match their HRMSX profile

---

### User Story 2 - Complete Project-to-Task Workflow (Priority: P2)

As a Project Manager, I need to create projects, break them down into tasks and subtasks, assign team members, track time spent, and monitor financial performance (expenses and income) so that I can manage project delivery effectively from start to finish.

**Why this priority**: This is the core value proposition of the system - end-to-end project management. Without this workflow, the system provides no business value.

**Independent Test**: Can be fully tested by creating a project, adding tasks/subtasks, assigning team members, logging time entries, recording expenses/income, and viewing calculated profit/loss. Delivers complete project lifecycle management.

**Acceptance Scenarios**:

1. **Given** a Project Manager is logged in, **When** they create a new project with client, budget, timeline, and description, **Then** the project is saved and appears in their project list
2. **Given** a project exists, **When** the PM creates a task with title, description, assignee, priority, status, and deadline, **Then** the task is linked to the project and the assignee is notified
3. **Given** a task exists, **When** the PM creates subtasks under it, **Then** the subtasks inherit the parent task's project and can be independently tracked
4. **Given** a Team Member is assigned to a task, **When** they log time entries (start time, end time, duration, description), **Then** the time is recorded against the task and contributes to project labor costs
5. **Given** project expenses are recorded (amount, category, date, description, receipt), **When** a Finance user approves the expense, **Then** it contributes to the project's total expense calculation
6. **Given** project income/milestones are recorded (amount, date, payment method), **When** entered, **Then** they contribute to the project's total income calculation
7. **Given** a project has expenses, income, and time entries, **When** viewed on dashboard, **Then** the system displays auto-calculated profit/loss (Income - Expenses - Labor Costs)

---

### User Story 3 - Real-Time Kanban Board (Priority: P3)

As a Team Member or Project Manager, I need a visual Kanban board where I can drag and drop tasks between status columns (To Do, In Progress, Review, Done) and see real-time updates from other team members, so that I can coordinate work and track progress efficiently.

**Why this priority**: Kanban provides intuitive visual project tracking. While important for user experience, the system can function without it (using list views).

**Independent Test**: Can be fully tested by opening the Kanban board on multiple devices, dragging a task to a new column, and verifying that all connected users see the update in real-time. Delivers collaborative visual task management.

**Acceptance Scenarios**:

1. **Given** a user opens the Kanban board for a project, **When** the board loads, **Then** all tasks are displayed in columns matching their current status (To Do, In Progress, Review, Done)
2. **Given** a user drags a task from "To Do" to "In Progress", **When** the task is dropped, **Then** the task status updates immediately without page refresh
3. **Given** multiple users have the same Kanban board open, **When** one user moves a task, **Then** all other users see the task move to the new column within 2 seconds
4. **Given** a user is viewing the Kanban board on a mobile device (360px width), **When** they drag a task, **Then** the drag-and-drop interaction works smoothly with touch gestures
5. **Given** a task has subtasks, **When** displayed on Kanban board, **Then** the task card shows subtask completion progress
6. **Given** tasks have different priorities, **When** displayed in a column, **Then** tasks are visually distinguished by priority (color coding or badges)

---

### User Story 4 - Financial Dashboard & Reporting (Priority: P4)

As a Finance user or Project Manager, I need a comprehensive dashboard showing project summaries (total projects, active tasks, budget utilization), visual charts (project timelines, expense breakdown, task completion), and real-time profit/loss calculations so that I can make informed business decisions.

**Why this priority**: Provides business intelligence and visibility. Important for management but system can operate without it initially.

**Independent Test**: Can be fully tested by navigating to the dashboard and verifying that all summary cards display accurate counts, charts render correctly, and profit/loss calculations match manual calculations. Delivers business intelligence and project health visibility.

**Acceptance Scenarios**:

1. **Given** a user with appropriate permissions accesses the dashboard, **When** the page loads, **Then** summary cards display: Total Projects (count), Active Tasks (count), Budget Utilization (percentage), Overall Profit/Loss (amount in PKR)
2. **Given** projects exist with timelines, **When** viewing the project timeline chart, **Then** a visual representation (Gantt-style or timeline) shows project durations, deadlines, and current progress
3. **Given** expenses are categorized, **When** viewing the expense breakdown chart, **Then** a pie or bar chart shows expense distribution by category
4. **Given** tasks have completion statuses, **When** viewing the task completion chart, **Then** a chart shows the ratio of To Do, In Progress, Review, and Done tasks
5. **Given** the dashboard is viewed on a mobile device, **When** the page loads, **Then** all charts and cards are responsive and remain readable at 360px width
6. **Given** financial data changes (new expense, income, or time entry), **When** the dashboard is refreshed, **Then** all calculations and charts update to reflect the new data
7. **Given** a Finance user accesses the dashboard, **When** they view it, **Then** they see only financial data and charts (no task/project management features)

---

### User Story 5 - Notification System (Priority: P5)

As a user, I need to receive notifications when relevant events occur (task assigned to me, deadline approaching, expense approval status changed) so that I can stay informed and take timely action without constantly checking the system.

**Why this priority**: Improves user engagement and timeliness of responses. The system remains fully functional without notifications.

**Independent Test**: Can be fully tested by triggering notification events (assigning a task, approving an expense) and verifying that in-app notifications appear and email templates are prepared. Delivers proactive user engagement.

**Acceptance Scenarios**:

1. **Given** a task is assigned to a Team Member, **When** the assignment is saved, **Then** an in-app notification appears in the user's notification center
2. **Given** a task deadline is within 24 hours, **When** the system performs a scheduled check, **Then** the assigned user receives a deadline reminder notification
3. **Given** a Finance user approves or rejects an expense, **When** the decision is saved, **Then** the expense submitter receives a notification with the approval status
4. **Given** a notification is created, **When** the user views their notification center, **Then** unread notifications are clearly marked and clicking navigates to the relevant item
5. **Given** email notification functionality is configured, **When** a notification event occurs, **Then** an email is queued (or sent if SMTP is configured) with the notification details
6. **Given** a user has multiple unread notifications, **When** they open the notification center, **Then** they can mark individual notifications as read or mark all as read

---

### Edge Cases

- What happens when a user is assigned to a task on a project they don't have access to? (System should auto-grant read access to that specific project or prevent the assignment)
- How does the system handle task reassignment when the original assignee has logged time entries? (Time entries remain linked to the task regardless of reassignment)
- What happens when a Project Manager is removed from a project that has active tasks? (System should reassign tasks or require explicit task handover)
- How does the system handle expense approval when the Finance user is also the expense submitter? (System should prevent self-approval or require a different approver)
- What happens when multiple users drag the same task simultaneously in the Kanban board? (Last update wins, with conflict notification to other users)
- How does the system calculate labor costs when team members have different hourly rates? (Assumption: use average rate or default rate defined in user profile)
- What happens when a project's end date is extended after tasks are marked as Done? (Tasks remain Done, but project timeline updates)
- How does the system handle file uploads when storage quota is exceeded? (System should prevent upload and notify user of storage limits)
- What happens when HRMSX sync fails or provides conflicting user data? (System should log sync errors and maintain local data until conflict is manually resolved)

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**:
- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST authenticate users via JWT tokens with secure token expiry (access token: 15 minutes, refresh token: 7 days)
- **FR-003**: System MUST support five distinct roles: Admin, Project Manager, Team Member, Finance, and Viewer
- **FR-004**: System MUST enforce role-based access control on all data access and modification operations
- **FR-005**: System MUST sync user profiles and roles with HRMSX system (mock endpoint acceptable for MVP)
- **FR-006**: System MUST allow users to log out, invalidating their session

**Project Management**:
- **FR-007**: System MUST allow authorized users to create projects with fields: name, client, assigned manager, budget, start date, end date, status, and description
- **FR-008**: System MUST allow Project Managers to update projects they manage
- **FR-009**: System MUST allow Admin users to update any project
- **FR-010**: System MUST support project statuses: Planning, In Progress, On Hold, Completed, Cancelled
- **FR-011**: System MUST allow authorized users to delete projects (with cascade handling for related tasks)
- **FR-012**: System MUST display project lists filtered by user role and permissions

**Task & Subtask Management**:
- **FR-013**: System MUST allow authorized users to create tasks linked to projects with fields: title, description, assigned user, priority, status, deadline, and progress percentage
- **FR-014**: System MUST support task priorities: Low, Medium, High, Urgent, Critical
- **FR-015**: System MUST support task statuses: To Do, In Progress, Review, Done
- **FR-016**: System MUST allow tasks to have subtasks (one level of nesting)
- **FR-017**: System MUST allow assigned users to update their own task status and progress
- **FR-018**: System MUST allow Project Managers and Admins to reassign tasks
- **FR-019**: System MUST display tasks filtered by user role (Team Members see only assigned tasks)

**Kanban Board**:
- **FR-020**: System MUST display tasks in a visual board with columns for each status (To Do, In Progress, Review, Done)
- **FR-021**: System MUST allow users to drag and drop tasks between status columns to update task status
- **FR-022**: System MUST update task status in real-time when changed by any user
- **FR-023**: System MUST support Kanban board functionality on mobile devices (minimum 360px width) with touch gestures

**Comments & File Attachments**:
- **FR-024**: System MUST allow authorized users to add comments to projects and tasks
- **FR-025**: System MUST allow users to upload multiple files (receipts, documents) to projects and tasks
- **FR-026**: System MUST validate file uploads (type, size limit of 10MB, filename sanitization)
- **FR-027**: System MUST store uploaded files securely (local storage or cloud storage service)
- **FR-028**: System MUST allow users to download uploaded files

**Time Tracking**:
- **FR-029**: System MUST allow Team Members to log time entries against tasks with fields: start time, end time, duration, and description
- **FR-030**: System MUST calculate duration automatically if start and end times are provided
- **FR-031**: System MUST link time entries to specific tasks for labor cost calculation
- **FR-032**: System MUST store time entries with HRMSX sync fields (created_at, updated_at, sync_status) for future timesheet synchronization

**Expense Management**:
- **FR-033**: System MUST allow authorized users to record expenses with fields: amount (PKR with 2 decimal places), category, date, description, linked project, linked task (optional), and receipt upload
- **FR-034**: System MUST support expense approval workflow with statuses: Pending, Approved, Rejected
- **FR-035**: System MUST allow Finance role users to approve or reject expenses
- **FR-036**: System MUST prevent users from approving their own expense submissions
- **FR-037**: System MUST update expense status and notify the submitter when approval decision is made

**Income & Milestone Payments**:
- **FR-038**: System MUST allow authorized users to record project income/milestone payments with fields: amount (PKR with 2 decimal places), date, description, linked project, and payment method
- **FR-039**: System MUST include all income entries in project profit/loss calculations

**Profit/Loss Calculation**:
- **FR-040**: System MUST automatically calculate project profit/loss using formula: Total Income - (Total Approved Expenses + Estimated Labor Costs)
- **FR-041**: System MUST estimate labor costs based on time entries logged against project tasks
- **FR-042**: System MUST recalculate profit/loss whenever income, expenses, or time entries are added/updated
- **FR-043**: System MUST display profit/loss in PKR with 2 decimal places

**Dashboard & Reporting**:
- **FR-044**: System MUST display a dashboard with summary cards: Total Projects, Active Tasks, Budget Utilization, and Overall Profit/Loss
- **FR-045**: System MUST display visual charts: Project Timeline, Expense Breakdown by Category, and Task Completion Status
- **FR-046**: System MUST filter dashboard data based on user role (Finance sees only financial data, Project Managers see their projects, etc.)
- **FR-047**: System MUST ensure dashboard is responsive and functional on mobile devices (minimum 360px width)

**Notifications**:
- **FR-048**: System MUST send in-app notifications for events: task assignment, deadline approaching (within 24 hours), and expense approval status change
- **FR-049**: System MUST display unread notification count in user interface
- **FR-050**: System MUST allow users to mark notifications as read
- **FR-051**: System MUST prepare email notification templates for all notification events (SMTP integration optional for MVP)

**Data Standards**:
- **FR-052**: System MUST store all monetary values in PKR with exactly 2 decimal places
- **FR-053**: System MUST store all timestamps in UTC and display them in Asia/Karachi timezone
- **FR-054**: System MUST auto-manage created_at and updated_at timestamps for all entities
- **FR-055**: System MUST validate all user inputs on both client and server side

### Key Entities

- **User**: Represents system users with attributes: email, password (hashed), role (Admin/PM/Team Member/Finance/Viewer), name, HRMSX user ID (for sync), active status, created/updated timestamps
- **Project**: Represents projects with attributes: name, client name, assigned manager (User), budget (PKR), start date, end date, status, description, created/updated timestamps, creator
- **Task**: Represents tasks with attributes: title, description, assigned user, project (parent), priority, status, deadline, progress percentage, created/updated timestamps, creator. Relationships: belongs to one project, assigned to one user, can have multiple subtasks, multiple time entries, multiple comments, multiple file attachments
- **Subtask**: Same structure as Task but with parent task reference instead of subtask capability (one level nesting only)
- **TimeEntry**: Represents time tracking with attributes: task reference, user, start time, end time, duration (minutes), description, HRMSX sync status, created/updated timestamps
- **Expense**: Represents project expenses with attributes: amount (PKR), category, date, description, project reference, task reference (optional), approval status, submitter (User), approver (User), receipt file reference, created/updated timestamps
- **Income**: Represents project income with attributes: amount (PKR), date, description, project reference, payment method, created/updated timestamps, creator
- **Comment**: Represents comments with attributes: content (text), commentable type (Project/Task), commentable ID, author (User), created/updated timestamps
- **FileAttachment**: Represents uploaded files with attributes: file name, file path/URL, file size, file type, attachable type (Project/Task/Expense), attachable ID, uploader (User), created/updated timestamps
- **Notification**: Represents notifications with attributes: recipient (User), notification type, related entity type, related entity ID, message text, read status, created timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Security & Access Control**:
- **SC-001**: All users can successfully log in with their credentials and access only data permitted by their role with zero unauthorized data access incidents during testing
- **SC-002**: Role-based access control prevents 100% of unauthorized access attempts (tested with automated permission tests)

**Project Management Workflow**:
- **SC-003**: Project Managers can create a complete project (with tasks, time entries, expenses, and income) and view calculated profit/loss within 10 minutes
- **SC-004**: Team Members can locate their assigned tasks, update status, and log time within 3 clicks from login

**Real-Time Collaboration**:
- **SC-005**: Kanban board updates reflect across all connected users within 2 seconds of a task status change
- **SC-006**: Drag-and-drop interactions on Kanban board complete successfully on mobile devices (360px width) with touch gestures

**Financial Tracking**:
- **SC-007**: Profit/loss calculations are accurate (verified against manual calculations) with 100% accuracy across all test projects
- **SC-008**: Expense approval workflow completes end-to-end (submission → review → approval/rejection → notification) within 5 user actions

**User Experience & Performance**:
- **SC-009**: All pages load and become interactive within 3 seconds on standard broadband connection
- **SC-010**: System achieves Lighthouse score of 92 or higher across Performance, Accessibility, Best Practices, and SEO categories
- **SC-011**: All user interfaces are fully functional and usable on mobile devices with minimum screen width of 360px

**System Quality**:
- **SC-012**: Zero console errors appear in browser developer tools during normal system usage
- **SC-013**: All API endpoints documented in Postman collection return successful responses (2xx status codes) for valid requests
- **SC-014**: System handles 50 concurrent users without performance degradation or errors

**Integration Readiness**:
- **SC-015**: HRMSX user sync endpoint successfully accepts user data and updates local user records
- **SC-016**: All timesheet entries include required sync fields (HRMSX user ID, sync status, timestamps) for future batch synchronization

**Deployment & Documentation**:
- **SC-017**: System can be deployed from scratch using provided documentation in under 30 minutes by a developer unfamiliar with the codebase
- **SC-018**: All API endpoints are documented in Swagger UI with request/response examples and can be tested directly from the documentation

**Code Quality**:
- **SC-019**: Codebase passes all linting checks with zero warnings or errors
- **SC-020**: Git commit history contains meaningful commit messages following conventional commit format (type(scope): description)

## Assumptions

1. **Labor Cost Calculation**: Since hourly rates for team members are not specified, the system will use a default hourly rate (configurable in admin settings) for all labor cost calculations. This can be enhanced later with per-user hourly rates.

2. **File Storage**: For MVP, files will be stored locally on the server filesystem. Cloud storage (Cloudinary, S3) can be integrated in future iterations.

3. **Real-Time Updates**: WebSocket implementation (Socket.IO or similar) will be used for real-time Kanban board updates. Alternative: simple polling mechanism if WebSocket proves too complex for 2-week timeline.

4. **Email Notifications**: Email templates will be created and notification triggering logic implemented, but actual email sending (SMTP configuration) is optional for MVP. In-app notifications are mandatory.

5. **HRMSX Sync**: A mock API endpoint will simulate HRMSX user synchronization. Actual HRMSX API integration will be implemented post-MVP with proper authentication and error handling.

6. **Single Organization**: System supports only one organization (no multi-tenancy). All users belong to the same organization.

7. **Currency**: All financial calculations are in Pakistani Rupees (PKR) only. Multi-currency support is out of scope.

8. **Task Dependencies**: While task-to-task dependencies would be valuable, they are not included in MVP to meet the 2-week timeline. Tasks can be sequenced manually using priority and status.

9. **Project Templates**: Creating projects from templates is not included in MVP. All projects are created from scratch.

10. **Audit Logging**: While security is critical, detailed audit trails (who accessed what when) are not included in MVP. Basic created_by and updated_at timestamps provide minimal audit capability.

## Out of Scope

The following features are explicitly excluded from this MVP:

- Payment gateway integration (Stripe, PayPal, etc.)
- Advanced Gantt chart visualization with dependency lines
- Resource allocation and capacity planning
- Calendar view for tasks and deadlines
- Multi-tenancy support (multiple organizations)
- Complex reporting with PDF/Excel export
- Chat or messaging system between team members
- AI-powered features (task suggestions, risk prediction, etc.)
- Advanced analytics and business intelligence dashboards
- Custom workflow automation (if-then rules, triggers)
- Third-party integrations beyond HRMSX (Slack, Jira, GitHub, etc.)
- Mobile native applications (iOS/Android apps)
- Offline mode support
- Advanced search with filters and saved searches
- Time tracking with timer (start/stop functionality) - MVP supports manual entry only
- Recurring tasks or projects
- Project budgeting with cost breakdown structure
- Invoice generation from project income
- Team performance metrics and reports

## Dependencies

**External Systems**:
- **HRMSX**: User authentication and profile data will eventually sync from HRMSX. Mock endpoint required for MVP.

**Third-Party Services** (Optional for MVP):
- **Email Service**: SMTP server for sending email notifications (optional, can use templates only)
- **Cloud Storage**: Cloudinary or AWS S3 for file storage (optional, can use local storage)
- **Real-Time Service**: Socket.IO or Pusher for WebSocket connections (required for Kanban real-time updates)

**Infrastructure**:
- **Database**: MongoDB database server
- **Container Platform**: Docker for containerization
- **Deployment Platform**: Railway, Render, or similar for hosting test deployment

## Risks & Mitigation

**Risk 1: Real-time Kanban board complexity**
- **Impact**: High (P3 feature, but critical for user experience)
- **Mitigation**: Start with simple polling mechanism as fallback if WebSocket implementation takes too long. Can upgrade to proper WebSocket post-MVP.

**Risk 2: HRMSX integration unknowns**
- **Impact**: Medium (integration readiness is important but not blocking)
- **Mitigation**: Implement mock HRMSX API with expected data contract. Document integration points clearly for future implementation.

**Risk 3: File upload storage limits**
- **Impact**: Medium (could affect demo if many files uploaded)
- **Mitigation**: Implement file size limits (10MB per file) and total storage monitoring. Use cloud storage if local storage proves insufficient.

**Risk 4: Performance with large datasets**
- **Impact**: Medium (demo should handle realistic data volume)
- **Mitigation**: Implement pagination on all list views. Add database indexes on frequently queried fields. Test with seeded data (100+ projects, 1000+ tasks).

**Risk 5: Mobile responsiveness complexity**
- **Impact**: High (SC-011 requires 360px mobile support)
- **Mitigation**: Use mobile-first design approach with Tailwind CSS responsive utilities. Test continuously on mobile viewport during development.

**Risk 6: Lighthouse score requirements**
- **Impact**: Medium (SC-010 requires ≥92 score)
- **Mitigation**: Use Next.js 15 performance best practices (Server Components, Image optimization, code splitting). Run Lighthouse tests weekly and address issues incrementally.
