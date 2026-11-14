"""Provider voice catalogs for the LiteLLM feature.

Only ElevenLabs exposes a voice catalog API. OpenAI, Azure and Gemini voices are
provider-defined constants, so the catalog is keyed by provider and capability
while the selected model decides the supported languages.
"""
from __future__ import annotations

from .schemas import LanguageInfo, VoiceCapability, VoiceInfo

# IMPORTANT NOTE: keep in sync with the executable voice providers in
# `voice_agent/realtime_adapters.py`, `VoiceAgentGraphHelpers` in WorkspaceAPIs,
# and `EXECUTABLE_REALTIME_PROVIDERS` in Studio.
PROVIDERS_BY_CAPABILITY: dict[VoiceCapability, tuple[str, ...]] = {
    "tts": ("openai", "azure", "elevenlabs", "gemini"),
    "realtime": ("openai", "azure", "gemini"),
}

_OPENAI_VOICES: tuple[tuple[str, str], ...] = (
    ("alloy", "Alloy"),
    ("ash", "Ash"),
    ("ballad", "Ballad"),
    ("coral", "Coral"),
    ("echo", "Echo"),
    ("fable", "Fable"),
    ("onyx", "Onyx"),
    ("nova", "Nova"),
    ("sage", "Sage"),
    ("shimmer", "Shimmer"),
    ("verse", "Verse"),
    ("marin", "Marin"),
    ("cedar", "Cedar"),
)

# IMPORTANT NOTE: the Realtime API does not accept the Fable, Onyx, or Nova
# voices that the TTS endpoint supports.
_OPENAI_REALTIME_VOICES: tuple[tuple[str, str], ...] = tuple(
    entry for entry in _OPENAI_VOICES if entry[0] not in {"fable", "onyx", "nova"}
)

_ELEVENLABS_VOICES: tuple[tuple[str, str], ...] = (
    ("21m00Tcm4TlvDq8ikWAM", "Rachel"),
    ("29vD33N1CtxCmqQRPOHJ", "Drew"),
    ("2EiwWnXFnvU5JabPnv8n", "Clyde"),
    ("5Q0t7uMcjvnagumLfvZi", "Paul"),
    ("AZnzlk1XvdvUeBnXmlld", "Domi"),
    ("D38z5RcWu1voky8WS1ja", "Fin"),
    ("EXAVITQu4vr4xnSDxMaL", "Sarah"),
    ("ErXwobaYiN019PkySvjV", "Antoni"),
    ("GBv7mTt0atIp3Br8iCZE", "Thomas"),
    ("IKne3meq5aSn9XLyUdCD", "Charlie"),
    ("JBFqnCBsd6RMkjVDRZzb", "George"),
    ("LcfcDJNUP1GQjkvn1xUw", "Emily"),
    ("MF3mGyEYCl7XYWbV9V6O", "Elli"),
    ("N2lVS1w4EtoT3dr4eOWO", "Callum"),
    ("ODq5zmih8GrVes37Dizd", "Patrick"),
    ("SOYHLrjzK2X1ezoPC6cr", "Harry"),
    ("TX3LPaxmHKxFdv7VOQHJ", "Liam"),
    ("ThT5KcBeYPX3keUQqHPh", "Dorothy"),
    ("TxGEqnHWrfWFTfGW9XjX", "Josh"),
    ("VR6AewLTigWG4xSOukaG", "Arnold"),
    ("XB0fDUnXU5powFXDhCwa", "Charlotte"),
    ("XrExE9yKIg1WjnnRuSqN", "Matilda"),
    ("Yko7PKHZNXotIFUBG7I9", "Matthew"),
    ("ZQe5CZNOzWyzPSCn5a3c", "James"),
    ("bVMeCyTHy58xNoL34h3p", "Jeremy"),
    ("flq6f7yk4E4fJM5XTYuZ", "Michael"),
    ("g5CIjZEefAph4nQFvHAz", "Ethan"),
    ("jBpfuIE2acCO8z3wKNLl", "Gigi"),
    ("jsCqWAovK2zIkigp7HKq", "Freya"),
    ("oWAxZDx7w5VEj9dCyTzz", "Grace"),
    ("onwK4e9ZLuTAKqWW03F9", "Daniel"),
    ("pMsXgVXv3BLzUgSXRplE", "Serena"),
    ("pNInz6obpgDQGcFmaJgB", "Adam"),
    ("piTKgcLEGmPE4e6mEKli", "Nicole"),
    ("t0jbNlBVZ17f02VDIeMI", "Jessie"),
    ("wViXBPUzp2ZZixB1xQuM", "Ryan"),
    ("yoZ06aMxZJJ28mfd3POQ", "Sam"),
    ("z9fAnlkpzviPz146aGWa", "Glinda"),
    ("zrHiDhphv9ZnVPUqCQEp", "Mimi"),
)

