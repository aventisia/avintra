# Text-to-Speech capability for the LiteLLM feature.
#
# Coexists with the ElevenLabs `tts_providers` feature but is self-contained:
# it never imports from that feature or its schemas. TTS is exposed
# non-streaming only because LiteLLM's `aspeech` returns the full audio bytes
# (no streaming path is advertised).
