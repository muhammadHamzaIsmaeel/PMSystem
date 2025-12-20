# Project Gemini - Complete Setup Guide
# پروجیکٹ جیمنی - مکمل سیٹ اپ گائیڈ

This guide will help you set up and run the Project Gemini application (Backend + Frontend).

یہ گائیڈ آپ کو Project Gemini application کو setup اور run کرنے میں مدد کرے گی۔

---

## Prerequisites | ضروری چیزیں

Before starting, make sure you have these installed:
شروع کرنے سے پہلے، یہ چیزیں install ہونی چاہیے:

1. **Python 3.11+** - Backend کے لیے
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 18+** - Frontend کے لیے
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

3. **PostgreSQL 14+** - Database کے لیے
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

4. **Git** - Version control
   - Download: https://git-scm.com/downloads
   - Verify: `git --version`

5. **Redis (Optional)** - WebSocket کے لیے
   - Download: https://redis.io/download/
   - For Windows: https://github.com/microsoftarchive/redis/releases

---

## Step 1: Database Setup | ڈیٹا بیس سیٹ اپ

### 1.1 PostgreSQL Install کریں

**Windows:**
1. PostgreSQL installer download کریں
2. Install کریں (password set کریں، یاد رکھیں!)
3. Port 5432 default رہنے دیں

**Mac (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 1.2 Database Create کریں

PostgreSQL terminal open کریں:

**Windows:** Start Menu → PostgreSQL → SQL Shell (psql)

**Mac/Linux:**
```bash
psql postgres
```

Database create کریں:
```sql
CREATE DATABASE project_gemini;
CREATE USER gemini_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE project_gemini TO gemini_user;
\q
```

**Important:** `your_password` کو کوئی strong password سے replace کریں!

---

## Step 2: Backend Setup | بیک اینڈ سیٹ اپ

### 2.1 Virtual Environment بنائیں

Backend directory میں جائیں:
```bash
cd backend
```

Virtual environment create کریں:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Virtual environment activate ہونے پر `(venv)` prompt میں دکھائی دے گا۔

### 2.2 Dependencies Install کریں

```bash
pip install -r requirements.txt
```

### 2.3 Environment Variables Setup

`.env` file بنائیں (`.env.example` کو copy کریں):

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

`.env` file edit کریں اور یہ values set کریں:

```env
# Database URL (اپنا password یہاں ڈالیں)
DATABASE_URL=postgresql+asyncpg://gemini_user:your_password@localhost:5432/project_gemini

# Secret Key (نیا generate کریں)
# Windows PowerShell:
# -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
# Mac/Linux:
# openssl rand -hex 32
SECRET_KEY=your-generated-secret-key-here

# CORS (Frontend URL)
CORS_ORIGINS=http://localhost:3000
```

### 2.4 Secret Key Generate کریں

**Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -hex 32
```

Output copy کریں اور `.env` میں `SECRET_KEY=` کے بعد paste کریں۔

### 2.5 Database Migrations Run کریں

```bash
alembic upgrade head
```

یہ command تمام tables create کر دے گا (users, projects, tasks, notifications, etc.)

### 2.6 Backend Start کریں

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend چل جائے گا: http://localhost:8000

API docs دیکھیں: http://localhost:8000/docs

---

## Step 3: Frontend Setup | فرنٹ اینڈ سیٹ اپ

### 3.1 Frontend Directory میں جائیں

نیا terminal window open کریں:
```bash
cd frontend
```

### 3.2 Dependencies Install کریں

```bash
npm install
```

یہ تمام packages install کر دے گا۔

### 3.3 Environment Variables Setup

`.env.local` file بنائیں:

**Windows:**
```bash
copy .env.local.example .env.local
```

**Mac/Linux:**
```bash
cp .env.local.example .env.local
```

`.env.local` file check کریں (default values ٹھیک ہیں):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENV=development
```

### 3.4 Frontend Start کریں

```bash
npm run dev
```

Frontend چل جائے گا: http://localhost:3000

---

## Step 4: Testing the Application | ایپلیکیشن ٹیسٹ کریں

### 4.1 Check if Everything is Running

1. **Backend:** http://localhost:8000/docs - Swagger UI دکھنا چاہیے
2. **Frontend:** http://localhost:3000 - Login page دکھنا چاہیے

### 4.2 Create First User

دو طریقے ہیں:

**Option 1: Frontend سے (Recommended)**
1. http://localhost:3000 پر جائیں
2. "Sign Up" پر click کریں
3. User details fill کریں:
   - Email: admin@test.com
   - Password: Test@123
   - Name: Admin User
   - Role: Admin
4. Sign up کریں
5. Login کریں

**Option 2: API سے**

POST request بھیجیں `/api/v1/auth/register`:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test@123",
    "full_name": "Admin User",
    "role": "Admin"
  }'
