import os
import base64
import tempfile
import subprocess
import json
import uuid
from fastapi import HTTPException
from app.core.security import get_jwt
from .olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.core.config import settings
from app.core.logger import logger
from app.core.credit_manager import CreditManagerService

MODEL_NAME = "allenai/olmOCR-2-7B-1025"
ALLOWED_FILE_TYPES = [".pdf"]
MAX_FILE_SIZE_MB = 20

def run_olmocr_pipeline(request: OlmocrRequest) -> str:
    # Get user JWT
    jwt = get_jwt(request)
    
    # Check if user has sufficient credits
    credit_manager = CreditManagerService()
    if not credit_manager.has_sufficient_credits(task="olmocr", jwt=jwt):
        logger.warning("Insufficient credits to continue for olmocr task.")
        raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")
    
    # Run olmocr pipeline with temporary file
    with tempfile.TemporaryDirectory() as tmpdir:
        # Save the uploaded file to a temporary location with a unique suffix
        name, ext = os.path.splitext(request.file_name)
        unique_suffix = uuid.uuid4().hex[:8]
        unique_file_name = f"{name}_{unique_suffix}{ext}"
        temp_file_path = os.path.join(tmpdir, unique_file_name)
        with open(temp_file_path, "wb") as f:
            f.write(base64.b64decode(request.file_data))
            
        logger.info(f"Saved temporary file at: {temp_file_path}")
        
        # Check for allowed file types
        if not any(request.file_name.lower().endswith(ext) for ext in ALLOWED_FILE_TYPES):
            logger.warning(f"Unsupported file type: {request.file_name}")
            raise HTTPException(status_code=400, detail="Unsupported file type.")
        
        # Max file size check (e.g., 20MB)
        if os.path.getsize(temp_file_path) > MAX_FILE_SIZE_MB * 1024 * 1024:
            logger.warning(f"File size exceeds limit: {request.file_name}")
            raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 20MB.")
        
        # Use DeepInfra config from settings
        deeinfra_api_key = getattr(settings, "DEEPINFRA_API_KEY", None)
        cmd = [
            "python", "-m", "olmocr.pipeline", tmpdir,
            "--server", "https://api.deepinfra.com/v1/openai",
            "--api_key", deeinfra_api_key,
            "--model", MODEL_NAME,
            "--markdown",
            "--pdfs", temp_file_path
        ]
        
        # Run the olmOCR command
        try:
            subprocess.run(cmd, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"olmOCR command failed: {e.stderr.decode()}")
            raise HTTPException(status_code=500, detail=f"olmOCR failed: {e.stderr.decode()}")
        
        # Read .jsonl files
        results_dir = os.path.join(tmpdir, "results")
        jsonl_files = [f for f in os.listdir(results_dir) if f.endswith(".jsonl")]
        if not jsonl_files:
            logger.error("No results jsonl output found.")
            raise HTTPException(status_code=500, detail=f"Not able to OCR the file.{request.file_name}")
        
        # Read markdown text and token counts from results .jsonl file
        jsonl_path = os.path.join(results_dir, jsonl_files[0])
        markdown = None
        total_input_tokens = None
        total_output_tokens = None
        with open(jsonl_path, "r") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    if "text" in obj:
                        # Retrieve markdown text
                        markdown = obj["text"]

                        # Retrieve token counts
                        meta = obj.get("metadata", {})
                        total_input_tokens = meta.get("total-input-tokens", 0)
                        total_output_tokens = meta.get("total-output-tokens", 0)
                        break
                except Exception:
                    continue

        # Check if markdown was found
        if markdown is None:
            logger.error(f"No markdown text found in results jsonl for {request.file_name}")
            raise HTTPException(status_code=500, detail=f"Not able to OCR the file.{request.file_name}")
        
        # Track token usage
        logger.info(f"olmOCR Token Usage for {request.file_name} - Input Tokens: {total_input_tokens}, Output Tokens: {total_output_tokens}")   

        # Post token usage to external API using CreditManagerService
        credit_manager.post_credit_usage(
            task="olmocr", 
            request=[
                {
                    "serviceType": "AIModelExecutionTime",
                    "consumedUnit": total_input_tokens or 0,
                    "refType": request.ref_type,
                    "refId": request.ref_id,
                    "refName": request.ref_name
                },
                {
                    "serviceType": "AIModelExecutionTime",
                    "consumedUnit": total_output_tokens or 0,
                    "refType": request.ref_type,
                    "refId": request.ref_id,
                    "refName": request.ref_name
                }
            ],
            jwt=jwt
        )
        
        # Finally, return the response
        return OlmocrResponse(markdown=markdown)
