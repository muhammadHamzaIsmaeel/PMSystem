# Quickstart Guide: Project Management System MVP

**Feature**: 001-project-management-mvp
**Target**: < 30 minutes from clone to running system (SC-017)
**Audience**: Developers unfamiliar with the codebase

## Prerequisites

Before starting, ensure you have:

- **Docker** (version 20.10+): [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (version 2.0+): Usually bundled with Docker Desktop
- **Git**: For cloning the repository
- **Code Editor**: VS Code recommended (with Python and TypeScript extensions)

**Optional** (for local development without Docker):
- **Python 3.11+** with UV package manager
- **Node.js 18+** with pnpm
- **MongoDB Atlas**

## Quick Start (Docker - Recommended)

### 1. Clone Repository

```bash
git clone <repository-url>
cd project
```

### 2. Environment Configuration

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.local.example frontend/.env.local
```

**Edit `backend/.env`**:
```env
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-address>/project_mgmt?retryWrites=true&w=majority
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=project_mgmt

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (adjust for production)
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# HRMSX (mock for MVP)
HRMSX_API_URL=http://localhost:8000/api/v1/hrmsx-mock
HRMSX_API_KEY=mock-api-key
```

**Edit `frontend/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/kanban/ws
```

### 3. Start Services

```bash
# Build and start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

**Services will be available at**:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger UI (API Docs)**: http://localhost:8000/docs
- **MongoDB Atlas** (accessible via connection string)

### 4. Run Database Migrations

In a new terminal:

```bash
# Run Alembic migrations
docker-compose exec backend alembic upgrade head

# (Optional) Load seed data for testing
docker-compose exec backend python -m app.seed
```

**Seed data includes**:
- 5 users (one for each role: Admin, PM, Team Member, Finance, Viewer)
- 3 sample projects
- 10 tasks with various statuses
- Sample expenses and income
- Comments and file attachments

### 5. Access the Application

**Default Credentials** (from seed data):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Project Manager | pm@example.com | pm123 |
| Team Member | team@example.com | team123 |
| Finance | finance@example.com | finance123 |
| Viewer | viewer@example.com | viewer123 |

**First Login**:
1. Navigate to http://localhost:3000
2. Click "Login"
3. Use admin@example.com / admin123
4. Explore dashboard, projects, Kanban board

### 6. Test API (Optional)

```bash
# Import Postman collection
# File: postman_collection.json (in project root)

# Or test manually with curl
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Response includes access_token and refresh_token
```

### 7. Stop Services

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clears database)
docker-compose down -v
```

---

## Local Development (Without Docker)

### 1. Backend Setup

```bash
cd backend

# Install UV package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# Setup MongoDB Atlas
createdb project_mgmt

# Configure .env with local database URL
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-address>/project_mgmt?retryWrites=true&w=majority

# Run migrations
alembic upgrade head

# (Optional) Load seed data
python -m app.seed

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend available at**: http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend

# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Configure .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/kanban/ws

# Start frontend dev server
pnpm dev
```

**Frontend available at**: http://localhost:3000

---

## Testing

### Backend Tests

```bash
# Inside backend container or local venv
docker-compose exec backend pytest

# With coverage
docker-compose exec backend pytest --cov=app --cov-report=html

# Run specific test file
docker-compose exec backend pytest tests/contract/test_auth.py

# Run with verbose output
docker-compose exec backend pytest -v
```

### Frontend Tests

```bash
# Inside frontend container or local
docker-compose exec frontend pnpm test

# Run E2E tests (if implemented)
docker-compose exec frontend pnpm test:e2e
```

### API Testing (Postman)

1. Import `postman_collection.json`
2. Set environment variable `base_url` = `http://localhost:8000`
3. Run collection (all tests should pass)
4. Check test results for green checkmarks

---

## Production Deployment

### Docker Build for Production

