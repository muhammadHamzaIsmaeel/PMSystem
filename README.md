# Project Management System MVP

A full-stack project management system with role-based access control, real-time Kanban board, financial tracking, and HRMSX integration readiness.

## Features

- **Secure Authentication & RBAC**: JWT-based authentication with 5 distinct roles (Admin, Project Manager, Team Member, Finance, Viewer)
- **Project & Task Management**: Complete project lifecycle management with tasks, subtasks, and progress tracking
- **Real-Time Kanban Board**: Drag-and-drop task management with WebSocket synchronization
- **Financial Tracking**: Expenses, income, and automatic profit/loss calculation
- **Time Tracking**: Log time entries against tasks with labor cost estimation
- **Dashboard & Reporting**: Visual charts and summary cards with role-based filtering
- **Notifications**: In-app notifications for task assignments, deadlines, and expense approvals
- **File Attachments**: Upload and manage project/task documents and receipts
- **Comments**: Collaborative commenting on projects and tasks
- **HRMSX Integration Ready**: User synchronization and timesheet export capabilities

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Validation**: Pydantic 2.x
- **Authentication**: JWT (python-jose, bcrypt)
- **Package Manager**: UV

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Components**: ShadCN UI
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Real-Time**: Socket.IO Client

### Infrastructure
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Deployment**: Railway / Render / Fly.io

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)
- pnpm (for frontend)
- uv (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project_gemini
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   Services will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - PostgreSQL: localhost:5432

4. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Seed initial data** (optional)
   ```bash
   docker-compose exec backend python -m app.seed
   ```

### Local Development (Without Docker)

#### Backend Setup
```bash
cd backend

# Install dependencies with UV
uv sync

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Project Structure

```
project_gemini/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints (v1 routes)
│   │   ├── core/              # Core utilities (config, security, deps)
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic layer
│   │   ├── websockets/        # WebSocket handlers
│   │   └── main.py            # FastAPI application entry
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Backend tests
│   ├── uploads/               # File upload storage (gitignored)
│   ├── pyproject.toml         # Python dependencies & config
│   ├── Dockerfile             # Backend Docker image
│   └── .env.example           # Environment variable template
│
├── frontend/                   # Next.js 15 frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   ├── package.json           # Node dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   ├── Dockerfile             # Frontend Docker image
│   └── .env.local.example     # Environment variable template
│
├── specs/                      # Feature specifications & planning
│   └── 001-project-management-mvp/
│       ├── spec.md            # Feature specification
│       ├── plan.md            # Implementation plan
│       ├── tasks.md           # Task breakdown (254 tasks)
│       ├── data-model.md      # Database schema design
│       └── contracts/         # API contracts
│
├── history/                    # Prompt History Records (PHRs)
│   └── prompts/
│
├── docker-compose.yml          # Docker Compose configuration
├── .gitignore                 # Git ignore patterns
└── README.md                  # This file
```

## Available Scripts

### Backend
```bash
# Linting & formatting
black app/ tests/              # Format code
flake8 app/ tests/             # Lint code
mypy app/                      # Type checking

# Database
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head            # Apply migrations
alembic downgrade -1            # Rollback one migration

# Testing
pytest                          # Run all tests
pytest -v --cov=app tests/      # Run with coverage
```

### Frontend
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose exec backend sh    # Access backend container
docker-compose exec postgres psql -U postgres -d project_management  # Access database
```

## Environment Variables

### Backend (.env)
See `backend/.env.example` for complete list. Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (use `openssl rand -hex 32`)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT access token expiry (default: 15)
- `CORS_ORIGINS`: Allowed frontend origins

### Frontend (.env.local)
See `frontend/.env.local.example` for complete list. Key variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time features

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full access to all resources. Can create/edit/delete projects, tasks, users. Can approve all expenses. |
| **Project Manager** | Manage assigned projects and their tasks. Can create tasks, assign team members, approve project expenses. |
| **Team Member** | View assigned tasks. Update task status and progress. Log time entries. Submit expenses. |
| **Finance** | View all financial data. Approve/reject expense submissions. View profit/loss reports. |
| **Viewer** | Read-only access to all projects, tasks, and financial data. Cannot create, edit, or delete anything. |

## API Documentation

Once the backend is running, access interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Development Workflow

1. Feature specifications are created in `specs/<feature-name>/spec.md`
2. Implementation plans are generated in `specs/<feature-name>/plan.md`
3. Task breakdown is created in `specs/<feature-name>/tasks.md`
4. Development follows phase-based execution (Setup → Foundation → User Stories → Polish)
5. All work is tracked via Prompt History Records in `history/prompts/`

## Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

### Frontend Testing
```bash
cd frontend
pnpm test
```

## Deployment

### Production Build

1. **Build Docker images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to cloud platform**
   - Railway: Connect repository and configure services
   - Render: Create web services from Dockerfiles
   - Fly.io: Use `flyctl launch` for deployment

### Environment Configuration

Ensure production environment variables are set:
- Use strong `SECRET_KEY` (minimum 32 characters)
- Set `DEBUG=false`
- Configure SMTP for email notifications (optional)
- Set up cloud storage for file uploads (optional)
- Configure HRMSX API credentials when ready

## Roadmap

### Phase 1: Setup ✅ (Current)
- Project structure and dependencies
- Docker configuration
- Linting and code quality tools

### Phase 2: Foundation (Next)
- Database models and migrations
- Authentication & JWT utilities
- API structure and core endpoints
- Frontend auth flow and API client

### Phase 3-7: User Stories
- US1: Secure Role-Based Access (P1)
- US2: Project-to-Task Workflow (P2)
- US3: Real-Time Kanban Board (P3)
- US4: Dashboard & Reporting (P4)
- US5: Notification System (P5)

### Phase 8: Comments & Files
- File upload and management
- Commenting system

### Phase 9: Polish & Deployment
- Code quality and linting
- Performance optimization
- Documentation
- Production deployment

## Contributing

1. Follow the existing code structure and naming conventions
2. Ensure all linting and type checking passes before committing
3. Write tests for new features
4. Update documentation as needed
5. Use meaningful commit messages (Conventional Commits format)

## License

[Add license information]

## Support

For questions or issues, please refer to:
- Specification: `specs/001-project-management-mvp/spec.md`
- Implementation Plan: `specs/001-project-management-mvp/plan.md`
- Task List: `specs/001-project-management-mvp/tasks.md`
