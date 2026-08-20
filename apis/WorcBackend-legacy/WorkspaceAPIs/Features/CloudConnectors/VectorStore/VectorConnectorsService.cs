using System.Text.Json.Nodes;

namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore.PgVector;

/// <summary>
/// Service for handling vector store operations by calling FastAPI endpoints.
/// Supports Insert, GetMany (query/search), and Delete operations.
/// </summary>
public class VectorConnectorsService : IVectorConnectorsService
{
    private readonly ILogger<VectorConnectorsService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly string? _jwt;

    public VectorConnectorsService(
        ILogger<VectorConnectorsService> logger,
        EnvironmentConfig environmentConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;

        // Set _jwt
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";
    }

    // Main entry point for invoking vector store operations based on the provided action.
    //  Determines which specific method to call (Insert, GetMany, Delete) based on the action enum.
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        if (cloudConnectorReqDto == null)
            throw new ArgumentNullException(nameof(cloudConnectorReqDto));

        // Initialize the service response with default values
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400 // Default to Bad Request in case of failure
        };

        try
        {
            JsonNode? apiResult = null;

            // Parse the action string to the PgVectorActionsEnum
            if (!Enum.TryParse<PgVectorActionsEnum>(cloudConnectorReqDto.Action, true, out var action))
            {
                serviceResponse.Message = $"Unsupported action: {cloudConnectorReqDto.Action}";
                return serviceResponse;
            }

            // Route the request to the appropriate method based on action
            apiResult = action switch
            {
                PgVectorActionsEnum.InsertDocuments => await InsertAsync(cloudConnectorReqDto),
                PgVectorActionsEnum.RetrieveDocuments => await SearchAsync(cloudConnectorReqDto),
                PgVectorActionsEnum.Delete => await DeleteAsync(cloudConnectorReqDto),
                _ => null
            };

            // If API result is null, the action is not implemented
            if (apiResult == null)
            {
                serviceResponse.Message = $"Action {action} is not implemented.";
                return serviceResponse;
            }

            // Set the successful API response
            serviceResponse.Data.Response = apiResult;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Success";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during API calls
            _logger.LogError(ex, "Error invoking cloud connector for action: {Action}", cloudConnectorReqDto.Action);
            serviceResponse.Message = "Internal error occurred while calling FastAPI endpoint.";
        }

        return serviceResponse;
    }


    #region Action Methods

    // Handles the Insert action by calling FastAPI /vector-store/ingest endpoint.
    private async Task<JsonNode?> InsertAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        var requestObject = BuildRequestByAction(cloudConnectorReqDto, PgVectorActionsEnum.InsertDocuments);
        return await CallApiAsync(requestObject, HttpMethod.Post, "vector-store/ingest");
    }

    // Handles the GetMany (search/query) action by calling FastAPI /vector-store/query endpoint.
    private async Task<JsonNode?> SearchAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        var requestObject = BuildRequestByAction(cloudConnectorReqDto, PgVectorActionsEnum.RetrieveDocuments);
        return await CallApiAsync(requestObject, HttpMethod.Post, "vector-store/query");
    }

    // Handles the Delete action by calling FastAPI /vector-store/delete endpoint.
    private async Task<JsonNode?> DeleteAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        var requestObject = BuildRequestByAction(cloudConnectorReqDto, PgVectorActionsEnum.Delete);
        return await CallApiAsync(requestObject, HttpMethod.Delete, "vector-store/delete");
    }

    #endregion

    #region HTTP Call Helper

    // Generic API call to FastAPI endpoints. Supports POST (Insert/Search) and DELETE methods.
    private async Task<JsonNode?> CallApiAsync(
        JsonObject requestObject,
        HttpMethod method,
        string endpoint)
    {
        // Build API URL
        string apiUrl = $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/{endpoint}";

        HttpResponseMessage response;
        object? content = System.Text.Json.JsonSerializer.Deserialize<object>(requestObject.ToJsonString());

        // Execute API Request

        if (method == HttpMethod.Delete)
        {
            // Execute DELETE request
            response = await RequestExternalAPIUtil.RequestExternalAPI(
                CrudTypesEnum.Delete,
                apiUrl,
                _jwt,
                content);
        }
        else
        {
            // Execute POST request
            response = await RequestExternalAPIUtil.RequestExternalAPI(
                CrudTypesEnum.Create,
                apiUrl,
                _jwt,
                content);
        }

        // Throws exception if response status code is unsuccessful
        response.EnsureSuccessStatusCode();

        // Deserialize Response JSON
        return await response.Content.ReadFromJsonAsync<JsonNode>();
    }

    #endregion

    #region Generate Request Object Helper

    private JsonObject BuildRequestByAction(CloudConnectorReqDto cloudConnectorReqDto, PgVectorActionsEnum action)
    {
        var payload = cloudConnectorReqDto.Payload;

        if (payload == null)
        {
            return new JsonObject();
        }

        // Required Common Fields
        // Vector database provider name. Example: pgvector, qdrant
        string? vectorStoreName = payload.TryGetValue("vectorStore", out var vectorStoreValue)
            ? vectorStoreValue?.ToString()
            : null;

        if (string.IsNullOrWhiteSpace(vectorStoreName))
        {
            throw new ArgumentException("vectorStore is required.");
        }

        // Collection or table name used to store embeddings
        string? collectionName = payload.TryGetValue("collectionName", out var collectionNameValue)
            ? collectionNameValue?.ToString()
            : null;

        // if (string.IsNullOrWhiteSpace(collectionName))
        // {
        //     throw new ArgumentException("collectionName is required.");
        // }

        // Common Reference Metadata
        string? refType = payload.TryGetValue("ref_type", out var refTypeValue)
            ? refTypeValue?.ToString()
            : null;

        string? refId = payload.TryGetValue("ref_id", out var refIdValue)
            ? refIdValue?.ToString()
            : null;

        string? refName = payload.TryGetValue("ref_name", out var refNameValue)
            ? refNameValue?.ToString()
            : null;

        string? actionName = payload.TryGetValue("action", out var actionValue)
            ? actionValue?.ToString()
            : null;

        string? agentName = payload.TryGetValue("agent_name", out var agentNameValue)
            ? agentNameValue?.ToString()
            : null;

        // Optional Embedding Model Configuration
        JsonNode? embeddingConfig = null;
        string? embeddingProvider = null;
        string? embeddingModel = null;
        string? embeddingCredentialId = null;
        bool isByokEnabled = false;

        // Build Request By Action

        switch (action)
        {
            case PgVectorActionsEnum.InsertDocuments:

                // Input content to ingest into vector store
                string? input = payload.TryGetValue("input", out var inputValue)
                    ? inputValue?.ToString()
                    : null;

                if (string.IsNullOrWhiteSpace(input))
                {
                    throw new ArgumentException("input is required.");
                }

                // Metadata associated with the document
                JsonNode? metadata = null;

                if (payload.TryGetValue("metadata", out var metadataValue) && metadataValue != null)
                {
                    try
                    {
                        metadata = metadataValue is JsonNode jsonNode
                            ? jsonNode
                            : JsonNode.Parse(metadataValue.ToString() ?? "{}");
                    }
                    catch
                    {
                        metadata = null;
                    }
                }

                if (metadata == null)
                {
                    throw new ArgumentException("metadata is required.");
                }

                string? storeCredentialName = payload.TryGetValue("credential_name", out var storeCredentialValue)
                    ? storeCredentialValue?.ToString()
                    : cloudConnectorReqDto.CredentialName;
                // Accept legacy store_credential_id key for backward compatibility (Q12)
                if (string.IsNullOrWhiteSpace(storeCredentialName) && payload.TryGetValue("store_credential_id", out var legacyStoreCred))
                {
                    storeCredentialName = legacyStoreCred?.ToString();
                }

                int chunkSize = payload.TryGetValue("chunk_size", out var chunkSizeValue)
                    && int.TryParse(chunkSizeValue?.ToString(), out var parsedChunkSize)
                        ? parsedChunkSize
                        : 500;

                int chunkOverlap = payload.TryGetValue("chunk_overlap", out var chunkOverlapValue)
                    && int.TryParse(chunkOverlapValue?.ToString(), out var parsedChunkOverlap)
                        ? parsedChunkOverlap
                        : 100;

                int batchSize = payload.TryGetValue("batch_size", out var batchSizeValue)
                    && int.TryParse(batchSizeValue?.ToString(), out var parsedBatchSize)
                        ? parsedBatchSize
                        : 100;

                int? dimensions = null;

                if (payload.TryGetValue("dimensions", out var dimensionsValue)
                    && int.TryParse(dimensionsValue?.ToString(), out var parsedDimensions))
                {
                    dimensions = parsedDimensions;
                }

                // Embedding Model Configuration
                if (payload.TryGetValue("__ModelConfig__Embedding", out var embeddingConfigValue) && embeddingConfigValue != null)
                {
                    try
                    {
                        embeddingConfig = JsonNode.Parse(
                            embeddingConfigValue?.ToString() ?? "{}");
                    }
                    catch
                    {
                        embeddingConfig = null;
                    }
                }

                embeddingProvider = embeddingConfig?["provider"]?.ToString();
                embeddingModel = embeddingConfig?["model"]?.ToString();
                embeddingCredentialId = ReadCredentialFromConfig(embeddingConfig);
                if (bool.TryParse(embeddingConfig?["is_byok_enabled"]?.ToString(), out var parsedByokEnabled))
                {
                    isByokEnabled = parsedByokEnabled;
                }

                // Build Insert Request
                return new JsonObject
                {
                    ["vector_store"] = vectorStoreName,
                    ["collection_name"] = collectionName,
                    ["embedding_provider"] = embeddingProvider,
                    ["embedding_model"] = embeddingModel,
                    ["input"] = input,
                    ["metadata"] = metadata,
                    ["chunk_size"] = chunkSize,
                    ["chunk_overlap"] = chunkOverlap,
                    ["credential_name"] = storeCredentialName,
                    ["embedding_credential_name"] = embeddingCredentialId,
                    ["batch_size"] = batchSize,
                    ["dimensions"] = dimensions,
                    ["is_byok_enabled"] = isByokEnabled,
                    ["ref_type"] = refType,
                    ["ref_id"] = refId,
                    ["ref_name"] = refName,
                    ["action"] = actionName,
                    ["agent_name"] = agentName
                };

            case PgVectorActionsEnum.RetrieveDocuments:

                // Required Inputs

                string? inputText = payload.TryGetValue("inputText", out var inputTextValue)
                    ? inputTextValue?.ToString()
                    : null;

                if (string.IsNullOrWhiteSpace(inputText))
                {
                    throw new ArgumentException("inputText is required.");
                }

                // Optional Filters

                string? documentNames = payload.TryGetValue("documentNames", out var documentNamesValue)
                    ? documentNamesValue?.ToString()
                    : null;

                string? knowledgeBaseNames = payload.TryGetValue("knowledgeBaseNames", out var knowledgeBaseNamesValue)
                    ? knowledgeBaseNamesValue?.ToString()
                    : null;

                int numberOfChunks = payload.TryGetValue("numberOfChunks", out var numberOfChunksValue)
                    && int.TryParse(numberOfChunksValue?.ToString(), out var parsedChunkCount)
                        ? parsedChunkCount
                        : 5;

                float scoreThreshold = payload.TryGetValue("scoreThreshold", out var scoreThresholdValue)
                    && float.TryParse(scoreThresholdValue?.ToString(), out var parsedScoreThreshold)
                        ? parsedScoreThreshold
                        : 0.5f;

                // Embedding Column Configuration

                bool? specifyEmbeddingColumn = null;

                if (payload.TryGetValue("specifyEmbeddingColumn", out var specifyEmbeddingColumnValue)
                    && bool.TryParse(specifyEmbeddingColumnValue?.ToString(), out var parsedSpecifyEmbeddingColumn))
                {
                    specifyEmbeddingColumn = parsedSpecifyEmbeddingColumn;
                }

                if (payload.TryGetValue("__ModelConfig__Embedding", out var embeddingConfigValueG) && embeddingConfigValueG != null)
                {
                    try
                    {
                        embeddingConfig = JsonNode.Parse(embeddingConfigValueG?.ToString() ?? "{}");
                    }
                    catch
                    {
                        embeddingConfig = null;
                    }
                }

                embeddingProvider = embeddingConfig?["provider"]?.ToString();
                embeddingModel = embeddingConfig?["model"]?.ToString();
                embeddingCredentialId = ReadCredentialFromConfig(embeddingConfig);
                if (bool.TryParse(embeddingConfig?["is_byok_enabled"]?.ToString(), out var parsedByokEnabledG))
                {
                    isByokEnabled = parsedByokEnabledG;
                }

                return new JsonObject
                {
                    ["vector_store"] = vectorStoreName,
                    // ["collection_name"] = collectionName,
                    ["embedding_provider"] = embeddingProvider,
                    ["embedding_model"] = embeddingModel,
                    ["embedding_credential_name"] = embeddingCredentialId,
                    ["query"] = inputText,
                    ["top_k"] = numberOfChunks,
                    ["score_threshold"] = scoreThreshold,
                    ["credential_name"] = cloudConnectorReqDto.CredentialName,
                    ["is_byok_enabled"] = isByokEnabled,
                    ["kb_names"] = !string.IsNullOrWhiteSpace(knowledgeBaseNames)
                        ? System.Text.Json.JsonSerializer.SerializeToNode(
                            knowledgeBaseNames.Split(
                                ',',
                                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                        : null,

                    ["doc_names"] = !string.IsNullOrWhiteSpace(documentNames)
                        ? System.Text.Json.JsonSerializer.SerializeToNode(
                            documentNames.Split(
                                ',',
                                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                        : null,

                    // Common reference metadata
                    ["ref_type"] = refType,
                    ["ref_id"] = refId,
                    ["ref_name"] = refName,
                    ["action"] = actionName,
                    ["agent_name"] = agentName
                };

            case PgVectorActionsEnum.Delete:

                // Optional Filters
                knowledgeBaseNames = payload.TryGetValue("knowledgeBaseNames", out var knowledgeBaseNamesValueD)
                    ? knowledgeBaseNamesValueD?.ToString()
                    : null;

                documentNames = payload.TryGetValue("documentNames", out var documentNamesValueD)
                    ? documentNamesValueD?.ToString()
                    : null;

                // Optional Store Credential Configuration

                string? deleteStoreCredentialName = payload.TryGetValue("credential_name", out var storeCredentialValueD)
                    ? storeCredentialValueD?.ToString()
                    : cloudConnectorReqDto.CredentialName;
                // Accept legacy store_credential_id key for backward compatibility (Q12)
                if (string.IsNullOrWhiteSpace(deleteStoreCredentialName) && payload.TryGetValue("store_credential_id", out var legacyStoreCredD))
                {
                    deleteStoreCredentialName = legacyStoreCredD?.ToString();
                }

                // Build Delete Request

                return new JsonObject
                {
                    ["vector_store"] = vectorStoreName,
                    ["kb_names"] = !string.IsNullOrWhiteSpace(knowledgeBaseNames)
                        ? System.Text.Json.JsonSerializer.SerializeToNode(
                            knowledgeBaseNames.Split(
                                ',',
                                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                        : null,
                    ["doc_names"] = !string.IsNullOrWhiteSpace(documentNames)
                        ? System.Text.Json.JsonSerializer.SerializeToNode(
                            documentNames.Split(
                                ',',
                                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                        : null,
                    ["credential_name"] = deleteStoreCredentialName
                };

            default:
                throw new InvalidOperationException($"Unsupported action: {action}");
        }
    }

    // Reads a credential reference from an embedding config object. Accepts the canonical
    // "credential_name" key and the legacy "credential_id" key (Q12 back-compat).
    private static string? ReadCredentialFromConfig(JsonNode? config)
    {
        if (config is null) return null;
        if (config["credential_name"] is { } nameNode) return nameNode.ToString();
        return null;
    }

    #endregion
}