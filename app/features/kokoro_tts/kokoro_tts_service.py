import io
import json
import os
import torch
import torchaudio
from fastapi.responses import StreamingResponse
from app.core.logger import logger
from kokoro import KPipeline
import datetime

# Constants
OUTPUT_SAMPLE_RATE = 24000  # Sample rate expected by Kokoro TTS model

# Generate Kokoro TTS audio
async def generate_kokoro_tts_audio(request):
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

		# Generate audio segments
		logger.info(f"Generating audio for text: '{request.text[:50]}...' | Voice: '{request.voice}'")
		audio_segments = [
			segment.cpu()
			for _, _, segment in kokoro_pipeline(
				request.text,
				voice=request.voice,
				speed=request.speed,
				split_pattern=r'\n+'
			)
		]
		if not audio_segments:
			logger.error("No audio segments were generated.")
			raise ValueError("No audio segments were generated.")
		
		# Generate the full audio and save to buffer
		full_audio = torch.cat(audio_segments, dim=0).to(compute_device)
		audio_buffer = io.BytesIO()
		torchaudio.save(audio_buffer, full_audio.unsqueeze(0), OUTPUT_SAMPLE_RATE, format=request.output_format)
		audio_buffer.seek(0)
		logger.info("Audio generation completed successfully.")

		# Generate a dynamic filename with timestamp
		timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
		filename = f"tts_{timestamp}.{request.output_format}"
		
		# Return the audio as a streaming response
		return StreamingResponse(
			audio_buffer,
			media_type=f"audio/{request.output_format}",
			headers={"Content-Disposition": f"attachment; filename={filename}"}
		)
	except Exception as e:
		logger.error(f"Audio generation error: {e}")
		return StreamingResponse(
			io.BytesIO(f"An error occurred: {e}".encode('utf-8')),
			media_type="text/plain",
			status_code=500
		)

# Get Kokoro TTS metadata	
def get_kokoro_tts_metadata():
	"""
	Loads and returns the Kokoro TTS metadata (languages and voices) from the local JSON file.
 	For the most up-to-date Kokoro TTS language and voice metadata, see: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
	"""
	metadata_path = os.path.join(os.path.dirname(__file__), "kokoro_tts_metadata.json")
	with open(metadata_path, "r", encoding="utf-8") as f:
		data = json.load(f)
	return {"languages": data}
	
