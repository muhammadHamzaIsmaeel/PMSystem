"""
FastAPI application entry point.
Main application with CORS, middleware, exception handlers, and route registration.
"""

from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
    bad_request_exception_handler,
    forbidden_exception_handler,
    not_found_exception_handler,
    unauthorized_exception_handler,
    ConflictException,
    conflict_exception_handler,
)
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Connects to MongoDB on startup and closes connection on shutdown.
    """
    # Startup
    print("🚀 Starting up...")
    await connect_to_mongo()
    print("✅ MongoDB connected successfully")

    yield

    # Shutdown
    print("🛑 Shutting down...")
    await close_mongo_connection()
    print("✅ MongoDB disconnected successfully")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Register exception handlers
app.add_exception_handler(NotFoundException, not_found_exception_handler)
app.add_exception_handler(UnauthorizedException, unauthorized_exception_handler)
app.add_exception_handler(ForbiddenException, forbidden_exception_handler)
app.add_exception_handler(BadRequestException, bad_request_exception_handler)
app.add_exception_handler(ConflictException, conflict_exception_handler)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    Returns the application status and version.
    """
    return HealthResponse(status="healthy", version=settings.APP_VERSION)


@app.get("/", tags=["Root"])
async def root() -> JSONResponse:
    """
    Root endpoint.
    Returns basic API information.
    """
    return JSONResponse(
        content={
            "message": "Project Management System API",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
        }
    )


# Register API v1 router
from app.api.v1 import api_router

app.include_router(api_router, prefix="/api/v1")


# Register WebSocket endpoint for Kanban real-time updates
from app.websockets.kanban import websocket_endpoint


@app.websocket("/api/v1/kanban/ws")
async def kanban_websocket(
    websocket: WebSocket,
    project_id: str = Query(...),
    token: str = Query(...)
):
    """
    WebSocket endpoint for Kanban board real-time updates

    Query Parameters:
        project_id: Project room to join
        token: JWT authentication token
    """
    await websocket_endpoint(websocket, project_id, token)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
