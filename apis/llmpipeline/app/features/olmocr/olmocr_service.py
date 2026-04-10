import os
import base64
import tempfile
import uuid
import httpx
from .olmocr_renderpdf import render_pdf_to_base64png
from .olmocr_prompts import build_no_anchoring_v4_yaml_prompt
from fastapi import HTTPException
from app.features.auth.authenticated_user import User
from .olmocr_schemas import OlmocrRequest, OlmocrResponse
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.core.credit_manager import CreditManagerService

MODEL_NAME = "allenai/olmOCR-2-7B-1025"
ALLOWED_FILE_TYPES = [".pdf"]
MAX_FILE_SIZE_MB = 20

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