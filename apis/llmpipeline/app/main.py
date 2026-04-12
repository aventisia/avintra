# main.py
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import dispose_all_db_engines
from app.features.extract_file_text.extract_file_text_routes import router as extract_file_text_router
from app.dependencies.authorize import authorize
from app.features.llm_providers.llm_providers_routes import router as llm_router
from app.features.vector_stores.vector_stores_routes import router as vector_stores_router
from app.features.auth.authenticated_user import User
from app.features.convert_to_pdf.convert_to_pdf_routes import router as convert_to_pdf_router
from app.features.olmocr.olmocr_routes import router as olmocr_router
from app.core.logger import logger

# The lifespan function is used to perform any necessary cleanup when the application shuts down.
# In this case, it ensures that all database engines are properly disposed of to free up resources.
@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await dispose_all_db_engines()


# Initialize the FastAPI application
app = FastAPI(root_path="/api", lifespan=lifespan)

# Register API routes with tags for automatic documentation
app.include_router(extract_file_text_router, tags=["Extract text from file"])
app.include_router(llm_router, tags=["LLM Providers"])
app.include_router(vector_stores_router, tags=["Vector Stores"])
app.include_router(convert_to_pdf_router, tags=["Convert to PDF"])
app.include_router(olmocr_router, tags=["olmOCR"])

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