```bash
# Build production images
docker build -f Dockerfile.backend -t project-mgmt-backend:latest ./backend
docker build -f Dockerfile.frontend -t project-mgmt-frontend:latest ./frontend

# Run production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Railway Deployment

1. **Create Railway Project**:
   ```bash
   railway init
   railway link
   ```

2. **Add MongoDB Atlas**:
   ```bash
   railway add --plugin mongodb
   ```

3. **Configure Environment Variables**:
   - In Railway dashboard, add all variables from `.env.example`
   - Set `DATABASE_URL` to Railway MongoDB Atlas Connection String
   - Generate strong `SECRET_KEY`

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Run Migrations**:
   ```bash
   railway run alembic upgrade head
   ```

### Render Deployment

1. Create Web Service for backend (Docker)
2. Create Web Service for frontend (Docker)
3. Ensure MongoDB Atlas database is provisioned
4. Link services and configure environment variables
5. Deploy via Render dashboard

### Health Checks

**Backend Health Endpoint**: `GET /health`

```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

Monitor this endpoint for production health checks.

---

## Common Issues & Troubleshooting

### Issue: Database connection refused

**Solution**:
```bash
# Check MongoDB Atlas connection
docker-compose ps

# Check database logs
docker-compose logs db

# Ensure DATABASE_URL matches service name in docker-compose.yml
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-address>/project_mgmt?retryWrites=true&w=majority
```

### Issue: Frontend can't reach backend API

**Solution**:
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS settings in `backend/.env` (BACKEND_CORS_ORIGINS)

### Issue: File uploads failing

**Solution**:
```bash
# Ensure uploads directory exists and has permissions
docker-compose exec backend mkdir -p /app/uploads
docker-compose exec backend chmod 755 /app/uploads
```

### Issue: WebSocket connection failing (Kanban real-time)

**Solution**:
- Check `NEXT_PUBLIC_WS_URL` is `ws://` not `http://`
- Verify backend WebSocket endpoint: `ws://localhost:8000/api/v1/kanban/ws`
- Check browser console for connection errors

### Issue: Alembic migration conflicts

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d db
docker-compose exec backend alembic upgrade head
```

### Issue: Port already in use (3000 or 8000)

**Solution**:
```bash
# Find process using port (Linux/Mac)
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

---

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Edit files in `backend/app/`
   - FastAPI auto-reloads on file changes
   - Check logs: `docker-compose logs -f backend`

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Next.js hot-reloads automatically
   - Check logs: `docker-compose logs -f frontend`

3. **Database Schema Changes**:
   ```bash
   # Generate migration
   docker-compose exec backend alembic revision --autogenerate -m "description"

   # Review migration in backend/alembic/versions/

   # Apply migration
   docker-compose exec backend alembic upgrade head
   ```

### Code Quality Checks

```bash
# Backend linting
docker-compose exec backend flake8 app/
docker-compose exec backend mypy app/

# Frontend linting
docker-compose exec frontend pnpm lint

# Format code
docker-compose exec backend black app/
docker-compose exec frontend pnpm format
```

### Commit Guidelines

Follow conventional commits:
```
feat(auth): add JWT refresh token endpoint
fix(kanban): resolve drag-drop race condition
docs(readme): update deployment instructions
test(expenses): add approval workflow tests
```

---

## Next Steps

After successful setup:

1. **Explore API Documentation**: http://localhost:8000/docs
2. **Test RBAC**: Login with different roles and verify access controls
3. **Test Kanban Real-time**: Open Kanban board in two browsers, drag task in one, see update in other
4. **Test File Upload**: Upload expense receipt, verify file appears in `backend/uploads/`
5. **Check Lighthouse Score**: Run Lighthouse on frontend (Target: ≥92)
6. **Review Code**: Start with `backend/app/main.py` and `frontend/src/app/page.tsx`

---

## Additional Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Postman Collection**: `postman_collection.json`
- **ERD Diagram**: `ERD.png` or `ERD.drawio`
- **Data Model Spec**: `specs/001-project-management-mvp/data-model.md`
- **Implementation Plan**: `specs/001-project-management-mvp/plan.md`

---

## Support

For issues or questions:
1. Check this Quickstart Guide troubleshooting section
2. Review API documentation at `/docs`
3. Check application logs: `docker-compose logs`
4. Refer to implementation plan for architecture details

**Estimated Setup Time**: 15-25 minutes (meets SC-017: <30 minutes requirement)
