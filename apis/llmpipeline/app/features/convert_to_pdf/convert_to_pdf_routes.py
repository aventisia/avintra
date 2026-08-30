
from fastapi import APIRouter, HTTPException
from .convert_to_pdf_schemas import ConvertToPDFRequest, ConvertToPDFResponse
from .convert_to_pdf_service import convert_to_pdf
from app.core.logger import logger

router = APIRouter()

@router.post("/convert-to-pdf", response_model=ConvertToPDFResponse)
async def convert_to_pdf_route(payload: ConvertToPDFRequest):
	try:
		file_detail = convert_to_pdf(payload.file)
		logger.debug(f"Successfully converted to PDF: {file_detail['path']}")
		return ConvertToPDFResponse(**file_detail)
	except HTTPException as e:
		raise e
	except Exception as e:
		logger.error(f"Unexpected error during PDF conversion: {e}")
		raise HTTPException(status_code=500, detail="Unexpected error during PDF conversion.")
