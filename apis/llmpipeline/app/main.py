# main.py
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from app.core.database import dispose_all_db_engines
from app.features.extract_file_text.extract_file_text_routes import router as extract_file_text_router
from app.dependencies.authorize import authorize
from app.features.llm_providers.llm_providers_routes import router as llm_router
from app.features.litellm.router import router as llm_v2_router
from app.features.langgraph.graphs.langraph_routes import router as langgraph_router
from app.features.vector_stores.vector_stores_routes import router as vector_stores_router
from app.features.auth.authenticated_user import User
from app.features.convert_to_pdf.convert_to_pdf_routes import router as convert_to_pdf_router
from app.features.tts_providers.tts_providers_routes import router as tts_router
from app.features.stt_providers.stt_providers_routes import router as stt_router
from app.features.custom_tools.routes import router as custom_tools_router
from app.features.voice_sessions.router import router as voice_sessions_router
from app.core.logger import logger

@asynccontextmanager
async def lifespan(_: FastAPI):
    voice_worker = None
    stop_voice_worker = None

    try:
        from voice_agent.agent import start_voice_worker, stop_voice_worker

        voice_worker = await start_voice_worker()
    except Exception:
        logger.exception("[voice-agent] failed to start; chat remains available.")

    try:
        yield
    finally:
        if voice_worker is not None and stop_voice_worker is not None:
            try:
                await stop_voice_worker(voice_worker)
            except Exception:
                logger.exception("[voice-agent] failed to stop cleanly.")
        await dispose_all_db_engines()


# Initialize the FastAPI application
app = FastAPI(root_path="/api", lifespan=lifespan)


# Global exception handlers — ensures all errors return plain text
@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return PlainTextResponse(str(exc.detail), status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    messages = "; ".join(e["msg"] for e in exc.errors())
    return PlainTextResponse(messages or "Validation failed", status_code=422)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return PlainTextResponse("Internal server error.", status_code=500)

# Register API routes with tags for automatic documentation
app.include_router(extract_file_text_router, tags=["Extract text from file"])
app.include_router(llm_router, tags=["LLM Providers"])
app.include_router(llm_v2_router)
app.include_router(langgraph_router, tags=["LangGraph"],)
app.include_router(vector_stores_router, tags=["Vector Stores"])
app.include_router(convert_to_pdf_router, tags=["Convert to PDF"])
app.include_router(tts_router, tags=["Text to Speech"])
app.include_router(stt_router, tags=["Speech to Text"])
app.include_router(custom_tools_router, tags=["Custom Tools"])
app.include_router(voice_sessions_router, tags=["Voice Sessions"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow any method (GET, POST, etc.)
    allow_headers=["*"],  # Allow any header
)


@app.middleware("http")
async def log_request_response(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    started_at = time.perf_counter()
    status_code = 500

    try:
        response = await call_next(request)
        status_code = response.status_code
        response.headers["X-Request-Id"] = request_id
        return response
    finally:
        elapsed_ms = (time.perf_counter() - started_at) * 1000
        endpoint = request.scope.get("endpoint")
        endpoint_name = endpoint.__name__ if endpoint else "unknown"
        route = request.scope.get("route")
        route_path = getattr(route, "path", request.url.path)

        logger.info(
            "request_id=%s method=%s path=%s endpoint=%s status_code=%s duration_ms=%.2f",
            request_id,
            request.method,
            route_path,
            endpoint_name,
            status_code,
            elapsed_ms,
        )

# Define the root endpoint of the API
@app.get("/health-check", tags=["General"])
def read_root():
    return {"message": "LLM Pipeline is running!"}

@app.get("/auth-health-check", tags=["General"])
def validate(_user: User = Depends(authorize())):
    return {"message": f"Welcome to the LLM Pipeline, {_user.username}!"}