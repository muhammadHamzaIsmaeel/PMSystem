# 🚀 Quick Start - Project Gemini (MongoDB Edition)

## ⚡ Fastest Way to Start

### 1. MongoDB Start karo

**Windows:**
- Services check karo: Win+R → `services.msc` → "MongoDB" → Running hona chahiye
- Ya command: `net start MongoDB`

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Backend Setup (Pehli Baar)

```bash
cd backend

# Virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Dependencies
pip install -r requirements.txt

# .env file
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux

# Edit .env:
# MONGODB_URL=mongodb://localhost:27017
# MONGODB_DB_NAME=project_gemini  
# SECRET_KEY=any-random-string-for-now

# Start server
uvicorn app.main:app --reload
```

Backend ready: **http://localhost:8000/docs** ✅

### 3. Frontend Setup (Pehli Baar)

```bash
cd frontend

# Dependencies
npm install

# .env file
copy .env.local.example .env.local  # Windows
# cp .env.local.example .env.local  # Mac/Linux

# Start server
npm run dev
```

Frontend ready: **http://localhost:3000** ✅

---

## 📝 Daily Development

### Terminal 1 - Backend:
```bash
cd backend
venv\Scripts\activate    # Windows
# source venv/bin/activate    # Mac/Linux
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

---

## 🔑 Environment Variables

### backend/.env (Minimum)
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=project_gemini
SECRET_KEY=dev-secret-key-12345
CORS_ORIGINS=http://localhost:3000
DEBUG=true
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## ✅ Testing Checklist

- [ ] MongoDB service running
- [ ] Backend: http://localhost:8000/docs opens
- [ ] Frontend: http://localhost:3000 opens
- [ ] User signup works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create project
- [ ] Can create task
- [ ] Notifications appear

---

## 🛠️ MongoDB Useful Commands

```bash
# MongoDB shell
mongosh

# Use database
use project_gemini

# See collections
show collections

# See users
db.users.find().pretty()

# Count documents
db.users.countDocuments()
db.tasks.countDocuments()

# Delete all data (CAREFUL!)
db.users.deleteMany({})

# Exit
exit
```

---

## 🆘 Quick Fixes

### MongoDB not connecting?
```bash
# Check service
net start MongoDB                    # Windows
brew services start mongodb-community # Mac
sudo systemctl start mongod          # Linux
```

### Port already in use?
```bash
# Backend on different port
uvicorn app.main:app --reload --port 8001

# Frontend on different port  
PORT=3001 npm run dev
```

### Dependencies error?
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

---

## 📚 Full Documentation

- **Complete Setup:** `MONGODB_SETUP.md`
- **Old Setup (PostgreSQL):** `SETUP.md`

---

Chalo testing shuru karte hain! 🎉
