import os
import base64
import tempfile
import subprocess
import json
import uuid
import httpx
from .renderpdf import render_pdf_to_base64png
from .prompts import build_no_anchoring_v4_yaml_prompt
from fastapi import HTTPException
from app.features.auth.authenticated_user import User
from .olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.core.credit_manager import CreditManagerService

MODEL_NAME = "allenai/olmOCR-2-7B-1025"
ALLOWED_FILE_TYPES = [".pdf"]
MAX_FILE_SIZE_MB = 20

# TODO: We can remove this CLI based implementation after testing and verification of the async HTTPX based implementation
def run_olmocr_pipeline_cli(olmocr_req: OlmocrRequest, user: User) -> str:
    # Check if user has sufficient credits
    credit_manager = CreditManagerService()
    if not credit_manager.has_sufficient_credits(task="olmocr", jwt=user.access_token):
        logger.warning("Insufficient credits to continue for olmocr task.")
        raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")
    
    # Run olmocr pipeline with temporary file
    with tempfile.TemporaryDirectory() as tmpdir:
        # Save the uploaded file to a temporary location with a unique suffix
        name, ext = os.path.splitext(olmocr_req.file_name)
        unique_suffix = uuid.uuid4().hex[:8]
        unique_file_name = f"{name}_{unique_suffix}{ext}"
        temp_file_path = os.path.join(tmpdir, unique_file_name)
        with open(temp_file_path, "wb") as f:
            f.write(base64.b64decode(olmocr_req.file_data))
            
        logger.info(f"Saved temporary file at: {temp_file_path}")
        
        # Check for allowed file types
        if not any(olmocr_req.file_name.lower().endswith(ext) for ext in ALLOWED_FILE_TYPES):
            logger.warning(f"Unsupported file type: {olmocr_req.file_name}")
            raise HTTPException(status_code=400, detail="Unsupported file type.")
        
        # Max file size check (e.g., 20MB)
        if os.path.getsize(temp_file_path) > MAX_FILE_SIZE_MB * 1024 * 1024:
            logger.warning(f"File size exceeds limit: {olmocr_req.file_name}")
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
            raise HTTPException(status_code=500, detail=f"Not able to OCR the file.{olmocr_req.file_name}")
        
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
            logger.error(f"No markdown text found in results jsonl for {olmocr_req.file_name}")
            raise HTTPException(status_code=500, detail=f"Not able to OCR the file.{olmocr_req.file_name}")
        
        # Post token usage to external API using CreditManagerService
        credit_manager.post_credit_usage(
            task="olmocr", 
            request=[
                {
                    "ServiceType": "OlmOcrInput",
                    "ConsumedUnit": total_input_tokens or 0,
                    "RefType": olmocr_req.ref_type,
                    "RefId": olmocr_req.ref_id,
                    "RefName": olmocr_req.ref_name
                },
                {
                    "ServiceType": "OlmOcrOutput",
                    "ConsumedUnit": total_output_tokens or 0,
                    "RefType": olmocr_req.ref_type,
                    "RefId": olmocr_req.ref_id,
                    "RefName": olmocr_req.ref_name
                }
            ],
            jwt=user.access_token
        )
        
        # Finally, return the response
        return OlmocrResponse(markdown=markdown)

async def run_olmocr_pipeline(olmocr_req: OlmocrRequest, user: User) -> str:
    # Check if user has sufficient credits
    credit_manager = CreditManagerService()
    if not credit_manager.has_sufficient_credits(task="olmocr", jwt=user.access_token):
        logger.warning("Insufficient credits to continue for olmocr task.")
        raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")
    
    # Run olmocr pipeline with temporary file
    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Save the uploaded file to a temporary location with a unique suffix
        name, ext = os.path.splitext(olmocr_req.file_name)
        unique_suffix = uuid.uuid4().hex[:8]
        unique_file_name = f"{name}_{unique_suffix}{ext}"
        temp_file_path = os.path.join(tmpdir, unique_file_name)
        with open(temp_file_path, "wb") as f:
            f.write(base64.b64decode(olmocr_req.file_data))
        logger.info(f"Saved temporary file at: {temp_file_path}")
        
        # Step 2: Check for allowed file types
        if not any(olmocr_req.file_name.lower().endswith(ext) for ext in ALLOWED_FILE_TYPES):
            logger.warning(f"Unsupported file type: {olmocr_req.file_name}")
            raise HTTPException(status_code=400, detail="Unsupported file type.")
        
        # Step 3: Max file size check (e.g., 20MB)
        if os.path.getsize(temp_file_path) > MAX_FILE_SIZE_MB * 1024 * 1024:
            logger.warning(f"File size exceeds limit: {olmocr_req.file_name}")
            raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 20MB.")
        
        # Step 4: Convert pdf to png 
        # TODO: need to handle multiple pages
        image_base64 = render_pdf_to_base64png(temp_file_path, 1, target_longest_image_dim=1288)

        # Step 5: Build request payload and headers
        request_payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": build_no_anchoring_v4_yaml_prompt()},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}},
                    ],
                }
            ],
            "temperature": 0.1,
            # max_tokens: Has to set this default supported max_tokens value since it is an required input from deepinfra side; 
            # Maximum Context Size (Input + Output) is 16384 tokens for allenai/olmOCR-2-7B-1025 as per deepinfra docs
            # However, above 16000 it throws error from deepinfra side. So setting it to 16000
            "max_tokens": 16000, 
        }
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.DEEPINFRA_API_KEY}"
        }

        # Step 6: Send request to DeepInfra API
        try:
            async with httpx.AsyncClient(timeout=300) as client:
                response = await client.post(
                    settings.DEEPINFRA_API_URL,
                    json=request_payload,
                    headers=request_headers,
                )
                
                # Handle response
                response.raise_for_status()
                response_data = response.json()
                
                # Extract needed fields from response
                markdown = response_data.get("choices", [])[0].get("message", {}).get("content", "")
                usage = response_data.get("usage", {})
                total_input_tokens = usage.get("prompt_tokens", 0)
                total_output_tokens = usage.get("completion_tokens", 0)
                
        except Exception as e:
            log_exception(logger, e, "olmOCR transactional request error")
            raise HTTPException(status_code=500, detail="Error occurred while processing the olmOCR request.")
        
        # Step 7: Check if markdown was found
        if markdown is None:
            logger.error(f"No markdown text found for {olmocr_req.file_name}")
            raise HTTPException(status_code=500, detail=f"Not able to OCR the file.{olmocr_req.file_name}")

        # Step 8: Post token usage to external API using CreditManagerService
        credit_manager.post_credit_usage(
            task="olmocr", 
            request=[
                {
                    "ServiceType": "OlmOcrInput",
                    "ConsumedUnit": total_input_tokens or 0,
                    "RefType": olmocr_req.ref_type,
                    "RefId": olmocr_req.ref_id,
                    "RefName": olmocr_req.ref_name,
                    "Action": olmocr_req.action,
                    "TriggeredByAgent": olmocr_req.agent_name
                },
                {
                    "ServiceType": "OlmOcrOutput",
                    "ConsumedUnit": total_output_tokens or 0,
                    "RefType": olmocr_req.ref_type,
                    "RefId": olmocr_req.ref_id,
                    "RefName": olmocr_req.ref_name,
                    "Action": olmocr_req.action,
                    "TriggeredByAgent": olmocr_req.agent_name
                }
            ],
            jwt=user.access_token
        )
        
        # Step 9: Finally, return the response
        return OlmocrResponse(markdown=markdown)