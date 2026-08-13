# Speech-to-Text capability for the LiteLLM feature.
#
# Coexists with the ElevenLabs `stt_providers` feature but is self-contained:
# it never imports from that feature or its schemas. STT is exposed
# non-streaming only because LiteLLM's `atranscription` returns a full
# transcript (no streaming path is advertised).
