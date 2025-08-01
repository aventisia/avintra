namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a language that is available for Text-to-Speech or Speech-to-Text, including its name, code, and voices.
/// </summary>
public class AvailableLanguageDto
{
    /// <summary>
    /// Gets or sets the name of the language.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the code for the language (e.g., "en" for English).
    /// </summary>
    public required string Code { get; set; }

    /// <summary>
    /// Gets or sets the list of voices available for the language.
    /// </summary>
    public List<AvailableVoiceDto>? Voices { get; set; }
}

/// <summary>
/// Represents a voice that is available for a language, including the voice name and gender.
/// </summary>
public class AvailableVoiceDto
{
    /// <summary>
    /// Gets or sets the name of the voice.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the gender of the voice (e.g., "M" for male, "F" for female).
    /// </summary>
    public required string Gender { get; set; }
}

/// <summary>
/// Represents a Text-to-Speech (TTS) option, including details about the service,
/// the language it supports, and the available voices for that language.
/// </summary>
public class TextToSpeechOptionDto
{
    /// <summary>
    /// Gets or sets the name of the Text-to-Speech service or option (e.g., "Google TTS").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the Text-to-Speech option, detailing its capabilities 
    /// and features (e.g., "English for Text-to-Speech").
    /// </summary>
    public required string Description { get; set; }

    /// <summary>
    /// Gets or sets the name of the language supported by the Text-to-Speech option 
    /// (e.g., "English", "Spanish").
    /// </summary>
    public required string LanguageName { get; set; }

    /// <summary>
    /// Gets or sets the code for the language (e.g., "en" for English, "es" for Spanish).
    /// </summary>
    public string? LanguageCode { get; set; }

    /// <summary>
    /// Gets or sets the list of voices available for the specified language in the Text-to-Speech service.
    /// Each voice includes a name and other optional properties, such as gender.
    /// </summary>
    public List<AvailableVoiceDto>? Voices { get; set; }
}

/// <summary>
/// Represents a Speech-to-Text (STT) option, including details about the service,
/// the language it supports, and the service's capabilities.
/// </summary>
public class SpeechToTextOptionDto
{
    /// <summary>
    /// Gets or sets the name of the Speech-to-Text service (e.g., "Google Speech-to-Text").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the Speech-to-Text option, detailing its capabilities 
    /// and the technology it uses for converting speech to text (e.g., "Real-time transcription with high accuracy").
    /// </summary>
    public required string Description { get; set; }

    /// <summary>
    /// Gets or sets the name of the language supported by the Speech-to-Text option 
    /// (e.g., "English", "Spanish").
    /// </summary>
    public required string LanguageName { get; set; }

    /// <summary>
    /// Gets or sets the code for the language (e.g., "en" for English, "es" for Spanish).
    /// </summary>
    public string? LanguageCode { get; set; }
}