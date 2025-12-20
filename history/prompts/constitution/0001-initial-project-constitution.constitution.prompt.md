---
id: 0001
title: Initial Project Constitution
stage: constitution
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: ADVANCES--PC
command: /sp.constitution
labels: ["constitution", "governance", "principles", "mvp", "full-stack", "project-management"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (documentation artifact)
---

## Prompt

Project: 2-Week Full-Stack Project Management System MVP (HRMSX Integration Ready)
Tech Stack:
- Backend: UV + FastAPI (Python 3.11+)
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Database: PostgreSQL
- Authentication: JWT + Role-based (sync with HRMSX users)
- Deployment: Test server ready (Docker + Railway/Render)

Core Principles (Non-Negotiable):
- Code Quality > Speed: Clean, readable, maintainable code hamesha priority
- Type Safety: 100% TypeScript on frontend, Pydantic + type hints on backend
- DRY + KISS: No copy-paste jungle, proper abstraction
- Security First: Input validation, SQL injection safe, JWT proper expiry, role checks on every protected route
- HRMSX Integration Ready: Sab users, roles, timesheets HRMSX se sync hone chahiye (mock bhi chalega abhi)

Key Standards:
- Follow RESTful conventions strictly
- Proper folder structure (backend: app/api/v1/, app/models/, app/schemas/, app/core/)
- Frontend: App Router, Server Components where possible, proper loading/error states
- All API endpoints must have:
  - Proper status codes
  - Response models (Pydantic)
  - Error handling
  - Role-based dependency injection
- Use proper status enums (Project: Planning, In Progress, On Hold, Completed, Cancelled)
- Task status: To Do, In Progress, Review, Done
- Priority: Low, Medium, High, Urgent, Critical
- All monetary fields in PKR with 2 decimal places
- Timestamps in Asia/Karachi timezone

Mandatory Modules & Features (Week 1 + Week 2):
1. Authentication & RBAC (Admin, Project Manager, Team Member, Finance, Viewer)
2. Project CRUD + Manager assignment, client, budget, timeline, status
3. Task + Subtask CRUD Assignment, priority, status, deadline, progress %
4. Kanban Board (drag-drop working)
5. Comments + File Attachments (multiple files per task/project)
6. Time Tracking (manual entry + future HRMSX timesheet sync ready)
7. Expenses Module (with receipt upload, approval workflow: Pending → Approved → Rejected)
8. Income/Milestone Payments
9. Auto Profit/Loss calculation
10. Dashboard (charts + summary cards)
11. Basic Notifications (in-app + email placeholder)

Deliverables (Must be 100% complete in 2 weeks):
- Fully working FastAPI backend with all CRUD APIs
- Complete Next.js 15 frontend (responsive, beautiful UI)
- PostgreSQL ERD + Migration files
- Postman collection + API documentation (Swagger working)
- Dockerized + deployed on test server
- README with setup + env example
- Proper git commits (meaningful messages)

Success Criteria (Yeh sab poora hona chahiye warna reject):
- Zero console errors in browser & terminal
- All API tests pass in Postman
- Role-based access 100% working (Finance sirf financial dekh sake, Team Member apne tasks)
- Kanban drag-drop smooth
- File upload working
- Profit/Loss auto calculate hota ho
- Mobile responsive (minimum 360px)
- Lighthouse score > 90 (Performance + Accessibility)
- Code fully typed (no any)

Constraints:
- Deadline: Exact 14 days from start date
- No hardcoded data (except seed for testing)
- No print() debugging
- No unused imports or dead code
- Follow PEP8 + Prettier + ESLint strictly

Punishment for Violation:
Agent will be terminated immediately if:
- Plagiarized/copied code from internet se
- Fake deployment ya half-working features
- Missing RBAC ya security holes
- Deadline miss kiya

## Response snapshot

Successfully created the Project Management System MVP Constitution (v1.0.0) with comprehensive governance framework:

**Core Principles Established (5 NON-NEGOTIABLE):**
1. Code Quality Over Speed - Technical debt prevention in 2-week timeline
2. Type Safety - 100% TypeScript + Pydantic coverage
3. DRY + KISS - Balance between reusability and delivery speed
4. Security First - Input validation, SQL injection protection, JWT security, RBAC
5. HRMSX Integration Ready - Future-proof data models and sync fields

**Major Sections Added:**
- Technology Stack (Backend: FastAPI+PostgreSQL, Frontend: Next.js 15, Deployment: Docker+Railway/Render)
- Development Standards (Folder structure, API standards, Data standards, Frontend standards)
- Mandatory Modules & Features (11 modules across 2 weeks with timeline breakdown)
- Deliverables (Code, Database, Documentation, Deployment, QA requirements)
- Success Criteria (Functional, Non-Functional, Deployment metrics)
- Constraints & Violations (Timeline, Code Quality, Security with termination triggers)
- Governance (Amendment procedure, Compliance review, Version control)

**Files Modified:**
- `.specify/memory/constitution.md` - Complete constitution with all placeholders filled

**Template Compatibility:**
- ✅ plan-template.md - Constitution Check section works with generic gates
- ✅ spec-template.md - Requirements structure aligns with FR/NFR format
- ✅ tasks-template.md - Task categorization supports all principle areas

**Version:** 1.0.0 (MAJOR bump - initial ratification)
**Ratified:** 2025-12-10

## Outcome

- ✅ Impact: Established complete governance framework for 2-week full-stack MVP project with 5 core principles, comprehensive standards, and strict compliance requirements
- 🧪 Tests: N/A (governance document)
- 📁 Files: 1 created (.specify/memory/constitution.md - 421 lines)
- 🔁 Next prompts: /sp.specify <feature-description> to create feature specifications, /sp.plan to architect implementation, /sp.tasks to generate task lists
- 🧠 Reflection: Constitution provides strong foundation with clear success criteria (Lighthouse >90, zero errors, 100% type coverage) and enforcement mechanisms (termination triggers for security violations, plagiarism, deadline misses). HRMSX integration readiness baked into data models from day one.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution created successfully with all placeholders filled and sync impact report generated
- Graders run and results (PASS/FAIL): PASS - All template compatibility verified, no unresolved placeholders, semantic versioning applied correctly
- Prompt variant (if applicable): Standard /sp.constitution with comprehensive multi-language (English+Urdu) input
- Next experiment (smallest change to try): Monitor constitution compliance during /sp.specify and /sp.plan phases to ensure gates are properly enforced
