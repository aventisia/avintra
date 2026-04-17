using System.Text.Json.Nodes;
using Npgsql;
using NpgsqlTypes;

namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore.PgVector;

public class PgVectorConnectorsService : IPgVectorConnectorsService
{
    private readonly ILogger<PgVectorConnectorsService> _logger;
    private readonly IVectorStoreService _vectorStoreService;

    public PgVectorConnectorsService(
        ILogger<PgVectorConnectorsService> logger,
        IVectorStoreService vectorStoreService)
    {
        _logger = logger;
        _vectorStoreService = vectorStoreService;
    }

    // This method is the main entry point for invoking PgVector operations based on the provided request. It handles upserting documents, deleting documents, and performing semantic search by delegating to specific private methods. The method also ensures proper error handling and logging.
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        // Validate the incoming cloudConnectorReqDto
        if (cloudConnectorReqDto == null)
            throw new ArgumentNullException(nameof(cloudConnectorReqDto));

        // Initialize the response with default values
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Parse the action from the request and execute the corresponding method
            if (!Enum.TryParse<PgVectorActionsEnum>(cloudConnectorReqDto.Action, true, out var action))
            {
                serviceResponse.Message = $"Unsupported action: {cloudConnectorReqDto.Action}";
                return serviceResponse;
            }

            // Ensure payload is not null to avoid null reference exceptions
            var payload = cloudConnectorReqDto.Payload ?? new();