```

### 4.3 Test Core Features

Login کرنے کے بعد test کریں:

1. **Projects:** نیا project بنائیں
2. **Tasks:** Project میں task add کریں، کسی کو assign کریں
3. **Notifications:** Notification bell check کریں (assignment notification آنا چاہیے)
4. **Kanban Board:** Tasks کو drag-drop کریں
5. **Dashboard:** Analytics charts دیکھیں
6. **Expenses:** Expense submit کریں، approve کریں

---

## Optional: Redis Setup (For WebSocket) | ریڈس سیٹ اپ (WebSocket کے لیے)

Redis WebSocket real-time features کے لیے استعمال ہوتا ہے۔

### Windows:
1. Download: https://github.com/microsoftarchive/redis/releases
2. Extract کریں اور `redis-server.exe` run کریں
3. Default port 6379 پر چلے گا

### Mac:
```bash
brew install redis
brew services start redis
```

### Linux:
```bash
sudo apt install redis-server
sudo systemctl start redis
```

Backend `.env` میں add کریں:
```env
REDIS_URL=redis://localhost:6379/0
```

---

## Common Issues & Solutions | عام مسائل اور حل

### Issue 1: Database Connection Error

**Error:** `could not connect to server`

**Solution:**
- PostgreSQL service چل رہی ہے؟ Check کریں
- `.env` میں DATABASE_URL صحیح ہے؟
- Password صحیح ہے؟

**Windows:** Services → PostgreSQL - start کریں
**Mac:** `brew services start postgresql@14`
**Linux:** `sudo systemctl start postgresql`

### Issue 2: Port Already in Use

**Error:** `Address already in use`

**Solution:**
- کوئی اور process port استعمال کر رہی ہے
- Backend: Port 8000 free کریں یا `--port 8001` استعمال کریں
- Frontend: Port 3000 free کریں یا `PORT=3001 npm run dev`

### Issue 3: Module Not Found

**Error:** `ModuleNotFoundError: No module named 'xyz'`

**Solution:**
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### Issue 4: Alembic Migration Fails

**Error:** `Target database is not up to date`

**Solution:**
```bash
# Database reset (CAUTION: Deletes all data!)
alembic downgrade base
alembic upgrade head
```

### Issue 5: CORS Error in Browser

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
Backend `.env` میں check کریں:
```env
CORS_ORIGINS=http://localhost:3000
```

---

## Environment Variables Reference | Environment Variables کی مکمل لسٹ

### Backend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | `postgresql+asyncpg://user:pass@localhost/db` |
| `SECRET_KEY` | JWT signing key | ✅ Yes | `openssl rand -hex 32` output |
| `ALGORITHM` | JWT algorithm | ✅ Yes | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry time | ✅ Yes | `30` |
| `CORS_ORIGINS` | Allowed frontend URLs | ✅ Yes | `http://localhost:3000` |
| `REDIS_URL` | Redis connection (optional) | ❌ No | `redis://localhost:6379/0` |
| `EMAIL_ENABLED` | Enable email notifications | ❌ No | `false` |
| `SMTP_HOST` | SMTP server (if email enabled) | ❌ No | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | ❌ No | `587` |
| `SMTP_USER` | SMTP username | ❌ No | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP app password | ❌ No | See Gmail App Passwords below |

### Frontend (.env.local)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | ✅ Yes | `ws://localhost:8000` |
| `NEXT_PUBLIC_ENV` | Environment name | ❌ No | `development` |

---

## Getting API Keys & Tokens | API Keys کہاں سے ملیں گی

### 1. SECRET_KEY (Backend JWT)

**کیا ہے:** یہ JWT tokens کو sign کرنے کے لیے استعمال ہوتا ہے۔

**کہاں سے ملے گی:** خود generate کریں

**کیسے generate کریں:**

**Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Mac/Linux (Terminal):**
```bash
openssl rand -hex 32
```

