from fastapi import APIRouter, Depends
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from app.features.olmocr.olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.features.olmocr.olmocr_service import run_olmocr_pipeline

router = APIRouter()

@router.post("/olmocr", response_model=OlmocrResponse)
async def olmocr_route(olmocr_req: OlmocrRequest, _user: User = Depends(authorize())):
    return await run_olmocr_pipeline(olmocr_req, _user)
