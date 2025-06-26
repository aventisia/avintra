namespace AspNetToolkit.Endpoints;

/// <summary>
/// Provides route endpoints for interacting with the Ollama API.
/// </summary>
public static class OllamaApiRoutes
{
    /// <summary>
    /// The endpoint for generating text using a model.
    /// </summary>
    public const string Generate = "generate";

    /// <summary>
    /// The endpoint for retrieving currently loaded models.
    /// </summary>
    public const string GetLoadedModels = "ps";
}
