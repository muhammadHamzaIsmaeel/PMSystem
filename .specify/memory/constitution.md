<!--
SYNC IMPACT REPORT
==================
Version: 1.0.0 → 1.0.1
Bump Rationale: PATCH - Changed database technology from PostgreSQL to MongoDB.

Modified Sections:
- Technology Stack (Backend database changed to MongoDB)
- Deliverables (Docker Compose setup and database schema updated)

Added Sections:
- None

Removed Sections:
- None

Templates Requiring Updates:
- ✅ plan-template.md - Constitution Check section compatible (generic gates)
- ✅ spec-template.md - Requirements align with FR/NFR structure
- ✅ tasks-template.md - Task categorization supports all principle areas

Follow-up TODOs:
- None
-->

# Project Management System MVP Constitution

## Core Principles

### I. Code Quality Over Speed (NON-NEGOTIABLE)

Clean, readable, and maintainable code MUST always take priority over rapid delivery.

**Rationale**: Technical debt compounds exponentially in a 2-week timeline. Quality-first approach prevents cascading failures and ensures the system remains extensible for HRMSX integration.

**Rules**:
- All code MUST pass linting (PEP8 for Python, ESLint + Prettier for TypeScript)
- No unused imports, variables, or dead code permitted
- Functions MUST be small and focused on single responsibility
- Meaningful, descriptive names required for all variables, functions, and files
- No debugging artifacts (`print()`, `console.log()`) in production code

### II. Type Safety (NON-NEGOTIABLE)

100% type coverage on frontend (TypeScript) and backend (Pydantic + type hints).

**Rationale**: Type safety catches integration errors at compile time, critical for coordinating full-stack development and HRMSX data contracts.

**Rules**:
- TypeScript strict mode enabled, zero `any` types permitted
- All Python functions MUST have type hints (parameters + return values)
- All API request/response bodies MUST use Pydantic models
- Database models MUST define explicit types for all fields
- No implicit type coercion or unsafe casts

### III. DRY + KISS (Don't Repeat Yourself + Keep It Simple, Stupid)

Proper abstraction without over-engineering.

**Rationale**: 2-week timeline demands balance between reusability and delivery speed. Premature abstraction wastes time; copy-paste creates unmaintainable jungle.

**Rules**:
- Repeated logic (3+ occurrences) MUST be abstracted
- Abstractions MUST have clear, single purpose
- No organizational-only modules (every abstraction must provide functional value)
- Prefer composition over inheritance
- Avoid premature optimization; solve current requirements, not hypothetical futures

### IV. Security First

Input validation, SQL injection protection, JWT security, and role-based access control on every protected route.

**Rationale**: Project management systems handle sensitive business data. Security vulnerabilities are non-negotiable violations.

**Rules**:
- All user inputs MUST be validated (Pydantic schemas on backend, Zod on frontend)
- SQL queries MUST use parameterized statements (SQLAlchemy ORM only, no raw SQL)
- JWT tokens MUST have proper expiry (access: 15min, refresh: 7 days)
- Role checks MUST be enforced via dependency injection on all protected endpoints
- Passwords MUST be hashed (bcrypt, min 10 rounds)
- File uploads MUST validate file type, size (<10MB), and sanitize filenames
- CORS MUST be properly configured (no `*` wildcards in production)
- Secrets MUST use environment variables (`.env` never committed)

### V. HRMSX Integration Ready

All users, roles, and timesheets MUST be designed for synchronization with HRMSX system.

**Rationale**: System will eventually sync with HRMSX. Data models and APIs must accommodate external system constraints from day one.

**Rules**:
- User model MUST include `hrmsx_user_id` field (nullable, unique)
- Role mappings MUST be documented and aligned with HRMSX roles
- Timesheet entries MUST be structured for batch sync (created_at, updated_at, sync_status fields)
- Mock sync endpoints MUST be implemented (even if stubbed)
- Data migration strategy MUST be documented in plan.md

## Technology Stack

**Backend**:
- UV package manager + FastAPI (Python 3.11+)
- MongoDB database
- SQLAlchemy ORM
- Pydantic for schemas
- JWT authentication
- Alembic for migrations

**Frontend**:
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Server Components where applicable
- Zod for validation
- React Hook Form for forms

**Deployment**:
- Docker containerization
- Railway or Render platform
- Environment-based configuration

**Testing & Documentation**:
- Pytest for backend tests
- Postman collection for API testing
- Swagger/OpenAPI auto-generated docs

## Development Standards

### Folder Structure (NON-NEGOTIABLE)

