from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from app.features.olmocr.olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.features.olmocr.olmocr_service import run_olmocr_pipeline
from app.core.logger import logger

router = APIRouter()

@router.post("/olmocr", response_model=OlmocrResponse)
async def olmocr_route(olmocr_req: OlmocrRequest, _user: User = Depends(authorize())):
    try:
        return await run_olmocr_pipeline(olmocr_req, _user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in olmOCR processing: {e}")
        raise HTTPException(status_code=500, detail="Error in olmOCR processing.")
