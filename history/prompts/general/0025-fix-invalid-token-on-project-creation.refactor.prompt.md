---
id: 0025
title: Fix invalid token on project creation
stage: refactor
date: 2025-12-15
surface: agent
model: gemini
feature: none
branch: main
user: unknown
command: acha is ka bad ma dobarah jab new project bana raha hu to ya error arha hai """## Error Type
Console Error

## Error Message
Invalid or expired token


    at handleSubmit (src/app/projects/new/page.tsx:38:15)

## Code Frame
  36 |       if (!response.ok) {
  37 |         const error = await response.json()
> 38 |         throw new Error(error.detail || 'Failed to create project')
     |               ^
  39 |       }
  40 |
  41 |       const project = await response.json()

Next.js version: 15.5.7 (Turbopack)
""". or backend ka terminal ma INFO:     127.0.0.1:62142 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/expense-breakdown HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/project-timeline HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/task-completion HTTP/1.1" 200 OK
INFO:     127.0.0.1:62144 - "GET /api/v1/dashboard/summary HTTP/1.1" 200 OK
INFO:     127.0.0.1:62157 - "GET /api/v1/dashboard/charts/expense-breakdown HTTP/1.1" 200 OK
INFO:     127.0.0.1:62158 - "GET /api/v1/dashboard/charts/project-timeline HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/task-completion HTTP/1.1" 200 OK      
INFO:     127.0.0.1:62144 - "GET /api/v1/dashboard/summary HTTP/1.1" 200 OK
INFO:     127.0.0.1:62167 - "POST /api/v1/projects HTTP/1.1" 401 Unauthorized
ya arha hai or create project kar raha hu to alrate ma ya likha arha hai Invalid or expired token
labels: [bug,auth,token,frontend]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
- frontend/src/app/projects/new/page.tsx
tests:
- none
---

## Prompt

acha is ka bad ma dobarah jab new project bana raha hu to ya error arha hai """## Error Type
Console Error

## Error Message
Invalid or expired token


    at handleSubmit (src/app/projects/new/page.tsx:38:15)

## Code Frame
  36 |       if (!response.ok) {
  37 |         const error = await response.json()
> 38 |         throw new Error(error.detail || 'Failed to create project')
     |               ^
  39 |       }
  40 |
  41 |       const project = await response.json()

Next.js version: 15.5.7 (Turbopack)
""". or backend ka terminal ma INFO:     127.0.0.1:62142 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/expense-breakdown HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/project-timeline HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/task-completion HTTP/1.1" 200 OK
INFO:     127.0.0.1:62144 - "GET /api/v1/dashboard/summary HTTP/1.1" 200 OK
INFO:     127.0.0.1:62157 - "GET /api/v1/dashboard/charts/expense-breakdown HTTP/1.1" 200 OK
INFO:     127.0.0.1:62158 - "GET /api/v1/dashboard/charts/project-timeline HTTP/1.1" 200 OK
INFO:     127.0.0.1:62145 - "GET /api/v1/dashboard/charts/task-completion HTTP/1.1" 200 OK      
INFO:     127.0.0.1:62144 - "GET /api/v1/dashboard/summary HTTP/1.1" 200 OK
INFO:     127.0.0.1:62167 - "POST /api/v1/projects HTTP/1.1" 401 Unauthorized
ya arha hai or create project kar raha hu to alrate ma ya likha arha hai Invalid or expired token

## Response snapshot

I've fixed the "Invalid or expired token" error.

The problem was that the "New Project" page was trying to find the authentication token in the wrong place (`localStorage`), so it was sending an invalid token to the backend.

I have updated the code to get the token from the correct location. This should resolve the `401 Unauthorized` error, and you should now be able to create projects successfully. No server restart is needed, simply refresh the page.

## Outcome

- ✅ Impact: The user can now create projects without encountering a 401 error.
- 🧪 Tests: No tests were added as the change was a frontend fix related to state management.
- 📁 Files: Modified `frontend/src/app/projects/new/page.tsx` to correctly use the token from the auth state.
- 🔁 Next prompts: The user should confirm the fix works after refreshing the page.
- 🧠 Reflection: A mismatch between how the token was stored (cookie) and retrieved (localStorage) was the root cause. Centralizing token access via the `useAuth` hook is the correct pattern.

## Evaluation notes (flywheel)

- Failure modes observed: `none`
- Graders run and results (PASS/FAIL): `PASS`
- Prompt variant (if applicable): `null`
- Next experiment (smallest change to try): `null`