            // Retrieve the connection string for the vector store based on the credential ID and provider
            var connectionString = await _vectorStoreService.GetVectorStoreConnectionStringAsync(cloudConnectorReqDto.CredentialId, VectorStoreProviderEnum.PgVector);
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                _logger.LogError("Connection string is null or empty for credential ID: {CredentialId}", cloudConnectorReqDto.CredentialId);
                serviceResponse.Message = "Failed to retrieve connection string for the vector store.";
                return serviceResponse;
            }

            // Execute the appropriate method based on the action
            var result = action switch
            {
                PgVectorActionsEnum.Insert => await InsertAsync(payload, connectionString),
                PgVectorActionsEnum.GetMany => await SearchAsync(payload, connectionString),
                _ => null
            };

            if (result == null)
            {
                serviceResponse.Message = $"Action {action} is not implemented.";
                return serviceResponse;
            }

            // Set the successful response
            serviceResponse.Data.Response = result;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Success";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invoking cloud connector for action: {Action}", cloudConnectorReqDto.Action);
        }

        return serviceResponse;
    }

    // Checks whether the specified table exists in the database. Returns true if it exists, otherwise false.
    private async Task<bool> TableExistsAsync(string tableName, string connectionString)
    {
        if (string.IsNullOrWhiteSpace(tableName))
            throw new ArgumentException("Table name cannot be null or empty.", nameof(tableName));

        var dataSource = CreateDataSource(connectionString);

        await using var conn = await dataSource.OpenConnectionAsync();

        const string sql = @"
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = @tableName
        );";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("tableName", tableName);

        var result = (bool)(await cmd.ExecuteScalarAsync() ?? false);
        return result;
    }

    // This method handles both inserting new documents and updating existing ones in the database.
    // It takes a payload containing the documents to be inserted or updated, ensures that the database is initialized, and then performs the necessary SQL operations to upsert the documents.
    // If an embedding is not provided for a document, it automatically generates one using the vector store service.
    // The method returns a JSON response indicating how many documents were inserted or updated.
    private async Task<JsonDocument?> InsertAsync(Dictionary<string, object> payload, string connectionString)
    {
        // get embedding model from payload, default to "text-embedding-3-small" if not provided
        var embeddingModel = payload["embeddingModel"]?.ToString() ?? "text-embedding-3-small";

        // get embedding provider from payload, default to "OpenAI" if not provided
        var embeddingProviderStr = payload["embeddingProvider"]?.ToString() ?? "OpenAI";
        var embeddingProvider = Enum.TryParse<EmbedingProviderEnum>(embeddingProviderStr, true, out var provider)
            ? provider
            : EmbedingProviderEnum.OpenAI;

        // Extract the table name from the payload, which is required for the insert operation
        var tableName = payload["tableName"]?.ToString();

        // Extract the credential ID from the payload, which is necessary for generating embeddings using the vector store service.
        // If the credential ID is missing or invalid, an exception is thrown to prevent further processing.
        var credentialIdStr = payload["embeddingCredentialId"]?.ToString();
        if (!Guid.TryParse(credentialIdStr, out var credentialId))
            throw new ArgumentException("Invalid or missing credentialId in the payload.", nameof(payload));

        // Validate that the table name is provided in the payload to avoid issues during database operations
        if (string.IsNullOrWhiteSpace(tableName))
            throw new ArgumentException("Table name is required in the payload.", nameof(payload));

        // Ensure the table exists before proceeding
        if (!await TableExistsAsync(tableName, connectionString))
        {
            throw new InvalidOperationException($"Table '{tableName}' does not exist in the database.");
        }

        // Deserialize the list of documents from the payload. The payload is expected to contain a key "documents" which holds the list of documents to be inserted or updated in the database.
        // Each document is represented as a DocumentDto object containing properties for Id, Content, Embedding, and Metadata.
        var docs = Deserialize<List<DocumentDto>>(payload, "documents");

        // If there are no documents to insert or update, return a response indicating that no records were affected
        if (docs.Count == 0)
            return Json(new { Inserted = 0 });

        var dataSource = CreateDataSource(connectionString);

        // Ensure the table exists before proceeding
        if (!await TableExistsAsync(tableName, connectionString))
        {
            throw new InvalidOperationException($"Table '{tableName}' does not exist in the database.");
        }

        // Open a connection to the database and begin a transaction to ensure that all operations are atomic
        await using var conn = await dataSource.OpenConnectionAsync();

        // Using a transaction ensures that either all documents are inserted/updated successfully, or none are, maintaining data integrity in case of errors during the operation.
        await using var tx = await conn.BeginTransactionAsync();

        // The SQL statement uses the "ON CONFLICT" clause to perform an upsert operation. If a document with the same ID already exists, it will update the existing record instead of inserting a new one. This allows for both insert and update operations to be handled in a single query.
        var sql = $"""
                    INSERT INTO {tableName} (id, content, embedding, metadata)
                    VALUES (@id, @content, @embedding, @metadata)
                    ON CONFLICT (id) DO UPDATE SET
                        content = EXCLUDED.content,
                        embedding = EXCLUDED.embedding,
                        metadata = EXCLUDED.metadata;
                """;

        // Iterate through each document in the list and execute the upsert operation for each one.
        // If an embedding is not provided for a document, it automatically generates one using the vector store service before executing the SQL command.
        foreach (var d in docs)
        {
            var embedding = new float[] { };
            var metadata = d.Metadata;
            var content = d.Content;

            // If the embedding is not provided in the document, generate it using the vector store service.
            // This ensures that all documents have an embedding before being inserted or updated in the database, which is essential for performing vector search operations later on.
            if (content != null || content.Length != 0)
            {
                var embeddingResponse = new EmbeddingResponseDto();

                // Extract embedding configuration
                if (payload["__ModelConfig__Embedding"] is System.Text.Json.JsonElement embeddingConfig)
                {
                    // Generate embedding vector for similarity search
                    embeddingResponse = await _vectorStoreService.GetEmbeddingVectorAsync(embeddingConfig);
                }

                embedding = embeddingResponse.Embeddings
                    .FirstOrDefault()?
                    .ToArray() ?? Array.Empty<float>();
            }

            await using var cmd = new NpgsqlCommand(sql, conn, tx);

            cmd.Parameters.AddWithValue("id", Guid.NewGuid());
            cmd.Parameters.AddWithValue("content", content ?? "");
            cmd.Parameters.AddWithValue("embedding", new Pgvector.Vector(new ReadOnlyMemory<float>()));
            cmd.Parameters.AddWithValue("metadata",
                NpgsqlDbType.Jsonb,
                System.Text.Json.JsonSerializer.Serialize(metadata ?? new()));

            await cmd.ExecuteNonQueryAsync();
        }

        await tx.CommitAsync();

        return Json(new { Inserted = docs.Count });
    }

    // This method performs a semantic search in the database using the provided query embedding and retrieves the most similar documents based on cosine similarity.
    private async Task<JsonDocument?> SearchAsync(Dictionary<string, object> payload, string connectionString)
    {
        // Extract query text to convert into embedding
        var query = CloudConnectionPayloadUtil.GetValue(payload, "prompt");
        if (string.IsNullOrWhiteSpace(query))
        {
            throw new ArgumentException("Query (prompt) is required.", nameof(payload));
        }

        // Number of results to return (default = 5)
        var topK = CloudConnectionPayloadUtil.GetInt(payload, "limit", 5);

        // Retrieve table name containing embeddings
        var tableName = CloudConnectionPayloadUtil.GetValue(payload, "tableName");
        if (string.IsNullOrWhiteSpace(tableName))
        {
            throw new ArgumentException("Table name is required.", nameof(payload));
        }

        // Optional column name (defaults to "embedding")
        var vectorColumns = CloudConnectionPayloadUtil.GetValue(payload, "vectorColumns");
        var columns = vectorColumns
            .Split(',')
            .Select(c => c.Trim())
            .ToList();

        if (columns.Count == 0)
        {
            throw new Exception("No columns provided");
        }

        // pick last column as embedding column
        var embeddingColumn = columns.Last();

        var embeddingResponse = new EmbeddingResponseDto();

        // Extract embedding configuration
        if (payload["__ModelConfig__Embedding"] is System.Text.Json.JsonElement embeddingConfig)
        {
            // Generate embedding vector for similarity search
            embeddingResponse = await _vectorStoreService.GetEmbeddingVectorAsync(embeddingConfig);
        }

        var embedding = embeddingResponse.Embeddings
            .FirstOrDefault()?
            .ToArray() ?? Array.Empty<float>();

        var dataSource = CreateDataSource(connectionString);

        await using var conn = await dataSource.OpenConnectionAsync();

        // build query safely
        string sql = $"""
            SELECT {vectorColumns},
                {embeddingColumn} <=> @query AS score
            FROM {tableName}
            ORDER BY {embeddingColumn} <=> @query
            LIMIT @topK;
        """;

        await using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("query", new Pgvector.Vector(embedding));
        cmd.Parameters.AddWithValue("topK", topK);

        var results = new List<object>();

        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            results.Add(new
            {
                Id = reader.GetGuid(0).ToString(),
                Content = reader.GetString(1),
                Metadata = reader.IsDBNull(2)
                    ? null
                    : System.Text.Json.JsonSerializer.Deserialize<object>(reader.GetString(2)),
                Score = reader.GetDouble(3)
            });
        }

        return Json(new { Results = results });
    }

    // This helper method is used to deserialize a value from the payload dictionary into a specified type T. It first checks if the key exists in the payload and retrieves the corresponding object.
    // If the key is not found, it returns a default instance of type T.
    // If the key is found, it serializes the object to JSON and then deserializes it back into type T, allowing for flexible handling of different data types in the payload.
    private static T Deserialize<T>(Dictionary<string, object> payload, string key)
    {

        if (!payload.TryGetValue(key, out var obj))
            return Activator.CreateInstance<T>();

        var json = System.Text.Json.JsonSerializer.Serialize(obj);
        // ignore case while deserializing to allow for flexibility in the payload format
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };
        return System.Text.Json.JsonSerializer.Deserialize<T>(json, options)!;
    }

    private static int GetInt(Dictionary<string, object> payload, string key, int def)
    {
        return payload.TryGetValue(key, out var val) && int.TryParse(val?.ToString(), out var i)
            ? i
            : def;
    }

    private static JsonDocument Json(object obj)
        => JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(obj));

    private record DocumentDto(
        string? Id,
        string? Content,
        float[]? Embedding,
        Dictionary<string, object>? Metadata);

    private NpgsqlDataSource CreateDataSource(string connectionString)
    {
        var builder = new NpgsqlDataSourceBuilder(connectionString);

        // Required for pgvector
        builder.UseVector();

        return builder.Build();
    }
}