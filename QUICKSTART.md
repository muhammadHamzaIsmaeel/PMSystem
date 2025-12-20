# 🚀 Quick Start Guide - Project Gemini

## Sabse Pehle (One-Time Setup)

### 1. PostgreSQL Database Setup
```bash
# PostgreSQL terminal kholen aur yeh commands run karen:
CREATE DATABASE project_gemini;
CREATE USER gemini_user WITH PASSWORD 'gemini123';
GRANT ALL PRIVILEGES ON DATABASE project_gemini TO gemini_user;
\q
```

### 2. Backend Setup (Terminal 1)
```bash
cd backend

# Virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Dependencies install
pip install -r requirements.txt

# .env file banao
cp .env.example .env

# .env edit karo:
# DATABASE_URL=postgresql+asyncpg://gemini_user:gemini123@localhost:5432/project_gemini
# SECRET_KEY=$(openssl rand -hex 32)  # Ya Windows PowerShell se generate karo

# Database migrations
alembic upgrade head

# Server start karo
uvicorn app.main:app --reload
```

Backend chal gaya: **http://localhost:8000/docs**

### 3. Frontend Setup (Terminal 2 - Naya terminal)
```bash
cd frontend

# Dependencies install
npm install

# .env file banao
cp .env.local.example .env.local

# Server start karo
npm run dev
```

Frontend chal gaya: **http://localhost:3000**

---

## Har Din (Daily Development)

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Alternative API Docs:** http://localhost:8000/redoc

---

## .env Files - Minimum Required

### backend/.env
```env
DATABASE_URL=postgresql+asyncpg://gemini_user:gemini123@localhost:5432/project_gemini
SECRET_KEY=your-secret-key-here-generate-using-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENV=development
```

---

## Secret Key Generate Kaise Kare?

### Windows PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Mac/Linux Terminal:
```bash
openssl rand -hex 32
```

Output ko copy karke `.env` me `SECRET_KEY=` ke baad paste karo.

---

## Pehla User Banana (First Admin User)

### Option 1: Frontend se (Recommended)
1. http://localhost:3000 kholo
2. "Sign Up" click karo
3. Details bharo:
   - Email: admin@test.com
   - Password: Admin@123
   - Name: Admin User
   - Role: Admin
4. Sign up → Login

### Option 2: API se (cURL)
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123",
    "full_name": "Admin User",
    "role": "Admin"
  }'
```

---

## Testing Checklist ✅

Yeh sab kaam kar rahe hain?

- [ ] Backend: http://localhost:8000/docs khul raha hai
- [ ] Frontend: http://localhost:3000 khul raha hai
- [ ] User signup ho raha hai
- [ ] Login ho raha hai
- [ ] Dashboard load ho raha hai
- [ ] Project create kar sakte hain
- [ ] Task assign kar sakte hain
- [ ] Notification bell me count dikhai de raha hai
- [ ] Kanban board me drag-drop kaam kar raha hai

---

## Common Errors & Quick Fixes

### "Connection refused" - Database
```bash
# PostgreSQL service start karo
# Windows: Services → PostgreSQL → Start
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### "Port already in use"
```bash
# Backend: Different port use karo
uvicorn app.main:app --reload --port 8001

# Frontend: Different port use karo
PORT=3001 npm run dev
```

### "Module not found"
```bash
# Backend:
pip install -r requirements.txt

# Frontend:
npm install
```

### Database tables nahi ban rahe
```bash
cd backend
alembic upgrade head
```

---

## Project Structure

```
project_gemini/
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── models/       # Database models
│   │   ├── api/          # API routes
│   │   ├── services/     # Business logic
│   │   └── schemas/      # Pydantic schemas
│   ├── alembic/          # Database migrations
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment variables
├── frontend/            # Next.js Frontend
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   └── types/       # TypeScript types
│   ├── package.json     # Node dependencies
│   └── .env.local       # Environment variables
└── docker-compose.yml   # Docker setup (optional)
```

---

## Need Detailed Help?

Complete detailed guide ke liye `SETUP.md` file dekho - usme sab kuch detail me hai:
- Step-by-step instructions
- Where to get API keys
- Gmail SMTP setup
- Redis setup
- Common issues solutions
- Development workflow

Chalo testing shuru karte hain! 🎉
