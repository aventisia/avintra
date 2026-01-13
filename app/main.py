# main.py
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.features.extract_file_text.extract_file_text_routes import router as extract_file_text_router
from app.dependencies.auth import authenticate_current_user
from app.models.user import User
from app.features.llm_providers.llm_providers_routes import router as llm_router
from app.features.convert_to_pdf.convert_to_pdf_routes import router as convert_to_pdf_router
from app.features.olmocr.olmocr_routes import router as olmocr_router

# Initialize the FastAPI application
app = FastAPI(root_path="/api")

# Register API routes with tags for automatic documentation
app.include_router(extract_file_text_router, tags=["Extract text from file"])
app.include_router(llm_router, tags=["LLM Providers"])
app.include_router(convert_to_pdf_router, tags=["Convert to PDF"])
app.include_router(olmocr_router, tags=["olmOCR"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow any method (GET, POST, etc.)
    allow_headers=["*"],  # Allow any header
)

# Define the root endpoint of the API
@app.get("/", tags=["General"])
def read_root():
    return {"message": "Welcome to the FastAPI service!"}

@app.get("/validate", tags=["General"])
def validate(user: User = Depends(authenticate_current_user)):
    return {"message": f"Welcome to the FastAPI service, {user.username}!"}