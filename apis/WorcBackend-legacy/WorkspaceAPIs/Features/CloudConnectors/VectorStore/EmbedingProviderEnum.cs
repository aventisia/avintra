namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore;

public enum EmbedingProviderEnum
{
    /// <summary>
    /// OpenAI embedding models (e.g., text-embedding-3-small, text-embedding-3-large) accessed via OpenAI API.
    /// </summary>
    OpenAI,

    /// <summary>
    /// Google Gemini embedding models accessed via Google Vertex AI API (e.g., textembedding-gecko-001).
    /// </summary>
    GoogleGemini,

    /// <summary>
    /// OpenRouter embedding models (e.g., text-embedding-3-small, text-embedding-3-large) accessed via OpenRouter API.
    /// </summary>
    OpenRouter
}