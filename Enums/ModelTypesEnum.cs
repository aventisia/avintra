namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the model library types list. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum ModelTypesEnum
{
    /// <summary>
    /// Represents a model used for extracting specific data or information from text.
    /// </summary>
    Extraction,

    /// <summary>
    /// Represents a model used to generate summaries from longer pieces of text.
    /// </summary>
    Summarization,

    /// <summary>
    /// Represents a model used to classify text into predefined categories.
    /// </summary>
    Classification,

    /// <summary>
    /// Represents a model used for analyzing sentiment (positive, negative, neutral) in text.
    /// </summary>
    SentimentAnalytics,

    /// <summary>
    /// Represents a model that can answer questions based on provided context or knowledge base.
    /// </summary>
    QuestionAnswer,

    /// <summary>
    /// Represents an AI persona model designed to simulate human-like interaction or behavior.
    /// </summary>
    AIPersona
}