---
id: 0026
title: Fix TypeError on project creation
stage: red
date: 2025-12-15
surface: agent
model: gemini
feature: none
branch: main
user: unknown
command: acha ab ek or error arha hai jab ma new project create kar raha hu to sab sa phala alert ma ya Unexpected token 'T', "Traceback "... is not valid JSON likha arha hua. or backend ka terminal ma ya error arha hai """INFO:     Application startup complete.
INFO:     127.0.0.1:62320 - "POST /api/v1/projects HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\uvicorn\protocols\http\httptools_impl.py", line 426, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 84, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1106, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\applications.py", line 122, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 184, in __call__
    raise exc
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 162, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 146, in simple_response
    await self.app(scope, receive, send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 79, in __call__
    raise exc
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 68, in __call__
    await self.app(scope, receive, sender)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 20, in __call__
    raise e
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 17, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\routing.py", line 718, in __call__
    await route.handle(scope, receive, send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\routing.py", line 276, in handle
    await self.app(scope, receive, send)
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\starlette\routing.py", line 66, in app
    response = await func(request)
               ^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\fastapi\routing.py", line 274, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\ADVANCES--PC\Desktop\STDG\project_gemini\backend\.venv\Lib\site-packages\fastapi\routing.py", line 191, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "F:\hamza\SSS\project_gemini\backend\app\api\v1\projects.py", line 55, in create_project 
    return await ProjectService.create_project(db, project_data, current_user["id"])
                                                                 ~~~~~~~~~~~~^^^^^^
TypeError: 'User' object is not subscriptable
"""
labels: [bug,backend,TypeError]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
- backend/app/api/v1/projects.py
tests:
- none
