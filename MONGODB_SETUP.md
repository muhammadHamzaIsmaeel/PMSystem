# MongoDB Setup Guide - Project Gemini
# MongoDB سیٹ اپ گائیڈ

Complete guide to set up and run Project Gemini with MongoDB.

---

## ✅ What Changed - MongoDB Conversion

Pura project ab MongoDB use karta hai! Yeh changes huye hain:

### Backend Changes:
- ✅ **SQLAlchemy → Beanie ODM** (MongoDB async driver)
- ✅ **PostgreSQL → MongoDB**  
- ✅ **Alembic migrations → Removed** (MongoDB doesn't need migrations)
- ✅ All models converted (User, Project, Task, Expense, Income, TimeEntry, Notification)
- ✅ Database connection updated
- ✅ Main.py updated with MongoDB lifecycle

### What You Need to Do:
1. Install MongoDB
2. Install Python dependencies  
3. Create .env file
4. Start MongoDB
5. Run backend
6. Test!

---

## Step 1: MongoDB Installation

### Windows (Recommended Method):

**Download MongoDB Community Server:**
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Download aur install karo
4. Installation ke time **"Install MongoDB as a Service"** select karo
5. **"Install MongoDB Compass"** bhi select karo (GUI tool)

**After Installation:**
- MongoDB Service automatically start hogi
- Default port: 27017
- Connection URL: `mongodb://localhost:27017`

**Verify Installation:**
```bash
# CMD ya PowerShell mein:
mongosh --version
```

Output aisa dikhna chahiye: `2.x.x` ya higher

### Mac (Homebrew):

```bash
# MongoDB install
brew tap mongodb/brew
brew install mongodb-community

# Service start karo
brew services start mongodb-community

# Verify
mongosh --version
```

### Linux (Ubuntu):

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update packages
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --version
```

---

## Step 2: Verify MongoDB is Running

### Windows:
```bash
# Services check karo
# Win + R → services.msc → "MongoDB" dhundo → Status "Running" hona chahiye
```

Ya:
```bash
# PowerShell mein
Get-Service -Name MongoDB
```

### Mac/Linux:
```bash
# Service status check karo
brew services list | grep mongodb  # Mac
sudo systemctl status mongod       # Linux
```

### Test Connection:
```bash
# MongoDB shell open karo
mongosh

# MongoDB shell mein yeh command run karo:
show dbs

# Exit karne ke liye:
exit
```

---

## Step 3: Backend Setup

### 1. Backend Directory mein jao:
```bash
cd backend
```

### 2. Virtual Environment banao:

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

Virtual environment activate hone par `(venv)` terminal prompt mein dikhega.

### 3. Dependencies Install karo:
```bash
pip install -r requirements.txt
```

Yeh install hoga:
- ✅ Beanie (MongoDB ODM)
- ✅ Motor (Async MongoDB driver)
- ✅ FastAPI
- ✅ Pydantic
- ✅ And other dependencies

Wait karo 2-3 minutes.

### 4. .env File banao:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 5. .env File Edit karo:

`.env` file ko Notepad/VS Code mein kholo aur check karo:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=project_gemini

# Secret Key (change this!)
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:3000
```

**IMPORTANT: Secret Key Generate karo:**

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -hex 32
```

Output copy karke `SECRET_KEY=` ke baad paste karo.

### 6. Backend Start karo:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
🚀 Starting up...
✅ Connected to MongoDB: project_gemini
✅ MongoDB connected successfully
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend Ready:** http://localhost:8000/docs

---

## Step 4: Frontend Setup (Same as Before)

Naya terminal kholo:

```bash
cd frontend

# Dependencies install
npm install

# .env file banao
copy .env.local.example .env.local  # Windows
cp .env.local.example .env.local    # Mac/Linux

# Frontend start karo
npm run dev
```

✅ **Frontend Ready:** http://localhost:3000

---

## Step 5: Testing

### 1. MongoDB Compass mein Database Check karo:

1. MongoDB Compass kholo
2. Connection string: `mongodb://localhost:27017`
3. "Connect" click karo
4. Left sidebar mein `project_gemini` database dikhna chahiye

### 2. Create First User:

**Option A: Frontend se (Easy)**
1. http://localhost:3000 kholo
2. "Sign Up" click karo
3. Details bharo:
   - Email: admin@test.com
   - Password: Admin@123
   - Name: Admin User
   - Role: Admin
4. Sign up karo

MongoDB Compass mein `users` collection check karo - user create ho gaya hoga!

**Option B: API se (Using Swagger)**
1. http://localhost:8000/docs kholo
2. POST `/api/v1/auth/register` expand karo
3. "Try it out" click karo
4. Request body:
```json
{
  "email": "admin@test.com",
  "password": "Admin@123",
  "full_name": "Admin User",
  "role": "Admin"
}
```
5. "Execute" click karo

### 3. Test Features:

Login karke yeh test karo:
- ✅ Dashboard load hota hai
- ✅ Project create hota hai
- ✅ Task assign karne par notification aata hai
- ✅ Kanban board kaam kar raha hai
- ✅ Expense submit/approve kar sakte hain

---

## MongoDB Advantages ✨

PostgreSQL se MongoDB kyun better hai is project ke liye:

1. **No Migrations Needed** 🚀
   - Schema changes karo, models update karo, done!
   - Alembic migrations nahi chahiye

2. **Flexible Schema** 📝
   - Fields easily add/remove kar sakte ho
   - Testing mein fast iterations

3. **JSON-like Documents** 📦
   - Frontend ko JSON data chahiye - MongoDB directly JSON store karta hai
   - No ORM overhead

4. **Easier Development** 💡
   - Beanie syntax simple hai
   - Less boilerplate code

5. **Horizontal Scaling** 📈
   - Future mein easily scale kar sakte ho
   - Sharding support built-in

---

## MongoDB Data Structure

Yeh collections ban jayenge:

```
project_gemini (database)
├── users                # User documents
├── projects             # Project documents
├── tasks                # Task documents
├── expenses             # Expense documents
├── income               # Income documents
├── time_entries         # Time tracking
└── notifications        # In-app notifications
```

Har document ka apna `_id` (ObjectId) hoga automatically.

---

## Common MongoDB Commands

### MongoDB Shell (mongosh):

```bash
# MongoDB shell open karo
mongosh

# Database switch/create
use project_gemini

# Collections list
show collections

# Users dekho
db.users.find().pretty()

# User count
db.users.countDocuments()

# Specific user dhundo
db.users.findOne({email: "admin@test.com"})

# All tasks dekho
db.tasks.find().pretty()

# Collection delete (CAUTION!)
db.users.deleteMany({})

# Database drop (CAUTION!)
db.dropDatabase()

# Exit
exit
```

### Python shell se MongoDB access:

```bash
# Backend directory mein
python

# Python shell mein:
>>> from motor.motor_asyncio import AsyncIOMotorClient
>>> client = AsyncIOMotorClient("mongodb://localhost:27017")
>>> db = client.project_gemini
>>> import asyncio
>>> asyncio.run(db.users.count_documents({}))
```

---

## Troubleshooting

### Error: "MongoNetworkError: connect ECONNREFUSED"

**Problem:** MongoDB service nahi chal rahi

**Solution:**
```bash
# Windows: Services → MongoDB → Start
# Mac: brew services start mongodb-community  
# Linux: sudo systemctl start mongod
```

### Error: "ServerSelectionTimeoutError"

**Problem:** MongoDB connection nahi ho raha

**Solution:**
1. Check MongoDB service running hai:
   - Windows: `Get-Service -Name MongoDB`
   - Mac/Linux: `brew services list` / `systemctl status mongod`
2. Check .env file mein `MONGODB_URL=mongodb://localhost:27017` sahi hai
3. Firewall check karo - port 27017 open hona chahiye

### Error: "Collection already exists"

**Problem:** Pehle se data hai

**Solution:**
```bash
# mongosh mein jaake collection drop karo:
mongosh
use project_gemini
db.users.drop()
exit
```

### Error: "ModuleNotFoundError: No module named 'beanie'"

**Problem:** Dependencies install nahi huye

**Solution:**
```bash
pip install -r requirements.txt
```

---

## MongoDB vs PostgreSQL Comparison

| Feature | PostgreSQL (Old) | MongoDB (New) |
|---------|------------------|---------------|
| Type | Relational SQL | NoSQL Document |
| Schema | Fixed (migrations) | Flexible |
| Setup | Complex | Simple |
| Joins | ✅ Native | ❌ Manual (refs) |
| Transactions | ✅ Full ACID | ✅ ACID (4.0+) |
| Scaling | Vertical | Horizontal |
| Learning Curve | Higher | Lower |
| **For This Project** | Overkill | **Perfect** ✅ |

---

## Next Steps

1. ✅ MongoDB install kiya
2. ✅ Backend start kiya
3. ✅ Frontend start kiya
4. ✅ User create kiya
5. ✅ Features test kiye

**Ab testing continue karo aur Phase 7 complete karo!** 🎉

MongoDB Compass mein data dekh sakte ho real-time.

---

## MongoDB Atlas (Cloud Option)

Agar local MongoDB install nahi karna chahte:

1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Free tier account banao
3. Cluster create karo (M0 Free tier)
4. Database user banao
5. IP whitelist karo (0.0.0.0/0 for development)
6. Connection string copy karo
7. `.env` mein update karo:

```env
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net
MONGODB_DB_NAME=project_gemini
```

**Note:** Atlas free tier: 512 MB storage, perfect for testing!

---

Happy Coding with MongoDB! 🚀🍃
