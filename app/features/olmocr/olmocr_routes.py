from fastapi import APIRouter, Request
from app.features.olmocr.olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.features.olmocr.olmocr_service import run_olmocr_pipeline

router = APIRouter()

@router.post("/olmocr", response_model=OlmocrResponse)
def olmocr_route(request: Request, olmocr_req: OlmocrRequest):
    return run_olmocr_pipeline(olmocr_req, request)
