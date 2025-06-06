from pydantic import BaseModel

class TranscriptionSegment(BaseModel):
    speaker: str    # Identifier for the speaker (e.g. "Speaker 1")
    start: float    # Start time of the segment in seconds (must be ≥ 0)
    end: float    # End time of the segment in seconds (must be > 0)
    text: str   # Transcribed text for the segment
