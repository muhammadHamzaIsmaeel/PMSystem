# Research Findings: Project Management System MVP

**Feature**: 001-project-management-mvp
**Date**: 2025-12-10
**Phase**: Phase 0 Research & Technical Decisions

## Overview

This document consolidates research findings for production-grade FastAPI backend and Next.js 15 frontend patterns. All decisions align with the constitution's principles (Code Quality, Type Safety, DRY+KISS, Security First, HRMSX Integration Ready).

---

## Backend Research: FastAPI + UV

### 1. Project Structure

**Decision**: Layered Architecture with Domain-Driven Separation

**Rationale**:
- Clear separation: Models (data), Schemas (validation), Services (business logic), API (routing)
- Supports dependency injection pattern required for RBAC
- Aligns with constitutional backend structure requirements
- Scales well for 11 modules without becoming unwieldy

**Implementation**: Backend follows `app/api/v1/`, `app/models/`, `app/schemas/`, `app/core/` structure mandated by constitution.

---

### 2. Authentication & Security

**Decision**: JWT with Role-Based Access Control via FastAPI Dependencies

**Stack**:
- `python-jose[cryptography]` for JWT
- `passlib[bcrypt]` for password hashing (min 10 rounds)
- `python-multipart` for login forms
- HTTPBearer security scheme

**Rationale**:
- Stateless JWT scales horizontally (no session storage)
- Access (15min) + Refresh (7 days) balances security and UX
- Dependency injection makes role checks declarative and testable
- Meets all constitutional security requirements

**Key Pattern**:
```python
def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403)
        return current_user
    return role_checker
```

**Alternatives Rejected**:
- Session-based auth: Requires Redis, adds complexity
- OAuth2 third-party: Conflicts with HRMSX internal user sync

---

### 3. Database Integration

**Decision**: SQLAlchemy 2.0 Async + Asyncpg + Alembic

**Stack**:
- SQLAlchemy 2.0+ with async support
- `asyncpg` driver (2-3x faster than psycopg2)
- Alembic for migrations
- Connection pooling (size=20, max_overflow=10)

**Rationale**:
- Async I/O prevents blocking on DB queries (handles 50+ concurrent users)
- Type safety via SQLAlchemy 2.0 Mapped types
- Connection pooling prevents exhaustion under load
- Industry standard with excellent documentation

**Key Patterns**:
- Eager loading with `selectinload()` to avoid N+1 queries
- Explicit transactions for multi-step workflows
- UTC timestamps in DB, Asia/Karachi conversion in API

**Alternatives Rejected**:
- Tortoise ORM: Less mature ecosystem
- SQLModel: Newer, less battle-tested
- Raw SQL: Violates constitution ORM requirement

---

### 4. Real-Time Updates

**Decision**: FastAPI Native WebSockets with Polling Fallback

**Approach**:
- ConnectionManager pattern for room-based broadcasting
- Project-based rooms prevent irrelevant updates
- Polling endpoint for WebSocket-restricted environments

**Rationale**:
- No additional infrastructure (Redis/RabbitMQ) needed for MVP
- Built-in FastAPI support, minimal boilerplate
- Meets 2-second update requirement
- Scales to 50 concurrent users

**Key Implementation**:
```python
class ConnectionManager:
    async def broadcast_to_project(self, project_id: int, message: dict):
        for connection in self.active_connections[project_id]:
            await connection.send_json(message)
```

**Alternatives Rejected**:
- Socket.IO: Requires additional dependency
- Server-Sent Events: Less interactive
- Polling only: Cannot meet 2-second requirement efficiently

---

### 5. File Upload Handling

**Decision**: Local Filesystem Storage with Validation

**Stack**:
- FastAPI `UploadFile`
- `aiofiles` for async file I/O
- `python-magic` for MIME type validation
- UUID filenames to prevent collisions

**Rationale**:
- Simple for MVP, no external services required
- Cost-effective (free storage)
- Direct disk access fast for <10MB files
- Cloud migration path documented

**Validation Strategy**:
1. File extension check (`.pdf`, `.jpg`, `.png`, `.doc`, `.docx`)
2. Size validation (<10MB)
3. MIME type verification (prevents spoofing)
4. Filename sanitization (UUID + extension)

**Storage Path**: `uploads/{entity_type}/{entity_id}/{uuid}_{filename}`

**Alternatives Rejected**:
- Cloud storage (S3/Cloudinary): External dependencies for MVP
- Base64 in database: 33% overhead, poor performance

---

### 6. Testing Strategy

**Decision**: Pytest with Three-Layer Test Pyramid

**Distribution**:
- 70% Contract Tests: API endpoint contracts
- 20% Integration Tests: Multi-step workflows
- 10% Unit Tests: Pure logic functions

