from pydantic import BaseModel
from typing import Optional, List

# --------------------------------------------------------------------------
# Request schema for ElevenLabs TTS
# --------------------------------------------------------------------------

class ElevenLabsTTSRequest(BaseModel):
    """
    Schema for an ElevenLabs Text-to-Speech (TTS) request.

    Attributes:
        text (str): The text to be converted to speech.
        voice_id (str): The voice id to use for speech synthesis (e.g., '21m00Tcm4TlvDq8ikWAM' Rachel).
        model_id (str): The model id (e.g., 'eleven_multilingual_v2').
        output_format (str): Audio format ('mp3_22050_32', 'pcm_8000', etc.). Default is 'mp3_22050_32'.
        return_base64 (bool): If True, returns audio as base64 string. Default is False.
    """
    text: str
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    model_id: Optional[str] = "eleven_multilingual_v2" 
    output_format: Optional[str] = 'mp3_22050_32'
    return_base64: Optional[bool] = False

# --------------------------------------------------------------------------
# Metadata response schema for ElevenLabs TTS
# --------------------------------------------------------------------------

class ElevenLabsTTSVoice(BaseModel):
    voice_id: str
    name: str
    gender: str

class ElevenLabsTTSLanguage(BaseModel):
    language: str
    lang_code: str
    voices: List[ElevenLabsTTSVoice]

class ElevenLabsTTSMetadataResponse(BaseModel):
    """
    Schema for the response containing ElevenLabs TTS metadata (languages and their voices).
    """
    languages: List[ElevenLabsTTSLanguage]