_GEMINI_VOICES: tuple[tuple[str, str], ...] = (
    ("Zephyr", "Zephyr"),
    ("Puck", "Puck"),
    ("Charon", "Charon"),
    ("Kore", "Kore"),
    ("Fenrir", "Fenrir"),
    ("Leda", "Leda"),
    ("Orus", "Orus"),
    ("Aoede", "Aoede"),
    ("Callirrhoe", "Callirrhoe"),
    ("Autonoe", "Autonoe"),
    ("Enceladus", "Enceladus"),
    ("Iapetus", "Iapetus"),
    ("Umbriel", "Umbriel"),
    ("Algieba", "Algieba"),
    ("Despina", "Despina"),
    ("Erinome", "Erinome"),
    ("Algenib", "Algenib"),
    ("Rasalgethi", "Rasalgethi"),
    ("Laomedeia", "Laomedeia"),
    ("Achernar", "Achernar"),
    ("Alnilam", "Alnilam"),
    ("Schedar", "Schedar"),
    ("Gacrux", "Gacrux"),
    ("Pulcherrima", "Pulcherrima"),
    ("Achird", "Achird"),
    ("Zubenelgenubi", "Zubenelgenubi"),
    ("Vindemiatrix", "Vindemiatrix"),
    ("Sadachbia", "Sadachbia"),
    ("Sadaltager", "Sadaltager"),
    ("Sulafat", "Sulafat"),
)

_OPENAI_TTS_LANGUAGES: tuple[tuple[str, str], ...] = (
    ("af", "Afrikaans"),
    ("ar", "Arabic"),
    ("hy", "Armenian"),
    ("az", "Azerbaijani"),
    ("be", "Belarusian"),
    ("bs", "Bosnian"),
    ("bg", "Bulgarian"),
    ("ca", "Catalan"),
    ("zh", "Chinese"),
    ("hr", "Croatian"),
    ("cs", "Czech"),
    ("da", "Danish"),
    ("nl", "Dutch"),
    ("en", "English"),
    ("et", "Estonian"),
    ("fi", "Finnish"),
    ("fr", "French"),
    ("gl", "Galician"),
    ("de", "German"),
    ("el", "Greek"),
    ("he", "Hebrew"),
    ("hi", "Hindi"),
    ("hu", "Hungarian"),
    ("is", "Icelandic"),
    ("id", "Indonesian"),
    ("it", "Italian"),
    ("ja", "Japanese"),
    ("kn", "Kannada"),
    ("kk", "Kazakh"),
    ("ko", "Korean"),
    ("lv", "Latvian"),
    ("lt", "Lithuanian"),
    ("mk", "Macedonian"),
    ("ms", "Malay"),
    ("mr", "Marathi"),
    ("mi", "Maori"),
    ("ne", "Nepali"),
    ("no", "Norwegian"),
    ("fa", "Persian"),
    ("pl", "Polish"),
    ("pt", "Portuguese"),
    ("ro", "Romanian"),
    ("ru", "Russian"),
    ("sr", "Serbian"),
    ("sk", "Slovak"),
    ("sl", "Slovenian"),
    ("es", "Spanish"),
    ("sw", "Swahili"),
    ("sv", "Swedish"),
    ("tl", "Tagalog"),
    ("ta", "Tamil"),
    ("th", "Thai"),
    ("tr", "Turkish"),
    ("uk", "Ukrainian"),
    ("ur", "Urdu"),
    ("vi", "Vietnamese"),
    ("cy", "Welsh"),
)