**Stack**:
- `pytest` + `pytest-asyncio`
- `httpx` for async API testing
- `pytest-cov` for coverage reporting
- `faker` for test data generation

**Rationale**:
- Contract tests verify API behavior (highest ROI)
- Integration tests catch workflow bugs
- Unit tests ensure logic correctness
- Separate test database prevents pollution

**Key Fixtures**:
- `test_engine`: Session-scoped test database
- `db_session`: Function-scoped rollback session
- `client`: Async HTTP client with dependency overrides
- `admin_token`, `pm_token`, `team_token`: Role-based JWT tokens

**Alternatives Rejected**:
- Postman only: Not automated, no CI/CD
- unittest: More verbose, weaker async support
- BDD (Gherkin): Overkill for 2-week MVP

---

## Frontend Research: Next.js 15 + TypeScript

### 1. Project Structure

**Decision**: Constitutional Structure with Route Groups

**Organization**:
```
src/
├── app/
│   ├── (auth)/          # Route group: login, register
│   ├── (dashboard)/     # Route group with shared layout
│   │   ├── projects/
│   │   ├── kanban/[projectId]/
│   │   └── expenses/
│   └── api/             # File upload endpoints
├── components/          # Organized by domain (projects/, tasks/, shared/)
├── lib/                 # API client, WebSocket, utilities
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

**Rationale**:
- Route groups organize routes without affecting URLs
- Domain-organized components scale better
- Matches constitutional frontend structure requirements
- `loading.tsx` and `error.tsx` for automatic states

**Alternatives Rejected**:
- Flat structure: Poor scalability with 11 modules
- Feature-based top-level folders: Fragments Next.js conventions

---

### 2. Server vs. Client Components

**Decision**: Server Components by Default, Client for Interactivity

**Server Components** (no `'use client'`):
- Layout shells, page wrappers
- Data fetching components (lists, dashboards)
- Read-only displays

**Client Components** (`'use client'` directive):
- Kanban Board (drag-drop, real-time)
- Forms (React Hook Form state)
- File Upload (progress tracking)
- Mobile Navigation (toggle state)
- Real-time Notifications (WebSocket subscriptions)

**Rationale**:
- Server Components reduce JavaScript bundle (critical for Lighthouse ≥92)
- Real-time features need `useState`, `useEffect`, WebSocket
- Security: Server Components can access backend APIs with secrets

**Pattern**:
```typescript
// Server Component (page)
export default async function KanbanPage({ params }) {
  const initialTasks = await fetchTasks(params.projectId)
  return <KanbanBoard initialData={initialTasks} />
}