**Example Output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

Copy کریں اور `.env` میں paste کریں:
```env
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 2. Database Password

**کیا ہے:** PostgreSQL database کا password

**کہاں سے ملے گی:** جب آپ نے PostgreSQL install کیا تھا تب set کیا تھا

**اگر بھول گئے:**
PostgreSQL reinstall کریں یا password reset کریں۔

### 3. Gmail SMTP Password (Optional - Email Notifications کے لیے)

**کیا ہے:** Email notifications بھیجنے کے لیے Gmail SMTP credentials

**کیسے حاصل کریں:**

1. Google Account میں login کریں
2. https://myaccount.google.com/security پر جائیں
3. "2-Step Verification" enable کریں
4. "App passwords" search کریں: https://myaccount.google.com/apppasswords
5. "Select app" → "Mail" choose کریں
6. "Select device" → "Other" choose کریں، "Project Gemini" لکھیں
7. "Generate" click کریں
8. 16-character password copy کریں (spaces کے ساتھ یا بغیر)

**Example:** `abcd efgh ijkl mnop`

Backend `.env` میں add کریں:
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=noreply@projectgemini.com
SMTP_USE_TLS=true
```

**Note:** Gmail App Password صرف tab کام کرتا ہے جب 2-Step Verification ON ہو۔

### 4. Redis (Optional)

**کیا ہے:** WebSocket real-time features کے لیے in-memory data store

**Password:** Default installation میں password نہیں ہوتا

**URL Format:**
```env
REDIS_URL=redis://localhost:6379/0
```

اگر password set کیا ہے تو:
```env
REDIS_URL=redis://:your-password@localhost:6379/0
```

---

## Quick Start Commands | فوری شروعات کے Commands

### First Time Setup:

```bash
# 1. Database create
psql -U postgres -c "CREATE DATABASE project_gemini;"

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env file with your settings
alembic upgrade head
uvicorn app.main:app --reload

# 3. Frontend setup (new terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Daily Development:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Development Workflow | ڈیولپمنٹ ورک فلو

### Making Database Changes

1. Model modify کریں (e.g., `backend/app/models/task.py`)
2. Migration create کریں:
   ```bash
   alembic revision --autogenerate -m "Add new field to Task"
   ```
3. Migration review کریں: `backend/alembic/versions/` میں
4. Apply کریں:
   ```bash
   alembic upgrade head
   ```

### Adding New API Endpoints

1. Route add کریں: `backend/app/api/v1/your_route.py`
2. Router include کریں: `backend/app/api/v1/__init__.py`
3. Test کریں: http://localhost:8000/docs

### Frontend Pages

1. Page create کریں: `frontend/src/app/your-page/page.tsx`
2. Component create کریں: `frontend/src/components/your-component/`
3. Browser میں دیکھیں: http://localhost:3000/your-page

---

## Testing Checklist | ٹیسٹنگ چیک لسٹ

پہلی بار run کرتے وقت یہ check کریں:

- [ ] Backend server چل رہا ہے (http://localhost:8000/docs)
- [ ] Frontend server چل رہا ہے (http://localhost:3000)
- [ ] Database tables create ہوئے ہیں (`alembic upgrade head` run کیا؟)
- [ ] User signup کام کر رہا ہے
- [ ] Login کام کر رہا ہے
- [ ] Dashboard load ہو رہا ہے
- [ ] Project create ہو رہا ہے
- [ ] Task assignment notification آ رہا ہے
- [ ] Kanban board drag-drop کام کر رہا ہے
- [ ] Expense approval notification آ رہا ہے

---

## Support & Help | مدد اور سپورٹ

اگر کوئی issue آئے تو:

1. Error message screenshot لیں
2. Console logs check کریں (Browser DevTools → Console)
3. Backend terminal logs دیکھیں
4. Common Issues section دیکھیں (اوپر)

**Log Files:**
- Backend: Terminal output دیکھیں
- Frontend: Browser Console (F12 → Console tab)
- Database: PostgreSQL logs

---

## Next Steps | اگلے قدم

Setup complete ہونے کے بعد:

1. ✅ Phase 5, 6, 7 features test کریں
2. ✅ Remaining phases implement کریں (Phase 8: Comments & Files)
3. ✅ Production deployment prepare کریں

Happy Coding! 🚀
