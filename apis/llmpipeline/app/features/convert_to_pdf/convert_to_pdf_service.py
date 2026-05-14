
import os
from pathlib import Path
from fastapi import HTTPException
import pypandoc
from PIL import Image
from app.core.logger import logger
from app.utils.file_converter_utils import file_to_local_path

SUPPORTED_DOC_FORMATS = ['.docx', '.rtf', '.odt']
SUPPORTED_IMG_FORMATS = ['.tif', '.tiff']

def convert_to_pdf(file: str) -> dict:
	"""
	Convert supported file types to PDF.
	Accepts URL, data URI, or local file path.
	Returns a dict with file details for the new PDF file.
	"""
	# Resolve input to a local file path
	local_path, is_temp = file_to_local_path(file)

	file_obj = Path(local_path)
	if not file_obj.exists() or not file_obj.is_file():
		logger.error(f"File not found: {local_path}")
		raise HTTPException(status_code=404, detail=f"File not found: {local_path}")
	ext = file_obj.suffix.lower()
	pdf_path = str(file_obj.with_suffix('.pdf'))
	try:
		if ext in SUPPORTED_DOC_FORMATS:
			output = pypandoc.convert_file(local_path, 'pdf', outputfile=pdf_path)
			if output != "":
				logger.warning(f"pypandoc output: {output}")
			if not os.path.exists(pdf_path):
				raise Exception("PDF not created.")
		elif ext in SUPPORTED_IMG_FORMATS:
			image = Image.open(local_path)
			image.save(pdf_path, "PDF", resolution=100.0)
		else:
			raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
		# Delete the source file (always delete for temp files, also for local originals as before)
		os.remove(local_path)
		logger.info(f"Deleted original file: {local_path}")
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
		# Clean up temp source file if conversion failed and it still exists
		if is_temp and os.path.exists(local_path):
			try:
				os.unlink(local_path)
			except Exception:
				pass