// Client Component (interactive)
'use client'
export function KanbanBoard({ initialData }) {
  const [tasks, setTasks] = useState(initialData)
  useKanbanRealtime(projectId, setTasks) // WebSocket
}
```

**Alternatives Rejected**:
- All Client Components: Poor initial load, fails Lighthouse
- Server Actions for everything: Real-time needs WebSocket

---

### 3. State Management

**Decision**: Hybrid - Server Actions + Zustand + WebSocket

**Server Actions** (Next.js 15 native):
- Form submissions (create/update operations)
- CRUD with automatic revalidation
- Optimistic UI with `useOptimistic`

**Zustand** (lightweight state):
- Global UI state (sidebar, filters)
- User session (current user, role, JWT token)
- Notifications (unread count, list)

**WebSocket** (Socket.IO):
- Real-time Kanban updates
- Live notifications
- Collaborative editing

**Rationale**:
- Server Actions reduce API boilerplate (Next.js 15 native)
- Zustand minimal (<1KB), no Provider wrapping, TypeScript-friendly
- WebSocket only solution for 2-second real-time updates
- Avoids Redux complexity for 2-week MVP

**Alternatives Rejected**:
- React Context everywhere: Re-render issues
- Redux Toolkit: Overkill, complex setup
- Polling instead of WebSocket: Inefficient

---

### 4. Real-Time Integration

**Decision**: Socket.IO with Optimistic UI

**Architecture**:
1. Backend runs Socket.IO server (`python-socketio`)
2. Client connects via `socket.io-client`
3. Server emits events on task updates
4. Connected clients receive events, update local state
5. Optimistic UI: update immediately, revert if rejected

**Rationale**:
- Socket.IO: automatic reconnection, room support, polling fallback
- Optimistic UI: better UX than waiting for server
- Selective real-time: only Kanban uses WebSocket (conserve resources)

**Client Hook**:
```typescript
export function useKanbanRealtime(projectId, onTaskUpdate) {
  useEffect(() => {
    const socket = getSocket()
    socket.emit('join:project', projectId)
    socket.on('task:updated', onTaskUpdate)
    return () => socket.off('task:updated')
  }, [projectId])
}
```

**Alternatives Rejected**:
- Native WebSocket: No reconnection, no rooms
- Pusher/Ably: External dependencies, cost
- Server-Sent Events: Unidirectional

---

### 5. File Upload

**Decision**: Client-Side Direct Upload with Validation and Progress

**Flow**:
1. Client validates file (type, size) using Zod
2. Upload to Next.js API route (`/api/uploads`) via FormData
3. API route validates, sanitizes filename, saves to disk
4. Returns file URL, stored in database
5. Progress tracked with `XMLHttpRequest.upload.onprogress`

**Rationale**:
- Client-side validation: immediate feedback
- Next.js API route: handles storage without exposing backend
- Progress tracking: required for UX (SC-011)

**Upload Component**:
```typescript
'use client'
export function FileUpload({ onUploadComplete }) {
  const [progress, setProgress] = useState({})

  const uploadFile = async (file: File) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      setProgress({ [file.name]: (e.loaded/e.total)*100 })
    }
    xhr.open('POST', '/api/uploads')
    xhr.send(formData)
  }
}
```

**Alternatives Rejected**:
- Direct to backend: CORS complexity
- Direct to cloud (S3): External dependencies for MVP
- Base64 encoding: 33% size overhead

---

### 6. Mobile Responsiveness

**Decision**: Tailwind Mobile-First + @dnd-kit + ShadCN UI

**Approach**:
1. Mobile-first CSS: default 360px, use `sm:`, `md:`, `lg:` for larger
2. ShadCN UI: pre-built accessible components
3. Touch-friendly: 44px minimum tap targets
4. Drag-and-drop: `@dnd-kit/core` with touch sensor

**Rationale**:
- Tailwind mobile-first: easier to scale up than down
- @dnd-kit: React 18 compatible, touch-friendly, better than react-beautiful-dnd
- Constitutional: SC-011 mandates 360px support

**Touch-Optimized Drag-Drop**:
```typescript
'use client'
import { DndContext, TouchSensor, MouseSensor } from '@dnd-kit/core'

