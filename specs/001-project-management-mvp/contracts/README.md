# API Contracts: Project Management System MVP

**Feature**: 001-project-management-mvp
**API Version**: v1
**Base URL**: `/api/v1`

## Overview

This directory contains the API contract specifications for the Project Management System MVP. All endpoints follow RESTful conventions with role-based access control (RBAC), Pydantic schema validation, and consistent error handling.

## API Endpoints Summary

### Authentication (`/auth`)
- `POST /register` - User registration
- `POST /login` - JWT login (access + refresh tokens)
- `POST /logout` - Invalidate session
- `POST /refresh` - Refresh access token

### Users (`/users`)
- `GET /me` - Get current user profile
- `POST /sync-hrmsx` - Mock HRMSX user sync (Admin only)

### Projects (`/projects`)
- `GET /` - List projects (role-filtered)
- `POST /` - Create project (Admin/PM only)
- `GET /{id}` - Get project detail
- `PUT /{id}` - Update project (role-based)
- `DELETE /{id}` - Delete project (Admin only)

### Tasks (`/tasks`)
- `GET /` - List tasks (role-filtered)
- `POST /` - Create task (Admin/PM only)
- `GET /{id}` - Get task detail
- `PUT /{id}` - Update task (role-based)
- `DELETE /{id}` - Delete task
- `POST /{id}/subtasks` - Create subtask

### Kanban (`/kanban`)
- `GET /projects/{project_id}` - Get Kanban board data
- `PATCH /tasks/{task_id}/status` - Update task status
- WebSocket: `ws://backend/api/v1/kanban/ws` - Real-time updates

### Comments (`/comments`)
- `GET /{type}/{id}/comments` - List comments for entity
- `POST /{type}/{id}/comments` - Create comment

### Files (`/files`)
- `POST /upload` - Upload file(s)
- `GET /{id}` - Download file

### Time Entries (`/time-entries`)
- `GET /` - List time entries (role-filtered)
- `POST /` - Create time entry (Team Member/Admin)
- `GET /{id}` - Get time entry detail
- `PUT /{id}` - Update time entry
- `DELETE /{id}` - Delete time entry

### Expenses (`/expenses`)
- `GET /` - List expenses (role-filtered)
- `POST /` - Create expense
- `GET /{id}` - Get expense detail
- `PUT /{id}` - Update expense
- `PATCH /{id}/approve` - Approve expense (Finance only)
- `PATCH /{id}/reject` - Reject expense (Finance only)

### Income (`/income`)
- `GET /` - List income (role-filtered)
- `POST /` - Create income (Admin/PM only)
- `GET /{id}` - Get income detail
- `PUT /{id}` - Update income
- `DELETE /{id}` - Delete income

### Dashboard (`/dashboard`)
- `GET /summary` - Get summary cards (role-filtered)
- `GET /charts/project-timeline` - Project timeline data
- `GET /charts/expense-breakdown` - Expense breakdown data
- `GET /charts/task-completion` - Task completion data
- `GET /projects/{id}/profit-loss` - Project profit/loss calculation

### Notifications (`/notifications`)
- `GET /` - List notifications
- `GET /unread-count` - Get unread count
- `PATCH /{id}/read` - Mark notification as read
- `PATCH /read-all` - Mark all as read

## Common Patterns

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

### Pagination

List endpoints support pagination via query parameters:

```
GET /api/v1/projects?skip=0&limit=20
```

Response includes total count:

```json
{
  "items": [...],
  "total": 100,
  "skip": 0,
  "limit": 20
}
```

### Error Responses

All errors return consistent format:

```json
{
  "detail": "Error message here"
}
```

**HTTP Status Codes**:
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Timestamps

All timestamps are in ISO 8601 format (UTC):

```json
{
  "created_at": "2025-12-10T14:30:00Z",
  "updated_at": "2025-12-10T15:45:00Z"
}
```

Frontend converts to Asia/Karachi timezone for display.

### Monetary Values

All amounts are in PKR with exactly 2 decimal places:

```json
{
  "budget": "150000.00",
  "amount": "5000.50"
}
```

## Role-Based Access Control

### Role Permissions

| Role | Projects | Tasks | Expenses | Income | Users | Dashboard |
|------|----------|-------|----------|--------|-------|-----------|
| **Admin** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | All data |
| **Project Manager** | Create, Update (own) | Create, Update (own project) | View | Create, Update | View | Own projects |
| **Team Member** | View | View, Update (assigned) | Create | View | View | Assigned tasks |
| **Finance** | View | View | Approve/Reject | View | View | Financial only |
| **Viewer** | View only | View only | View | View | View | All data (read-only) |

### Access Rules

- **Projects**: PM can only update projects where `manager_id = current_user.id`
- **Tasks**: Team Member can only update tasks where `assigned_user_id = current_user.id`
- **Expenses**: Users cannot approve own expenses (FR-036)
- **HRMSX Sync**: Admin only

## WebSocket Events

**Connection**: `ws://backend/api/v1/kanban/ws?token=<jwt_token>`

### Client → Server

```json
{
  "event": "join_project",
  "project_id": 123
}
```

### Server → Client

**Task Updated**:
```json
{
  "event": "task_updated",
  "task_id": 456,
  "status": "InProgress",
  "timestamp": "2025-12-10T14:30:00Z"
}
```

**Task Created**:
```json
{
  "event": "task_created",
  "task": { /* full task object */ },
  "timestamp": "2025-12-10T14:30:00Z"
}
```

## Validation Schemas

All request bodies validated with Pydantic schemas. Example:

**Create Project**:
```json
{
  "name": "Website Redesign",
  "client_name": "Acme Corp",
  "manager_id": 5,
  "budget": "150000.00",
  "start_date": "2025-12-15",
  "end_date": "2026-01-15",
  "status": "Planning",
  "description": "Complete website redesign project"
}
```

**Validation Rules**:
- `name`: 1-255 characters, required
- `budget`: Decimal, > 0, required
- `end_date`: Must be >= `start_date`
- `manager_id`: Must reference active user with PM or Admin role
- `status`: Must be valid ProjectStatus enum

## Testing

**Postman Collection**: `postman_collection.json` (in project root)

**Example Test Flow**:
1. Register user → receives 201
2. Login → receives access_token + refresh_token
3. Create project (with admin token) → receives 201
4. Create task (with PM token) → receives 201
5. List tasks (with team member token) → receives only assigned tasks
6. Attempt to approve expense (with team member token) → receives 403

## OpenAPI Specification

Full OpenAPI 3.1 specification available at:
- **Development**: http://localhost:8000/docs (Swagger UI)
- **Development**: http://localhost:8000/redoc (ReDoc UI)
- **File**: `contracts/api.openapi.yaml` (to be generated)

## Implementation Notes

**Backend (`app/api/v1/`)**: Each endpoint module returns an `APIRouter`, aggregated in `api/v1/router.py` and included in `main.py`.

**Frontend (`src/lib/api.ts`)**: Type-safe API client generated from Pydantic schemas, matching OpenAPI spec.

**Testing**: All endpoints must have contract tests in `tests/contract/`, verifying request/response schemas and status codes.

---

**Contract Version**: 1.0.0
**Last Updated**: 2025-12-10
**Next**: Implement endpoints following contracts, verify with Postman tests