_ELEVENLABS_LANGUAGES: tuple[tuple[str, str], ...] = (
    ("ar", "Arabic"),
    ("bg", "Bulgarian"),
    ("hr", "Croatian"),
    ("cs", "Czech"),
    ("da", "Danish"),
    ("nl", "Dutch"),
    ("en", "English"),
    ("fil", "Filipino"),
    ("fi", "Finnish"),
    ("fr", "French"),
    ("de", "German"),
    ("el", "Greek"),
    ("hi", "Hindi"),
    ("hu", "Hungarian"),
    ("id", "Indonesian"),
    ("it", "Italian"),
    ("ja", "Japanese"),
    ("ko", "Korean"),
    ("ms", "Malay"),
    ("zh", "Mandarin Chinese"),
    ("pl", "Polish"),
    ("pt", "Portuguese"),
    ("ro", "Romanian"),
    ("ru", "Russian"),
    ("sk", "Slovak"),
    ("es", "Spanish"),
    ("sv", "Swedish"),
    ("ta", "Tamil"),
    ("tr", "Turkish"),
    ("uk", "Ukrainian"),
)

_ELEVENLABS_V3_LANGUAGES: tuple[tuple[str, str], ...] = (
    ("af", "Afrikaans"),
    ("ar", "Arabic"),
    ("hy", "Armenian"),
    ("as", "Assamese"),
    ("az", "Azerbaijani"),
    ("be", "Belarusian"),
    ("bn", "Bengali"),
    ("bs", "Bosnian"),
    ("bg", "Bulgarian"),
    ("ca", "Catalan"),
    ("ceb", "Cebuano"),
    ("ny", "Chichewa"),
    ("hr", "Croatian"),
    ("cs", "Czech"),
    ("da", "Danish"),
    ("nl", "Dutch"),
    ("en", "English"),
    ("eo", "Esperanto"),
    ("et", "Estonian"),
    ("fil", "Filipino"),
    ("fi", "Finnish"),
    ("fr", "French"),
    ("gl", "Galician"),
    ("ka", "Georgian"),
    ("de", "German"),
    ("el", "Greek"),
    ("gu", "Gujarati"),
    ("ht", "Haitian Creole"),
    ("ha", "Hausa"),
    ("he", "Hebrew"),
    ("hi", "Hindi"),
    ("hu", "Hungarian"),
    ("is", "Icelandic"),
    ("ig", "Igbo"),
    ("id", "Indonesian"),
    ("ga", "Irish"),
    ("it", "Italian"),
    ("ja", "Japanese"),
    ("jv", "Javanese"),
    ("kn", "Kannada"),
    ("kk", "Kazakh"),
    ("ky", "Kirghiz"),
    ("ko", "Korean"),
    ("lv", "Latvian"),
    ("ln", "Lingala"),
    ("lt", "Lithuanian"),
    ("lb", "Luxembourgish"),
    ("mk", "Macedonian"),
    ("ms", "Malay"),
    ("ml", "Malayalam"),
    ("zh", "Mandarin Chinese"),
    ("mr", "Marathi"),
    ("ne", "Nepali"),
    ("no", "Norwegian"),
    ("ps", "Pashto"),
    ("fa", "Persian"),
    ("pl", "Polish"),
    ("pt", "Portuguese"),
    ("pa", "Punjabi"),
    ("ro", "Romanian"),
    ("ru", "Russian"),
    ("sr", "Serbian"),
    ("sd", "Sindhi"),
    ("sk", "Slovak"),
    ("sl", "Slovenian"),
    ("so", "Somali"),
    ("es", "Spanish"),
    ("sw", "Swahili"),
    ("sv", "Swedish"),
    ("ta", "Tamil"),
    ("te", "Telugu"),
    ("th", "Thai"),
    ("tr", "Turkish"),
    ("uk", "Ukrainian"),
    ("ur", "Urdu"),
    ("vi", "Vietnamese"),
    ("cy", "Welsh"),
    ("zu", "Zulu"),
)

