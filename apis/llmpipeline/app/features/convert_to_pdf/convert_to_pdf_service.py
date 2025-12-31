
import os
from pathlib import Path
from fastapi import HTTPException
import pypandoc
from PIL import Image
from app.core.logger import logger

SUPPORTED_DOC_FORMATS = ['.docx', '.rtf', '.odt']
SUPPORTED_IMG_FORMATS = ['.tif', '.tiff']

def convert_to_pdf(file_path: str) -> dict:
	"""
	Convert supported file types to PDF and delete the original file.
	Returns a dict with file details for the new PDF file.
	"""
	file_obj = Path(file_path)
	if not file_obj.exists() or not file_obj.is_file():
		logger.error(f"File not found: {file_path}")
		raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
	ext = file_obj.suffix.lower()
	pdf_path = str(file_obj.with_suffix('.pdf'))
	temp_utf8_path = None
	try:
		if ext in SUPPORTED_DOC_FORMATS:
			output = pypandoc.convert_file(file_path, 'pdf', outputfile=pdf_path)
			if output != "":
				logger.warning(f"pypandoc output: {output}")
			if not os.path.exists(pdf_path):
				raise Exception("PDF not created.")
		elif ext in SUPPORTED_IMG_FORMATS:
			image = Image.open(file_path)
			image.save(pdf_path, "PDF", resolution=100.0)
		else:
			raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
		os.remove(file_path)
		logger.info(f"Deleted original file: {file_path}")
		pdf_file = Path(pdf_path)
		return {
			"name": pdf_file.name[:255],
			"extension": pdf_file.suffix,
			"size": pdf_file.stat().st_size if pdf_file.exists() else 0,
			"path": str(pdf_file)
		}
	except HTTPException:
		raise
	except Exception as e:
		logger.error(f"Error converting file to PDF: {e}")
		raise HTTPException(status_code=500, detail="Error converting file to PDF.")
	finally:
		if temp_utf8_path:
			try:
				os.unlink(temp_utf8_path)
			except Exception:
				pass
