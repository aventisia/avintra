namespace AspNetToolkit.Services;

/// <summary>
/// Service interface for extracting structured data using Large Language Models (LLMs).
/// </summary>
public interface ILLMDataExtractionService
{
    /// <summary>
    /// Extracts data from a document by first retrieving its textual content and then sending it to an LLM
    /// along with a user-provided prompt for processing (e.g., summarization, Q&A, extraction).
    /// </summary>
    /// <param name="prompt">The instruction or query to guide the LLM’s response.</param>
    /// <param name="llmModel">The identifier for the LLM model to use.</param>
    /// <param name="fileUrl">The URL of the file (e.g., PDF) to process.</param>
    /// <returns>A service response containing the extracted or generated result from the LLM.</returns>
    Task<ServiceResponse<string>> ExtractDataAsync(string prompt, string llmModel, string fileUrl);
}
