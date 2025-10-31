from fastapi import APIRouter
from app.features.olmocr.olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.features.olmocr.olmocr_service import run_olmocr_pipeline

router = APIRouter()

@router.post("/olmocr", response_model=OlmocrResponse)
def olmocr_route(request: OlmocrRequest):
    markdown = run_olmocr_pipeline(request)
    return OlmocrResponse(markdown=markdown)
