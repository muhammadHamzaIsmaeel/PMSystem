# Backend Code Structure ki Tafseel

Assalam-o-Alaikum! Is file mein `project_gemini` ke backend `app` directory ka poora structure tafseel se explain kiya gaya hai.

## `backend/app` Directory ka Overview

Yeh directory aapke backend application ka dil hai. Ismein alag-alag folders hain jo different cheezon ko handle karte hain. Yeh ek modern, layered architecture follow karta hai.

---

## 1. `main.py` - Application Entry Point

Yeh aapki application ka main entry point hai. Jab aap backend server start karte hain, to sabse pehle yeh file run hoti hai. Is file mein yeh sab kuch define kiya gaya hai:

- **FastAPI App Initialization:** Yahan per FastAPI app banayi jaati hai.
- **CORS Middleware:** Yeh security ke liye frontend URL ko access denay ke liye hai.
- **Database Connection:** `lifespan` function application ke start aur end per database connection manage karta hai.
- **Exception Handlers:** Application-wide errors ko handle karta hai.
- **API Router:** `app.include_router(api_router, prefix="/api/v1")` line `api/v1` directory mein mojood saare API endpoints ko register karti hai.

---

## 2. `api/v1/` - API Endpoints (Routes)

Yeh directory aapke application ke saare API endpoints ko manage karti hai. Har file ek specific feature ke endpoints ko group karti hai.

- **`__init__.py`:** Saare routers ko ek `api_router` mein combine karta hai.
- **`auth.py`:** Authentication (login, register) ke endpoints.
- **`users.py`:** User management ke endpoints.
- **`projects.py`:** Projects ke endpoints.
- **`tasks.py`:** Tasks ke endpoints.
- **`time_entries.py`:** Time tracking ke endpoints.
- **`expenses.py` & `income.py`:** Financial tracking ke endpoints.
- **`dashboard.py`:** Dashboard per data show karne wale endpoints.
- **`kanban.py`:** Kanban board se related endpoints.
- **`notifications.py`:** Notifications ke endpoints.

Endpoint file ka kaam sirf request lena aur `services` layer ko call karke response bhejna hai. Asal logic `services` mein hota hai.

---

## 3. `core/` - Core Logic & Configuration

Yeh directory application ka core logic rakhti hai.

- **`config.py`:** Poori application ki configuration settings (database URL, secret keys) yahan hoti hain. Yeh `.env` file se values load karti hai.
- **`database.py`:** Database connection ka logic.
- **`security.py`:** Security functions (password hashing, JWT creation).
- **`deps.py`:** FastAPI dependencies (e.g., `get_current_user` jo token se user ki details nikalta hai).
- **`exceptions.py`:** Custom error classes (e.g., `NotFoundException`).

---

## 4. `models/` - Database Models

Yeh directory aapke database ke structure (schema) ko define karti hai. Har file ek database collection (SQL mein "table" ki tarah) ko represent karti hai. Yeh files `beanie` (ODM) use karke batati hain ke har database document (row) mein kon si fields hongi aur unki type kya hogi.

- **`user.py`:** `users` collection ka structure.
- **`project.py`:** `projects` collection ka structure.
- **`task.py`:** `tasks` collection ka structure.
- **Aur baaki files...**

---

## 5. `schemas/` - API Data Schemas

Yeh directory API communication ke liye data ki shape define karti hai. In schemas ko request validation aur response formatting ke liye istemal kiya jaata hai.

- **Request Validation:** Check karta hai ke client se anay wala data sahi format mein hai.
- **Response Formatting:** Control karta hai ke client ko response mein kon si fields bhejni hain (e.g., password hash jaisi sensitive information ko chupana).

Har feature ke liye alag-alag schemas ho sakte hain, jaise:
- **`user.py`:** Ismein `UserCreate` (user register karne ke liye), `UserLogin`, aur `UserResponse` (client ko data bhejte waqt) jaisi classes hoti hain.
- **`project.py`:** Ismein `ProjectCreate`, `ProjectUpdate` etc. ho sakte hain.

### `models` vs `schemas` Farq:
-   **`models`:** Database mein data kaisa dikhega.
-   **`schemas`:** API per data kaisa travel karega (request aur response mein).

---

## 6. `services/` - Business Logic

Yeh directory aapke application ka "brain" hai. Yahan per saara business logic likha jaata hai. API endpoint per request anay ke baad, woh yahan mojood kisi function ko call karta hai.

- **`auth_service.py`:** User registration, login, token generation ka logic.
- **`project_service.py`:** Project banane, update karne, delete karne ka logic.
- **`task_service.py`:** Task se mutalliq business logic.

Yeh layer `api` layer se data leti hai, business rules apply karti hai, `models` ke zariye database se interact karti hai, aur result `api` layer ko wapas karti hai.

---

## Baaki Files/Directories

- **`background_tasks.py`:** Ismein woh code hota hai jo background mein chalta hai, jaise periodic data sync ya reminders bhejna.
- **`seed.py`:** Isko istemal karke aap development ke liye database mein sample data (dummy users, projects, etc.) daal sakte hain.
- **`templates/emails/`:** Yahan per email ke HTML templates rakhe jaate hain (jaise welcome email, password reset email).
- **`websockets/`:** Ismein real-time communication (jaise live chat ya notifications) ka code hota hai. `kanban.py` iski ek example hai.

---

## Poore Backend `app` ka Khulasa (Flow of a Request)

1.  Client (Frontend) request bhejta hai.
2.  Request **`main.py`** per aati hai, jo usko sahi **`api/v1/`** ke endpoint per bhejti hai.
3.  **API endpoint** request ko validate karta hai (using **`schemas`**) aur phir **`services`** layer ke function ko call karta hai.
4.  **Service function** saara business logic chalata hai. Yeh **`core`** directory ke helper functions (e.g., password hashing) ko use kar sakta hai.
5.  Logic chalaane ke liye, service function database se data read/write karta hai via **`models`**.
6.  Service function, data tayyar karke API endpoint ko wapas deta hai.
7.  API endpoint, **`schemas`** ka istemal karke response ko format karta hai (e.g., password hash hatata hai) aur client ko wapas bhej deta hai.

Umeed hai isse aapko backend ka poora structure clear ho gaya hoga.