const sensors = useSensors(
  useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 }
  }),
  useSensor(MouseSensor)
)
```

**Gotchas**:
- `TouchSensor` requires explicit activation
- Add 250ms delay to allow scrolling on mobile
- Test on real devices (DevTools emulation imperfect)
- Ensure 44px minimum tap target

**Alternatives Rejected**:
- react-beautiful-dnd: Discontinued, no React 18
- Desktop-first: Poor mobile UX

---

### 7. Performance Optimization

**Decision**: Multi-Layer Optimization for Lighthouse ≥92

**Strategies**:
1. **Code Splitting**: Dynamic imports for heavy components (charts)
2. **Image Optimization**: Use `next/image` with WebP/AVIF
3. **Font Optimization**: Use `next/font` with `display: swap`
4. **Server Components**: Maximize usage (reduces client JS)
5. **Bundle Analysis**: Run weekly, remove unused dependencies
6. **Caching**: Enable Next.js automatic caching

**Rationale**:
- SC-010 mandates Lighthouse ≥92
- SC-009 requires <3 second load times
- Mobile performance critical for 360px requirement

**Dynamic Import**:
```typescript
const ExpenseChart = dynamic(
  () => import('@/components/dashboard/expense-chart'),
  { loading: () => <Skeleton />, ssr: false }
)
```

**next.config.js**:
```javascript
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [360, 640, 768, 1024, 1280],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}
```

**Gotchas**:
- `next/image` requires explicit `width`/`height`
- Chart libraries often need `ssr: false`
- Run Lighthouse in incognito mode (extensions skew scores)

---

## Technology Stack Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend Framework** | FastAPI + UV | Async-first, excellent type support, auto OpenAPI |
| **Frontend Framework** | Next.js 15 (App Router) | Server Components, built-in optimization, TypeScript |
| **Database** | MongoDB Atlas | Document-oriented, scalable, flexible |
| **ORM** | SQLAlchemy 2.0 Async | Type-safe, async support, battle-tested |
| **Auth** | JWT (python-jose) | Stateless, scalable, standard |
| **Password Hashing** | bcrypt (passlib) | Industry standard, min 10 rounds |
| **Real-Time** | FastAPI WebSocket + Socket.IO | Native support, automatic reconnection |
| **File Storage** | Local Filesystem (MVP) | Simple, cost-effective, cloud migration path |
| **State Management** | Server Actions + Zustand | Minimal boilerplate, TypeScript-friendly |
| **UI Framework** | Tailwind CSS + ShadCN UI | Mobile-first, accessible, customizable |
| **Drag-and-Drop** | @dnd-kit | React 18 compatible, touch-friendly |
| **Forms** | React Hook Form + Zod | Type-safe validation, performance |
| **Testing (Backend)** | pytest + httpx | Async support, excellent fixtures |
| **API Testing** | Postman + Newman | Manual + automated, CI/CD integration |
| **Deployment** | Docker + Railway/Render | Containerized, easy scaling |

---

## Critical Implementation Priorities

### Phase 1: Foundation (Days 1-2)
- Project structure setup (backend + frontend folders)
- UV + FastAPI initialization
- Next.js 15 + TypeScript + Tailwind setup
- MongoDB + Docker Compose
- Constitutional folder structure compliance

### Phase 2: Authentication & Database (Days 3-4)
- SQLAlchemy models (all 9 entities)
- Alembic migrations
- JWT authentication + refresh tokens
- RBAC dependency injection
- User registration/login endpoints

### Phase 3: Core CRUD (Days 5-7)
- Project CRUD with role filtering
- Task + Subtask CRUD
- Frontend forms (React Hook Form + Zod)
- Basic dashboard layout
- Contract tests for all endpoints

### Phase 4: Real-Time & Files (Days 8-10)
- WebSocket setup (FastAPI + Socket.IO)
- Kanban Board with @dnd-kit
- File upload with validation
- Comment system
- Time entry tracking

### Phase 5: Financial Module (Days 11-12)
- Expense CRUD + approval workflow
- Income/Milestone tracking
- Profit/Loss calculation service
- Dashboard charts (lazy-loaded)
- Notification system

### Phase 6: Polish & Deploy (Days 13-14)
- Mobile responsiveness testing
- Lighthouse optimization
- Postman collection export
- Docker production builds
- Railway/Render deployment
- README + quickstart documentation

---

## Risk Mitigation Strategies

**Risk 1: Real-time complexity**
- **Mitigation**: Implement polling first, upgrade to WebSocket after basics proven
- **Fallback**: Polling endpoint always available

**Risk 2: Mobile drag-and-drop UX**
- **Mitigation**: Use @dnd-kit with TouchSensor from day 1, test on real devices weekly
- **Fallback**: Desktop-optimized Kanban with mobile list view

**Risk 3: Lighthouse score <92**
- **Mitigation**: Run Lighthouse after each major component, optimize incrementally
- **Strategy**: Maximize Server Components, dynamic imports for charts, optimize images

**Risk 4: File storage limits**
- **Mitigation**: 10MB per-file limit, 100MB per-user quota, monitoring alerts
- **Fallback**: Cloud migration path documented

**Risk 5: Database performance**
- **Mitigation**: Add indexes on foreign keys from day 1, pagination on all lists
- **Monitoring**: Log slow queries (>200ms), add composite indexes

**Risk 6: HRMSX sync complexity**
- **Mitigation**: Mock endpoint for MVP, clear data contract documented
- **Integration Plan**: Separate service module, easy to swap mock for real API

---

## Validation Checkpoints

**After Phase 2 (Auth + Database)**:
- [ ] All migrations run without errors
- [ ] JWT login returns valid tokens
- [ ] Role-based access denies unauthorized routes
- [ ] Pytest contract tests pass (auth endpoints)

**After Phase 4 (Real-time + Files)**:
- [ ] Kanban board updates in <2 seconds across browsers
- [ ] Drag-and-drop works on mobile (360px)
- [ ] File upload validates and stores correctly
- [ ] WebSocket reconnects automatically

**After Phase 5 (Financial)**:
- [ ] Expense approval workflow complete (submit → review → approve)
- [ ] Profit/Loss auto-calculates correctly
- [ ] Dashboard charts render without console errors
- [ ] Self-approval prevention works (FR-036)

**After Phase 6 (Deploy)**:
- [ ] Lighthouse score ≥92 (Performance, Accessibility, Best Practices, SEO)
- [ ] Zero console errors (browser + terminal)
- [ ] All Postman tests pass (100% success rate)
- [ ] Docker Compose up → full system running
- [ ] Live URL accessible with test data

---

## Next Steps

1. **Review research findings** with stakeholders
2. **Run `/sp.tasks`** to generate dependency-ordered implementation tasks
3. **Begin Phase 1**: Project scaffolding (UV init, Next.js init, folder structure)
4. **Set up CI/CD**: GitHub Actions for automated testing
5. **Create ERD**: Visual representation of data-model.md entities
6. **Draft README**: Setup instructions based on quickstart.md

---

**Research Completed**: 2025-12-10
**Ready for Implementation**: ✅ All technical decisions finalized
**Constitutional Compliance**: ✅ All gates passed
**Next Command**: `/sp.tasks` to generate implementation tasks
