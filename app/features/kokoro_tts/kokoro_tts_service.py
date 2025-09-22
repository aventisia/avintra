import io
import json
import os
import torch
import torchaudio
from fastapi.responses import StreamingResponse
from app.core.logger import logger
from kokoro import KPipeline
import datetime
import base64
from .kokoro_tts_constants import OUTPUT_SAMPLE_RATE, AUDIO_FORMATS
from .kokoro_tts_utils import clean_text_for_tts

# Synthesize Kokoro TTS audio
async def synthesize(request):
	try:
		# Determine the compute device
		compute_device = torch.device("cuda" if request.use_gpu and torch.cuda.is_available() else "cpu")
		logger.info(f"Using device: {compute_device}")
		
		# Load the Kokoro TTS pipeline
		try:
			kokoro_pipeline = KPipeline(lang_code=request.lang_code)
			logger.info("Kokoro TTS pipeline loaded successfully.")
		except Exception as e:
			logger.error(f"Failed to initialize Kokoro TTS pipeline: {e}")
			raise RuntimeError("TTS pipeline initialization failed.") from e

		# Clean the input text for TTS
		cleaned_text = clean_text_for_tts(request.text)
		logger.info(f"Generating audio for cleaned text: '{cleaned_text}' | Voice: '{request.voice}'")
		audio_segments = [
			segment.cpu()
			for _, _, segment in kokoro_pipeline(
				cleaned_text,
				voice=request.voice,
				speed=request.speed,
				split_pattern=r'\n+'
			)
		]
		if not audio_segments:
			logger.error("No audio segments were generated.")
			raise ValueError("No audio segments were generated.")
		
		# Generate the full audio
		full_audio = torch.cat(audio_segments, dim=0).to(compute_device)

		if request.output_format in AUDIO_FORMATS:
			audio_buffer = io.BytesIO()
			torchaudio.save(audio_buffer, full_audio.unsqueeze(0), OUTPUT_SAMPLE_RATE, format=request.output_format)
			audio_buffer.seek(0)
			logger.info("Audio generation completed successfully.")

			# Return base64 or streaming response
			audio_bytes = audio_buffer.getvalue()
			if request.return_base64 is True:
				audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
				return {
					"media_type": AUDIO_FORMATS[request.output_format],
					"audio_base64": audio_b64
				}
			else:
				# Generate a dynamic filename with timestamp
				timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
				filename = f"tts_{timestamp}.{request.output_format}"

				# Return StreamingResponse with correct media_type
				return StreamingResponse(
					audio_buffer,
					media_type=AUDIO_FORMATS[request.output_format],
					headers={"Content-Disposition": f"attachment; filename={filename}"}
				)
		else:
			logger.error(f"Unsupported output format: {request.output_format}")
			return StreamingResponse(
				io.BytesIO(f"Unsupported output format: {request.output_format}".encode('utf-8')),
				media_type="text/plain",
				status_code=400
			)
	except Exception as e:
		logger.error(f"Audio generation error: {e}")
		return StreamingResponse(
			io.BytesIO(f"An error occurred: {e}".encode('utf-8')),
			media_type="text/plain",
			status_code=500
		)

# Get Kokoro TTS metadata	
def metadata():
	"""
	Loads and returns the Kokoro TTS metadata (languages and voices) from the local JSON file.
 	For the most up-to-date Kokoro TTS language and voice metadata, see: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
	"""
	metadata_path = os.path.join(os.path.dirname(__file__), "kokoro_tts_metadata.json")
	with open(metadata_path, "r", encoding="utf-8") as f:
		data = json.load(f)
	return {"languages": data}
	
