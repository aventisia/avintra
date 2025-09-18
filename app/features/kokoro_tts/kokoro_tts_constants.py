# Audio-related constants for Kokoro TTS

# Sample rate expected by Kokoro TTS model
OUTPUT_SAMPLE_RATE = 24000

# Maps supported audio formats to their correct MIME types
AUDIO_FORMATS = {
    "wav": "audio/wav",         # PCM, lossless, standard
    "mp3": "audio/mpeg",        # compressed, widely supported
    "flac": "audio/flac",       # compressed, lossless
    "ogg": "audio/ogg",         # container (usually with Vorbis or Opus codec)
    "vorbis": "audio/vorbis",   # explicitly Vorbis codec
    "opus": "audio/opus",       # better modern codec than Vorbis
    "amb": "audio/amb",         # Amiga IFF / SVX8 / SV16
    "aiff": "audio/x-aiff",     # AIFF (Apple)
    "aifc": "audio/x-aiff",     # AIFF-C (compressed AIFF)
    "au": "audio/basic",        # Sun/NeXT AU
    "raw": "audio/raw",         # raw headerless PCM
    "nist": "audio/nist",       # NIST SPHERE
    "ircam": "audio/ircam",     # Berkeley/IRCAM/CARL
    "voc": "audio/voc",         # Creative Labs VOC
    "w64": "audio/w64",         # Sony Wave64
    "mat": "audio/matlab",      # MATLAB files
    "pvf": "audio/pvf",         # Portable Voice Format
    "htk": "audio/htk",         # HTK speech recognizer format
    "caf": "audio/x-caf",       # Core Audio Format (Apple)
    "sd2": "audio/x-sd2",       # Sound Designer II (old ProTools)
}
