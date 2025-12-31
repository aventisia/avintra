from pydantic import BaseModel
from typing import Optional, List


# Request schema for Kokoro TTS
class KokoroTTSRequest(BaseModel):
    """
    Schema for a Kokoro Text-to-Speech (TTS) request.

    Attributes:
        text (str): The text to be converted to speech.
        voice (Optional[str]): The voice to use for speech synthesis. Defaults to 'af_heart' (Heart, female, USA accent).
        lang_code (Optional[str]): The language code for speech synthesis. Defaults to 'a' (American English).
        speed (Optional[float]): The speed of speech. Range: 0.5 (slower) to 2.0 (faster). Defaults to 1.0.
        output_format (Optional[str]): Desired audio output format (e.g., 'mp3', 'wav'). Defaults to 'mp3'.
        return_base64 (Optional[bool]): Whether to return audio as base64-encoded string. Defaults to False.
        use_gpu (Optional[bool]): Whether to use GPU for speech synthesis. Defaults to False.
    """
    text: str 
    voice: str
    lang_code: str
    speed: Optional[float] = 1.0
    output_format: Optional[str] = 'mp3'
    return_base64: Optional[bool] = False
    use_gpu: Optional[bool] = False

# --------------------------------------------------------------------------

class KokoroTTSVoice(BaseModel):
    voice_code: str
    name: str
    gender: str

class KokoroTTSLanguage(BaseModel):
    language: str
    lang_code: str
    voices: List[KokoroTTSVoice]

# Response schema for Kokoro TTS metadata
class KokoroTTSMetadataResponse(BaseModel):
    """
    Schema for the response containing available kokoro tts metadata (languages and their voices).
    """
    languages: List[KokoroTTSLanguage]