**Backend**:
```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── core/            # Config, security, dependencies
│   ├── services/        # Business logic
│   └── utils/           # Helpers
├── alembic/             # Migration files
├── tests/
└── main.py
```

**Frontend**:
```
frontend/
├── src/
│   ├── app/             # Next.js 15 App Router
│   ├── components/      # React components
│   ├── lib/             # Utilities, API client
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
└── public/
```

### API Standards (MANDATORY)

All endpoints MUST include:

1. **Proper HTTP Status Codes**:
   - 200: Success (GET, PUT, PATCH)
   - 201: Created (POST)
   - 204: No Content (DELETE)
   - 400: Bad Request (validation errors)
   - 401: Unauthorized (missing/invalid token)
   - 403: Forbidden (insufficient permissions)
   - 404: Not Found
   - 500: Internal Server Error

2. **Pydantic Response Models**:
   - All responses typed with Pydantic schemas
   - Consistent error response format: `{"detail": "message"}`

3. **Error Handling**:
   - Try-except blocks for all database operations
   - Meaningful error messages (no raw exceptions to client)
   - Logging for all errors

4. **Role-Based Access**:
   - Dependency injection for role checks
   - Example: `Depends(require_role([UserRole.ADMIN, UserRole.PROJECT_MANAGER]))`

### Data Standards

**Status Enums**:
- Project: Planning, In Progress, On Hold, Completed, Cancelled
- Task: To Do, In Progress, Review, Done
- Priority: Low, Medium, High, Urgent, Critical
- Expense Approval: Pending, Approved, Rejected

**Monetary Fields**:
- Currency: PKR (Pakistani Rupee)
- Precision: 2 decimal places
- Type: Decimal (not Float)

**Timestamps**:
- Timezone: Asia/Karachi
- Format: ISO 8601 (UTC stored, localized on display)
- Auto-managed: created_at, updated_at (database triggers or ORM)

### Frontend Standards

**Next.js 15 App Router**:
- Server Components by default (use `'use client'` only when necessary)
- Proper loading states (`loading.tsx`)
- Error boundaries (`error.tsx`)
- No client-side data fetching for static data

**Responsive Design**:
- Mobile-first approach
- Minimum viewport: 360px
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

**Performance**:
- Lighthouse score >90 (Performance + Accessibility)
- Image optimization (next/image)
- Code splitting via dynamic imports
- Lazy loading for heavy components

## Mandatory Modules & Features

### Week 1 (Days 1-7)

1. **Authentication & RBAC**:
   - User registration, login, logout
   - JWT token generation + refresh
   - Roles: Admin, Project Manager, Team Member, Finance, Viewer
   - Role-based route protection

2. **Project CRUD**:
   - Create, Read, Update, Delete projects
   - Fields: name, client, manager, budget, timeline, status, description
   - Manager assignment (Project Manager role only)

3. **Task + Subtask CRUD**:
   - Create, Read, Update, Delete tasks and subtasks
   - Fields: title, description, assignee, priority, status, deadline, progress %
   - Task dependencies (optional but recommended)

4. **Kanban Board**:
   - Drag-and-drop task status updates
   - Visual columns: To Do, In Progress, Review, Done
   - Real-time updates (optimistic UI)

5. **Comments + File Attachments**:
   - Comment on projects and tasks
   - Multiple file uploads per entity
   - File type validation (images, PDFs, docs)

6. **Time Tracking**:
   - Manual time entry (start, end, duration, description)
   - Link entries to tasks
   - HRMSX sync fields ready

### Week 2 (Days 8-14)

7. **Expenses Module**:
   - Record expenses with receipt upload
   - Fields: amount, category, date, description, project, task
   - Approval workflow: Pending → Approved → Rejected
   - Finance role approval required

8. **Income/Milestone Payments**:
   - Record project income and milestones
   - Fields: amount, date, description, project, payment_method

9. **Auto Profit/Loss Calculation**:
   - Per-project calculation: Income - (Expenses + Labor Costs)
   - Labor cost estimation based on time entries
   - Real-time dashboard updates

10. **Dashboard**:
    - Summary cards: Total Projects, Active Tasks, Budget Utilization, Profit/Loss
    - Charts: Project timeline (Gantt-style), Expense breakdown, Task completion
    - Role-specific views

11. **Basic Notifications**:
    - In-app notifications (task assigned, deadline approaching, etc.)
    - Email notification placeholders (templates ready, SMTP optional)

## Deliverables

