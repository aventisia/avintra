
namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore;

public class VectorStoreService : IVectorStoreService
{
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly ILogger<VectorStoreService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly string _jwt;

    public VectorStoreService(ICloudConnectorsVaultService cloudConnectorsVaultService, ILogger<VectorStoreService> logger, EnvironmentConfig environmentConfig, IHttpContextAccessor httpContextAccessor)
    {
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _logger = logger;
        _environmentConfig = environmentConfig;
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";
    }

    // Service responsible for orchestrating embedding generation via external LLM providers
    public async Task<EmbeddingResponseDto> GetEmbeddingVectorAsync(JsonElement embeddingConfig)
    {
        var embeddingRequest = new EmbeddingRequestDto();

        if (embeddingConfig.TryGetProperty("credential_id", out var credentialId))
            embeddingRequest.CredentialId = credentialId.GetString();

        if (embeddingConfig.TryGetProperty("is_byok_enabled", out var byok))
            embeddingRequest.IsByokEnabled = byok.ValueKind == JsonValueKind.True;

        if (embeddingConfig.TryGetProperty("provider", out var provider))
            embeddingRequest.Provider = provider.GetString() ?? string.Empty;

        if (embeddingConfig.TryGetProperty("model", out var model))
            embeddingRequest.Model = model.GetString() ?? string.Empty;

        if (embeddingConfig.TryGetProperty("dimensions", out var dimensions) &&
            dimensions.ValueKind == JsonValueKind.Number &&
            dimensions.TryGetInt32(out var dim))
        {
            embeddingRequest.Dimensions = dim;
        }

        if (embeddingConfig.TryGetProperty("encoding_format", out var encoding))
            embeddingRequest.EncodingFormat = encoding.GetString() ?? "float";

        // Call provider
        return await CallLlmProviderEmbeddingAsync(embeddingRequest);
    }

    // Calls LLM provider embeddings endpoint
    private async Task<EmbeddingResponseDto> CallLlmProviderEmbeddingAsync(EmbeddingRequestDto request)
    {
        try
        {
            using var httpClient = new HttpClient();

            httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _jwt);

            var httpContent = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(request),
                Encoding.UTF8,
                "application/json"
            );

            var url = $"{_environmentConfig.LlmPipelineApiBaseUrl}/llm/embeddings";

            var response = await httpClient.PostAsync(url, httpContent);

            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                // Log only failure
                _logger.LogError(
                    "Embedding API call failed. StatusCode: {StatusCode}, Response: {Response}",
                    response.StatusCode,
                    responseString
                );

                throw new HttpRequestException("Embedding API request failed");
            }

            // Deserialize safely
            var result = System.Text.Json.JsonSerializer.Deserialize<EmbeddingResponseDto>(
                responseString,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return result ?? throw new InvalidOperationException("Empty embedding response");
        }
        catch (Exception ex)
        {
            // Log only failure
            _logger.LogError(ex, "Error while calling embedding provider");

            throw;
        }
    }

    // Retrieves vector store connection details from the vault based on provider type.
    public async Task<string?> GetVectorStoreConnectionStringAsync(Guid credentialId, VectorStoreProviderEnum provider)
    {
        try
        {
            var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialId);

            if (vaultCredential == null)
            {
                _logger.LogError("FAILURE: Vault credential not found. Provider: {Provider}, CredentialId: {CredentialId}", provider, credentialId);
                return null;
            }

            if (vaultCredential.Data == null)
            {
                _logger.LogError("FAILURE: Vault credential data is null. Provider: {Provider}, CredentialId: {CredentialId}", provider, credentialId);
                return null;
            }

            switch (provider)
            {
                case VectorStoreProviderEnum.PgVector:
                    {
                        if (!vaultCredential.Data.TryGetValue("ConnectionString", out var connObj))
                        {
                            _logger.LogError("FAILURE: 'ConnectionString' key missing for PgVector. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        if (connObj == null)
                        {
                            _logger.LogError("FAILURE: 'ConnectionString' is null for PgVector. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        var connectionString = connObj.ToString();

                        if (string.IsNullOrWhiteSpace(connectionString))
                        {
                            _logger.LogError("FAILURE: 'ConnectionString' is empty for PgVector. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        _logger.LogInformation("SUCCESS: PgVector connection string retrieved. CredentialId: {CredentialId}", credentialId);
                        return connectionString;
                    }

                case VectorStoreProviderEnum.Qdrant:
                    {
                        if (!vaultCredential.Data.TryGetValue("Url", out var urlObj))
                        {
                            _logger.LogError("FAILURE: 'Url' key missing for Qdrant. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        if (!vaultCredential.Data.TryGetValue("ApiKey", out var apiKeyObj))
                        {
                            _logger.LogError("FAILURE: 'ApiKey' key missing for Qdrant. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        if (urlObj == null)
                        {
                            _logger.LogError("FAILURE: 'Url' is null for Qdrant. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        if (apiKeyObj == null)
                        {
                            _logger.LogError("FAILURE: 'ApiKey' is null for Qdrant. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        var url = urlObj.ToString();
                        var apiKey = apiKeyObj.ToString();

                        if (string.IsNullOrWhiteSpace(url))
                        {
                            _logger.LogError("FAILURE: 'Url' is empty for Qdrant. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        if (string.IsNullOrWhiteSpace(apiKey))
                        {
                            _logger.LogError("FAILURE: 'ApiKey' is empty for Qdrant. CredentialId: {CredentialId}", credentialId);
                            return null;
                        }

                        var formatted = $"Url={url};ApiKey={apiKey}";

                        _logger.LogInformation("SUCCESS: Qdrant configuration retrieved. CredentialId: {CredentialId}", credentialId);
                        return formatted;
                    }

                default:
                    _logger.LogError("FAILURE: Unsupported vector store provider: {Provider}, CredentialId: {CredentialId}", provider, credentialId);
                    return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EXCEPTION: Failed to retrieve vector store config. Provider: {Provider}, CredentialId: {CredentialId}", provider, credentialId);
            return null;
        }
    }
}
