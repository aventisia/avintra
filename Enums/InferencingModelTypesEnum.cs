namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the different types of inferencing models available. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT: Any modifications to this file should be manually synchronized with the corresponding front-end enum.
/// </remarks>
public enum InferencingModelTypesEnum
{
    /// <summary>
    /// A model designed to extract specific data or information from a given text.
    /// </summary>
    Extraction,

    /// <summary>
    /// A model intended for generating summaries from longer textual content.
    /// </summary>
    Summarization,

    /// <summary>
    /// A model that categorizes text into predefined groups or categories.
    /// </summary>
    Classification,

    /// <summary>
    /// A model used for performing sentiment analysis (positive, negative, or neutral) on text.
    /// </summary>
    SentimentAnalysis,

    /// <summary>
    /// A model that provides answers to questions based on the provided context or knowledge base.
    /// </summary>
    QuestionAnswer,
}