**Code** (MANDATORY):
- Fully working FastAPI backend with all CRUD APIs
- Complete Next.js 15 frontend (responsive, beautiful UI)
- Docker Compose setup (backend + frontend + MongoDB)

**Database** (MANDATORY):
- MongoDB schema with all tables
- Alembic migration files
- ERD diagram (Mermaid or PNG)

**Documentation** (MANDATORY):
- README.md with setup instructions
- `.env.example` with all required variables
- Postman collection (exported JSON)
- Swagger docs accessible at `/docs`

**Deployment** (MANDATORY):
- Deployed on test server (Railway/Render)
- Public URL provided
- Health check endpoint (`/health`)

**Quality Assurance** (MANDATORY):
- All Postman tests pass (200+ status codes verified)
- Zero console errors (browser + terminal)
- Code fully typed (TypeScript + Python)

## Success Criteria

**Functional** (NON-NEGOTIABLE):
1. All 11 modules 100% working (no half-baked features)
2. Role-based access 100% enforced (Finance sees only financial, Team Member sees only assigned tasks)
3. Kanban drag-drop smooth (no page refresh)
4. File upload functional (multiple files, validation working)
5. Profit/Loss auto-calculates on data changes

**Non-Functional** (NON-NEGOTIABLE):
1. Zero console errors (browser DevTools + terminal)
2. All API tests pass in Postman (100% success rate)
3. Mobile responsive (minimum 360px width)
4. Lighthouse score >90 (Performance + Accessibility)
5. Code 100% typed (no `any`, no missing type hints)

**Deployment** (NON-NEGOTIABLE):
1. Test server accessible via public URL
2. Docker setup working (one-command start: `docker-compose up`)
3. README instructions executable by non-developer

## Constraints & Violations

### Timeline Constraints

**Deadline**: Exact 14 days from start date (no extensions)

**Daily Expectations**:
- Days 1-2: Project setup, authentication, basic CRUD
- Days 3-5: Tasks, Kanban, Comments, Files
- Days 6-7: Time tracking, Week 1 polish
- Days 8-10: Expenses, Income, Profit/Loss
- Days 11-12: Dashboard, Notifications
- Days 13-14: Testing, deployment, documentation

### Code Quality Constraints

**Prohibited Practices** (IMMEDIATE TERMINATION):
- Plagiarized/copied code from internet without attribution
- Hardcoded secrets or credentials
- `print()` or `console.log()` debugging in final code
- Unused imports or dead code
- Fake implementations or commented-out features

**Required Practices**:
- Meaningful git commit messages (format: `type(scope): description`)
- PEP8 compliance (Python) verified by `flake8`
- ESLint + Prettier compliance (TypeScript) verified by `npm run lint`
- No seed data except for testing/demo purposes

### Security Constraints (NON-NEGOTIABLE)

**Violations Result in Termination**:
- Missing input validation
- SQL injection vulnerabilities (raw SQL usage)
- Missing role checks on protected routes
- Improper JWT handling (no expiry, weak secrets)
- Insecure file uploads (no validation)

## Governance

### Amendment Procedure

1. Constitution changes MUST be documented in this file
2. Version MUST increment according to semantic versioning:
   - MAJOR: Backward-incompatible changes (principle removal/redefinition)
   - MINOR: New principles or sections added
   - PATCH: Clarifications, wording fixes
3. All amendments MUST include rationale
4. Dependent templates (plan, spec, tasks) MUST be updated for consistency

### Compliance Review

**Every Pull Request MUST**:
1. Verify compliance with Core Principles (I-V)
2. Pass linting and type checking
3. Include tests for new functionality (if TDD adopted)
4. Update documentation if APIs change

**Every Implementation Phase MUST**:
1. Validate against Success Criteria
2. Check Deliverables checklist
3. Ensure no Constraint violations

### Version Control

**Commit Standards**:
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Scope: module name (auth, projects, tasks, etc.)
- Description: Present tense, imperative mood

**Branch Strategy**:
- `main`: Production-ready code
- `develop`: Integration branch
- Feature branches: `feature/module-name`

### Constitution Authority

This constitution supersedes all other practices. When conflicts arise between this document and external guidance, this constitution takes precedence.

**Runtime Development Guidance**: Refer to `GEMINI.md` in project root for AI agent-specific workflows and SDD practices.

**Complexity Justification**: Any violation of simplicity principles (DRY, KISS) MUST be documented in `plan.md` with rationale and rejected alternatives.

---

**Version**: 1.0.1 | **Ratified**: 2025-12-10 | **Last Amended**: 2025-12-15