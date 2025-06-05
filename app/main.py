# main.py
from fastapi import FastAPI
from app.api.Extraction import router as extraction_router

app = FastAPI(root_path="/api")

# Include the PDF extraction router
app.include_router(extraction_router)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}
