# Audio-related constants for ElevenLabs TTS

# Sample rate expected by ElevenLabs TTS model
OUTPUT_SAMPLE_RATE = 24000

# Maps ElevenLabs output formats to their correct MIME types
AUDIO_FORMATS = {
    "mp3_22050_32": "audio/mpeg",
    "mp3_44100_32": "audio/mpeg",
    "mp3_44100_64": "audio/mpeg",
    "mp3_44100_96": "audio/mpeg",
    "mp3_44100_128": "audio/mpeg",
    "mp3_44100_192": "audio/mpeg",

    "pcm_8000": "audio/wav",
    "pcm_16000": "audio/wav",
    "pcm_22050": "audio/wav",
    "pcm_24000": "audio/wav",
    "pcm_44100": "audio/wav",
    "pcm_48000": "audio/wav",

    "ulaw_8000": "audio/basic",
    "alaw_8000": "audio/basic",
}