_GEMINI_LANGUAGES: tuple[tuple[str, str], ...] = (
    ("ar", "Arabic"),
    ("bn", "Bengali"),
    ("zh", "Chinese (Mandarin)"),
    ("nl", "Dutch"),
    ("en", "English"),
    ("fr", "French"),
    ("de", "German"),
    ("el", "Greek"),
    ("gu", "Gujarati"),
    ("hi", "Hindi"),
    ("id", "Indonesian"),
    ("it", "Italian"),
    ("ja", "Japanese"),
    ("kn", "Kannada"),
    ("ko", "Korean"),
    ("ml", "Malayalam"),
    ("mr", "Marathi"),
    ("pl", "Polish"),
    ("pt", "Portuguese"),
    ("pa", "Punjabi"),
    ("ru", "Russian"),
    ("es", "Spanish"),
    ("sw", "Swahili"),
    ("ta", "Tamil"),
    ("te", "Telugu"),
    ("th", "Thai"),
    ("tr", "Turkish"),
    ("uk", "Ukrainian"),
    ("vi", "Vietnamese"),
    ("ur", "Urdu"),
)

_ENGLISH_ONLY: tuple[tuple[str, str], ...] = (("en", "English"),)


def _voices(entries: tuple[tuple[str, str], ...]) -> list[VoiceInfo]:
    return [VoiceInfo(id=voice_id, name=name) for voice_id, name in entries]


def _languages(entries: tuple[tuple[str, str], ...]) -> list[LanguageInfo]:
    return [LanguageInfo(id=code, name=name) for code, name in entries]


def static_voices(provider: str, capability: VoiceCapability) -> list[VoiceInfo]:
    """Return the provider's known voices without an external call."""

    if provider in {"openai", "azure"}:
        return _voices(
            _OPENAI_REALTIME_VOICES if capability == "realtime" else _OPENAI_VOICES
        )
    if provider == "elevenlabs":
        return _voices(_ELEVENLABS_VOICES)
    if provider == "gemini":
        # IMPORTANT NOTE: Studio stores Gemini voice names lowercase and the
        # runtime capitalizes them for the TTS and Live APIs.
        return [
            VoiceInfo(id=voice_id.lower(), name=name) for voice_id, name in _GEMINI_VOICES
        ]
    return []


def static_languages(
    provider: str,
    model: str,
    capability: VoiceCapability,
) -> list[LanguageInfo]:
    """Return the languages the provider/model supports without an external call."""

    if provider in {"openai", "azure"}:
        return _languages(
            _OPENAI_TTS_LANGUAGES if capability == "tts" else _ENGLISH_ONLY
        )
    if provider == "gemini":
        return _languages(_GEMINI_LANGUAGES)
    if provider == "elevenlabs":
        # IMPORTANT NOTE: ElevenLabs exposes per-model languages from its API;
        # this fallback covers the models the platform ships when the call fails.
        model_id = model.split("/")[-1].lower()
        if model_id == "eleven_v3":
            return _languages(_ELEVENLABS_V3_LANGUAGES)
        english_only = model_id.startswith("eleven_english") or model_id in {
            "eleven_turbo_v2",
            "eleven_flash_v2",
        }
        return _languages(_ENGLISH_ONLY if english_only else _ELEVENLABS_LANGUAGES)
    return []
