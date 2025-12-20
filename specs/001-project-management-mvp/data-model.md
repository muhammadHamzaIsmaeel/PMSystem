# Data Model: Project Management System MVP

**Feature**: 001-project-management-mvp
**Created**: 2025-12-10
**Database**: MongoDB Atlas
**ORM**: SQLAlchemy 2.0 (async)

## Overview

This document defines the database schema for the Project Management System MVP. All entities support role-based access control (RBAC), HRMSX integration readiness, and real-time collaboration features.

**Key Design Principles**:
- UTC timestamps in database, Asia/Karachi timezone on frontend
- Decimal type for all monetary values (2 decimal places precision)
- Polymorphic relationships for comments and file attachments
- Soft deletes not implemented (hard deletes with cascade handling)
- Indexes on all foreign keys and frequently queried fields

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Project : "manages"
    User ||--o{ Project : "creates"
    User ||--o{ Task : "assigned_to"
    User ||--o{ Task : "creates"
    User ||--o{ TimeEntry : "logs"
    User ||--o{ Expense : "submits"
    User ||--o{ Expense : "approves"
    User ||--o{ Income : "creates"
    User ||--o{ Comment : "authors"
    User ||--o{ FileAttachment : "uploads"
    User ||--o{ Notification : "receives"

    Project ||--o{ Task : "contains"
    Project ||--o{ Expense : "has"
    Project ||--o{ Income : "has"
    Project ||--o{ Comment : "has"
    Project ||--o{ FileAttachment : "has"

    Task ||--o{ Task : "parent_of"
    Task ||--o{ TimeEntry : "has"
    Task ||--o{ Comment : "has"
    Task ||--o{ FileAttachment : "has"

    Expense ||--o| FileAttachment : "receipt"

    User {
        uuid id PK
        string email UK
        string password_hash
        string name
        enum role
        string hrmsx_user_id UK_NULLABLE
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    Project {
        uuid id PK
        string name
        string client_name
        uuid manager_id FK
        decimal budget
        date start_date
        date end_date
        enum status
        text description
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Task {
        uuid id PK
        string title
        text description
        uuid project_id FK
        uuid assigned_user_id FK
        uuid parent_task_id FK_NULLABLE
        enum priority
        enum status
        timestamp deadline
        integer progress_percentage
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    TimeEntry {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        timestamp start_time
        timestamp end_time
        integer duration_minutes
        text description
        enum hrmsx_sync_status
        timestamp created_at
        timestamp updated_at
    }

    Expense {
        uuid id PK
        decimal amount
        string category
        date date
        text description
        uuid project_id FK
        uuid task_id FK_NULLABLE
        enum approval_status
        uuid submitted_by_id FK
        uuid approved_by_id FK_NULLABLE
        uuid receipt_file_id FK_NULLABLE
        timestamp created_at
        timestamp updated_at
    }

    Income {
        uuid id PK
        decimal amount
        date date
        text description
        uuid project_id FK
        string payment_method
        uuid created_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Comment {
        uuid id PK
        text content
        enum commentable_type
        uuid commentable_id
        uuid author_id FK
        timestamp created_at
        timestamp updated_at
    }

    FileAttachment {
        uuid id PK
        string file_name
        string file_path
        integer file_size
        string file_type
        enum attachable_type
        uuid attachable_id
        uuid uploaded_by_id FK
        timestamp created_at
        timestamp updated_at
    }

    Notification {
        uuid id PK
        uuid recipient_id FK
        enum notification_type
        string related_entity_type
        uuid related_entity_id
        text message
        boolean is_read
        timestamp created_at
    }
```

## Entities

### 1. User

**Purpose**: Represents system users with authentication, role-based permissions, and HRMSX sync capability.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `email` (VARCHAR(255), UNIQUE, NOT NULL): User email (login credential)
- `password_hash` (VARCHAR(255), NOT NULL): Bcrypt hashed password (min 10 rounds)
- `name` (VARCHAR(255), NOT NULL): Full name
- `role` (ENUM, NOT NULL): User role for RBAC
- `hrmsx_user_id` (VARCHAR(100), UNIQUE, NULLABLE): HRMSX external user ID for sync
- `is_active` (BOOLEAN, DEFAULT TRUE): Account active status
- `created_at` (TIMESTAMP, DEFAULT NOW()): Record creation timestamp
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW()): Last update timestamp

**Enums**:
- `UserRole`: Admin, ProjectManager, TeamMember, Finance, Viewer

**Indexes**:
- Primary: `id`
- Unique: `email`
- Unique: `hrmsx_user_id` (sparse index, nulls allowed)
- Index: `role`, `is_active`

**Relationships**:
- `managed_projects`: One-to-many with Project (via `manager_id`)
- `created_projects`: One-to-many with Project (via `created_by_id`)
- `assigned_tasks`: One-to-many with Task (via `assigned_user_id`)
- `created_tasks`: One-to-many with Task (via `created_by_id`)
- `time_entries`: One-to-many with TimeEntry
- `submitted_expenses`: One-to-many with Expense (via `submitted_by_id`)
- `approved_expenses`: One-to-many with Expense (via `approved_by_id`)
- `created_income`: One-to-many with Income
- `comments`: One-to-many with Comment
- `uploaded_files`: One-to-many with FileAttachment
- `notifications`: One-to-many with Notification

**Validation Rules**:
- Email must be valid format and unique
- Password must be hashed before storage (never store plaintext)
- Role must be one of the five defined roles
- `hrmsx_user_id` can be null initially, populated during sync

**HRMSX Sync Notes**:
- `hrmsx_user_id` links local user to HRMSX user
- Role mappings: Admin ↔ HRMSX Admin, ProjectManager ↔ HRMSX Manager, etc.
- Sync updates: name, role (email immutable after creation)

---

### 2. Project

**Purpose**: Represents projects with budget, timeline, status, and manager assignment.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `name` (VARCHAR(255), NOT NULL): Project name
- `client_name` (VARCHAR(255), NOT NULL): Client/customer name
- `manager_id` (UUID, FK → User, NOT NULL): Assigned project manager
- `budget` (DECIMAL(12,2), NOT NULL): Project budget in PKR (2 decimal precision)
- `start_date` (DATE, NOT NULL): Project start date
- `end_date` (DATE, NOT NULL): Project end date
- `status` (ENUM, NOT NULL, DEFAULT 'Planning'): Current project status
- `description` (TEXT, NULLABLE): Project description
- `created_by_id` (UUID, FK → User, NOT NULL): User who created the project
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Enums**:
- `ProjectStatus`: Planning, InProgress, OnHold, Completed, Cancelled

**Indexes**:
- Primary: `id`
- Foreign Key: `manager_id` → User.id (ON DELETE RESTRICT)
- Foreign Key: `created_by_id` → User.id (ON DELETE RESTRICT)
- Index: `status`, `start_date`, `end_date`

**Relationships**:
- `manager`: Many-to-one with User (via `manager_id`)
- `creator`: Many-to-one with User (via `created_by_id`)
- `tasks`: One-to-many with Task
- `expenses`: One-to-many with Expense
- `income`: One-to-many with Income
- `comments`: One-to-many with Comment (polymorphic)
- `files`: One-to-many with FileAttachment (polymorphic)

**Validation Rules**:
- `end_date` must be >= `start_date`
- Budget must be >= 0
- Manager must have ProjectManager or Admin role
- Status transitions: Planning → InProgress → (OnHold/Completed/Cancelled)

**Business Logic**:
- Deleting a project cascades to all related tasks, expenses, income, comments, files
- Profit/Loss calculation: SUM(income.amount) - SUM(approved_expenses.amount) - SUM(labor_costs from time_entries)

---

### 3. Task

**Purpose**: Represents tasks and subtasks with assignment, priority, status, and progress tracking.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `title` (VARCHAR(255), NOT NULL): Task title
- `description` (TEXT, NULLABLE): Detailed task description
- `project_id` (UUID, FK → Project, NOT NULL): Parent project
- `assigned_user_id` (UUID, FK → User, NOT NULL): Assigned team member
- `parent_task_id` (UUID, FK → Task, NULLABLE): Parent task (for subtasks)
- `priority` (ENUM, NOT NULL, DEFAULT 'Medium'): Task priority
- `status` (ENUM, NOT NULL, DEFAULT 'ToDo'): Current task status
- `deadline` (TIMESTAMP, NULLABLE): Task deadline
- `progress_percentage` (INTEGER, DEFAULT 0): Progress (0-100)
- `created_by_id` (UUID, FK → User, NOT NULL): User who created the task
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Enums**:
- `TaskPriority`: Low, Medium, High, Urgent, Critical
- `TaskStatus`: ToDo, InProgress, Review, Done

**Indexes**:
- Primary: `id`
- Foreign Key: `project_id` → Project.id (ON DELETE CASCADE)
- Foreign Key: `assigned_user_id` → User.id (ON DELETE RESTRICT)
- Foreign Key: `parent_task_id` → Task.id (ON DELETE CASCADE, self-referential)
- Foreign Key: `created_by_id` → User.id (ON DELETE RESTRICT)
- Index: `status`, `deadline`, `priority`
- Composite Index: (`project_id`, `status`) for Kanban queries

**Relationships**:
- `project`: Many-to-one with Project
- `assigned_user`: Many-to-one with User
- `parent_task`: Many-to-one with Task (self-referential, nullable)
- `subtasks`: One-to-many with Task (self-referential)
- `time_entries`: One-to-many with TimeEntry
- `comments`: One-to-many with Comment (polymorphic)
- `files`: One-to-many with FileAttachment (polymorphic)

**Validation Rules**:
- `progress_percentage` must be 0-100
- Subtask nesting limited to one level (parent_task_id can only reference tasks with null parent_task_id)
- Assigned user must exist and be active
- Status transitions: ToDo → InProgress → Review → Done (can go back to previous states)

**Business Logic**:
- Kanban board displays tasks grouped by status
- Real-time WebSocket updates when status changes
- Deleting a parent task cascades to all subtasks

---

### 4. TimeEntry

**Purpose**: Tracks time spent on tasks with HRMSX sync readiness.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `task_id` (UUID, FK → Task, NOT NULL): Associated task
- `user_id` (UUID, FK → User, NOT NULL): User who logged the time
- `start_time` (TIMESTAMP, NOT NULL): Time entry start
- `end_time` (TIMESTAMP, NOT NULL): Time entry end
- `duration_minutes` (INTEGER, NOT NULL): Calculated duration in minutes
- `description` (TEXT, NULLABLE): Time entry description
- `hrmsx_sync_status` (ENUM, NOT NULL, DEFAULT 'Pending'): HRMSX sync status
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Enums**:
- `SyncStatus`: Pending, Synced, Failed

**Indexes**:
- Primary: `id`
- Foreign Key: `task_id` → Task.id (ON DELETE CASCADE)
- Foreign Key: `user_id` → User.id (ON DELETE RESTRICT)
- Index: `hrmsx_sync_status`, `start_time`
- Composite Index: (`user_id`, `start_time`) for user time reports

**Relationships**:
- `task`: Many-to-one with Task
- `user`: Many-to-one with User

**Validation Rules**:
- `end_time` must be >= `start_time`
- `duration_minutes` auto-calculated: (end_time - start_time) in minutes
- User must be assigned to the task or have Admin role

**Business Logic**:
- Labor cost calculation: duration_minutes * (hourly_rate / 60)
- HRMSX batch sync: Select all entries where sync_status = 'Pending', sync, update status

---

### 5. Expense

**Purpose**: Tracks project expenses with approval workflow and receipt attachments.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `amount` (DECIMAL(12,2), NOT NULL): Expense amount in PKR
- `category` (VARCHAR(100), NOT NULL): Expense category (e.g., "Travel", "Equipment")
- `date` (DATE, NOT NULL): Expense date
- `description` (TEXT, NOT NULL): Expense description
- `project_id` (UUID, FK → Project, NOT NULL): Associated project
- `task_id` (UUID, FK → Task, NULLABLE): Optional associated task
- `approval_status` (ENUM, NOT NULL, DEFAULT 'Pending'): Approval workflow status
- `submitted_by_id` (UUID, FK → User, NOT NULL): User who submitted expense
- `approved_by_id` (UUID, FK → User, NULLABLE): User who approved/rejected
- `receipt_file_id` (UUID, FK → FileAttachment, NULLABLE): Receipt file reference
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Enums**:
- `ApprovalStatus`: Pending, Approved, Rejected

**Indexes**:
- Primary: `id`
- Foreign Key: `project_id` → Project.id (ON DELETE CASCADE)
- Foreign Key: `task_id` → Task.id (ON DELETE SET NULL)
- Foreign Key: `submitted_by_id` → User.id (ON DELETE RESTRICT)
- Foreign Key: `approved_by_id` → User.id (ON DELETE RESTRICT)
- Foreign Key: `receipt_file_id` → FileAttachment.id (ON DELETE SET NULL)
- Index: `approval_status`, `date`
- Composite Index: (`project_id`, `approval_status`) for dashboard queries

**Relationships**:
- `project`: Many-to-one with Project
- `task`: Many-to-one with Task (nullable)
- `submitter`: Many-to-one with User (via `submitted_by_id`)
- `approver`: Many-to-one with User (via `approved_by_id`, nullable)
- `receipt`: Many-to-one with FileAttachment (nullable)

**Validation Rules**:
- Amount must be > 0
- `approved_by_id` cannot equal `submitted_by_id` (self-approval prevention)
- Only users with Finance role can approve/reject
- Approval status can only change Pending → Approved or Pending → Rejected (no reversals)

**Business Logic**:
- Profit/Loss calculation includes only Approved expenses
- Notification sent to submitter when status changes to Approved/Rejected

---

### 6. Income

**Purpose**: Tracks project income and milestone payments.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `amount` (DECIMAL(12,2), NOT NULL): Income amount in PKR
- `date` (DATE, NOT NULL): Payment received date
- `description` (TEXT, NOT NULL): Income description (e.g., "Milestone 1 payment")
- `project_id` (UUID, FK → Project, NOT NULL): Associated project
- `payment_method` (VARCHAR(100), NULLABLE): Payment method (e.g., "Bank Transfer", "Cash")
- `created_by_id` (UUID, FK → User, NOT NULL): User who recorded income
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Indexes**:
- Primary: `id`
- Foreign Key: `project_id` → Project.id (ON DELETE CASCADE)
- Foreign Key: `created_by_id` → User.id (ON DELETE RESTRICT)
- Index: `date`
- Composite Index: (`project_id`, `date`) for profit/loss queries

**Relationships**:
- `project`: Many-to-one with Project
- `creator`: Many-to-one with User

**Validation Rules**:
- Amount must be > 0
- Only Admin and ProjectManager roles can create income

**Business Logic**:
- Profit/Loss calculation: Total Income - Total Approved Expenses - Labor Costs

---

### 7. Comment

**Purpose**: User comments on projects and tasks (polymorphic relationship).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `content` (TEXT, NOT NULL): Comment text
- `commentable_type` (ENUM, NOT NULL): Type of entity being commented on
- `commentable_id` (UUID, NOT NULL): ID of the entity being commented on
- `author_id` (UUID, FK → User, NOT NULL): Comment author
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Enums**:
- `CommentableType`: Project, Task

**Indexes**:
- Primary: `id`
- Foreign Key: `author_id` → User.id (ON DELETE CASCADE)
- Composite Index: (`commentable_type`, `commentable_id`) for polymorphic queries
- Index: `created_at` for chronological sorting

**Relationships**:
- `author`: Many-to-one with User
- `commentable`: Polymorphic (Project or Task)

**Validation Rules**:
- Content must not be empty
- Commentable entity must exist

**Polymorphic Implementation**:
```python
# Example: Retrieve comments for a project
SELECT * FROM comments
WHERE commentable_type = 'Project' AND commentable_id = '<project_uuid>';
```

---

### 8. FileAttachment

**Purpose**: File uploads for projects, tasks, and expense receipts (polymorphic relationship).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `file_name` (VARCHAR(255), NOT NULL): Original filename
- `file_path` (VARCHAR(500), NOT NULL): Storage path (relative or absolute)
- `file_size` (INTEGER, NOT NULL): File size in bytes
- `file_type` (VARCHAR(100), NOT NULL): MIME type
- `attachable_type` (ENUM, NOT NULL): Type of entity this file is attached to
- `attachable_id` (UUID, NOT NULL): ID of the entity
- `uploaded_by_id` (UUID, FK → User, NOT NULL): User who uploaded the file
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW(), ON UPDATE NOW())

**Enums**:
- `AttachableType`: Project, Task, Expense

**Indexes**:
- Primary: `id`
- Foreign Key: `uploaded_by_id` → User.id (ON DELETE CASCADE)
- Composite Index: (`attachable_type`, `attachable_id`) for polymorphic queries
- Index: `file_type` for filtering by type

**Relationships**:
- `uploader`: Many-to-one with User
- `attachable`: Polymorphic (Project, Task, or Expense)

**Validation Rules**:
- File size must be <= 10MB (10,485,760 bytes)
- Allowed file types: images (jpg, png, gif), documents (pdf, docx), archives (zip)
- Filename must be sanitized (no path traversal characters)

**Storage Strategy**:
- Local filesystem: `uploads/{attachable_type}/{attachable_id}/{uuid}_{filename}`
- Cloud migration path: Replace `file_path` with S3/Cloudinary URL

---

### 9. Notification

**Purpose**: In-app notifications for users (task assignments, deadlines, expense approvals).

**Fields**:
- `id` (UUID, PK): Unique identifier
- `recipient_id` (UUID, FK → User, NOT NULL): User receiving notification
- `notification_type` (ENUM, NOT NULL): Type of notification
- `related_entity_type` (VARCHAR(50), NOT NULL): Type of related entity
- `related_entity_id` (UUID, NOT NULL): ID of related entity
- `message` (TEXT, NOT NULL): Notification message text
- `is_read` (BOOLEAN, DEFAULT FALSE): Read status
- `created_at` (TIMESTAMP, DEFAULT NOW())

**Enums**:
- `NotificationType`: TaskAssigned, DeadlineApproaching, ExpenseStatusChanged

**Indexes**:
- Primary: `id`
- Foreign Key: `recipient_id` → User.id (ON DELETE CASCADE)
- Index: `is_read`, `created_at`
- Composite Index: (`recipient_id`, `is_read`) for unread count queries

**Relationships**:
- `recipient`: Many-to-one with User

**Validation Rules**:
- Recipient must exist and be active
- Message must not be empty

**Business Logic**:
- Notifications auto-created on:
  - Task assignment (NotificationType=TaskAssigned)
  - Deadline within 24 hours (NotificationType=DeadlineApproaching, scheduled job)
  - Expense approval/rejection (NotificationType=ExpenseStatusChanged)
- Mark as read: Set `is_read = TRUE`
- Unread count: COUNT WHERE recipient_id = user AND is_read = FALSE

---

## Enumerations Summary

| Enum Name | Values |
|-----------|--------|
| UserRole | Admin, ProjectManager, TeamMember, Finance, Viewer |
| ProjectStatus | Planning, InProgress, OnHold, Completed, Cancelled |
| TaskPriority | Low, Medium, High, Urgent, Critical |
| TaskStatus | ToDo, InProgress, Review, Done |
| SyncStatus | Pending, Synced, Failed |
| ApprovalStatus | Pending, Approved, Rejected |
| CommentableType | Project, Task |
| AttachableType | Project, Task, Expense |
| NotificationType | TaskAssigned, DeadlineApproaching, ExpenseStatusChanged |

## Cascade Delete Strategy

| Parent Entity | Child Entity | On Delete |
|---------------|--------------|-----------|
| User | Project (manager) | RESTRICT (reassign first) |
| User | Project (creator) | RESTRICT (preserve history) |
| User | Task (assigned) | RESTRICT (reassign first) |
| User | Comment | CASCADE |
| User | FileAttachment | CASCADE |
| User | Notification | CASCADE |
| Project | Task | CASCADE |
| Project | Expense | CASCADE |
| Project | Income | CASCADE |
| Task | Task (parent) | CASCADE (deletes subtasks) |
| Task | TimeEntry | CASCADE |

## Migration Strategy

**Alembic Migrations**:
1. Initial migration creates all tables with indexes
2. Seed migration adds default Admin user
3. Each entity has separate migration file for clarity
4. Enums represented within MongoDB document structure
5. Foreign keys with explicit naming convention: `fk_{table}_{column}_{ref_table}`

**HRMSX Sync Migration**:
- Phase 1 (MVP): `hrmsx_user_id` nullable, manual sync via admin endpoint
- Phase 2 (Post-MVP): Automated batch sync job, conflict resolution strategy

**Timezone Handling**:
- All TIMESTAMP fields store UTC in database
- Backend API converts to Asia/Karachi timezone in responses
- Frontend displays local time, sends UTC to API

## Performance Optimization

**Index Strategy**:
- All foreign keys indexed
- Composite indexes for common query patterns (project_id + status, user_id + start_time)
- Partial indexes for frequently filtered boolean fields (is_read = FALSE)

**Query Optimization**:
- Kanban board: Single query with JOIN on project_id + status composite index
- Dashboard profit/loss: Aggregation query with indexes on project_id + approval_status
- Notification unread count: Index on (recipient_id, is_read)

**Connection Pooling**:
- SQLAlchemy async engine with pool size 10-20
- Pool pre-ping enabled for health checks
- Connection timeout: 30 seconds

## Data Integrity

**Constraints**:
- All foreign keys with appropriate ON DELETE actions
- CHECK constraints: amount > 0, progress_percentage BETWEEN 0 AND 100
- UNIQUE constraints: User.email, User.hrmsx_user_id (sparse)
- NOT NULL constraints on all required fields

**Validation Layers**:
1. Database constraints (last line of defense)
2. SQLAlchemy model validation
3. Pydantic schema validation (API layer)
4. Zod validation (Frontend)

## Future Enhancements

**Potential Schema Changes** (Post-MVP):
- Add `hourly_rate` field to User for accurate labor cost calculation
- Add `soft_delete` (deleted_at timestamp) for audit trail
- Add `version` field for optimistic locking on concurrent updates
- Add separate `ExpenseCategory` table for dropdown management
- Add `ProjectTemplate` table for project cloning
- Add audit log table for all CRUD operations

**HRMSX Integration Extensions**:
- Add `last_sync_at` timestamp to User and TimeEntry
- Add `sync_error_message` field for troubleshooting
- Add `hrmsx_metadata` JSONB field for additional HRMSX data
