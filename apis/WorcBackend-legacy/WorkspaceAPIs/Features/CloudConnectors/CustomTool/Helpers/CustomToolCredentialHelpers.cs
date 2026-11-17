namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Maps a custom-tool vault credential into concrete HTTP authentication.
/// </summary>
public static class CustomToolCredentialHelpers
{
    /// <summary>
    /// Resolves the decrypted vault credential into HTTP auth headers and an optional API-key query parameter.
    /// </summary>
    public static async Task<CustomToolAuthResult> ResolveAuthenticationAsync(
        ICloudConnectorsVaultCredentialService cloudConnectorsVaultCredentialService,
        string credentialName)
    {
        var resolution = await cloudConnectorsVaultCredentialService.ResolveVaultCredentialAsync(credentialName);
        if (!resolution.IsSuccess)
        {
            return CustomToolAuthResult.Failure(resolution.FailureMessage!);
        }

        var vaultCredential = resolution.Credential!;
        var parameters = GetCredentialParameters(vaultCredential.Data);
        var authType = ResolveAuthType(vaultCredential.Data);

        var headers = new Dictionary<string, string>();
        string? query = null;
        string[] secrets = [];
        switch (authType)
        {
            case ToolAuthenticationTypeEnum.Bearer:
                {
                    var token = GetString(parameters, "token");
                    if (string.IsNullOrWhiteSpace(token))
                    {
                        return CustomToolAuthResult.Failure(CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "token"));
                    }

                    headers["Authorization"] = $"Bearer {token}";
                    secrets = CloudConnectorLogRedactor.WithEscapedForms(token);
                    break;
                }

            case ToolAuthenticationTypeEnum.Basic:
                {
                    var username = GetString(parameters, "username");
                    var password = GetString(parameters, "password");
                    if (string.IsNullOrWhiteSpace(username))
                    {
                        return CustomToolAuthResult.Failure(CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "username"));
                    }

                    var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
                    headers["Authorization"] = $"Basic {encoded}";
                    // IMPORTANT NOTE: an upstream may echo the encoded pair without the "Basic " prefix,
                    // so both the raw password and the encoded value must be known secrets.
                    secrets = CloudConnectorLogRedactor.WithEscapedForms(password, encoded);
                    break;
                }

            case ToolAuthenticationTypeEnum.ApiKeyHeader:
                {
                    var headerName = GetString(parameters, "headerName");
                    var apiKey = GetString(parameters, "apiKey");
                    if (string.IsNullOrWhiteSpace(headerName))
                    {
                        return CustomToolAuthResult.Failure(CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "headerName"));
                    }

                    if (string.IsNullOrWhiteSpace(apiKey))
                    {
                        return CustomToolAuthResult.Failure(CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "apiKey"));
                    }

                    headers[headerName] = apiKey!;
                    secrets = CloudConnectorLogRedactor.WithEscapedForms(apiKey);
                    break;
                }

            case ToolAuthenticationTypeEnum.ApiKeyQuery:
                {
                    var parameterName = GetString(parameters, "parameterName");
                    var apiKey = GetString(parameters, "apiKey");
                    if (string.IsNullOrWhiteSpace(parameterName))
                    {
                        return CustomToolAuthResult.Failure(CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "parameterName"));
                    }

                    if (string.IsNullOrWhiteSpace(apiKey))
                    {
                        return CustomToolAuthResult.Failure(CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "apiKey"));
                    }

                    query = $"{Uri.EscapeDataString(parameterName!)}={Uri.EscapeDataString(apiKey!)}";
                    // IMPORTANT NOTE: the query travels URL-escaped and under a caller-chosen parameter name,
                    // so both forms must be known secrets for an upstream that echoes the request URL.
                    secrets = CloudConnectorLogRedactor.WithEscapedForms(apiKey);
                    break;
                }

            default:
                {
                    return CustomToolAuthResult.Failure(
                        $"Credential '{credentialName}' has an unsupported authentication type '{authType}'.");
                }
        }

        return CustomToolAuthResult.Succeeded(headers, query, secrets);
    }

    private static Dictionary<string, string> GetCredentialParameters(Dictionary<string, object> data)
    {
        var parameters = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (!data.TryGetValue("Parameters", out var parametersValue) || parametersValue is null)
        {
            return parameters;
        }

        if (parametersValue is JsonElement parametersElement && parametersElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in parametersElement.EnumerateObject())
            {
                parameters[property.Name] = property.Value.ToString() ?? string.Empty;
            }
        }
        else if (parametersValue is Dictionary<string, object> parametersDict)
        {
            foreach (var kvp in parametersDict)
            {
                parameters[kvp.Key] = kvp.Value?.ToString() ?? string.Empty;
            }
        }

        return parameters;
    }

    private static ToolAuthenticationTypeEnum ResolveAuthType(Dictionary<string, object> data)
    {
        if (!data.TryGetValue("Type", out var typeValue) || typeValue is null)
        {
            return ToolAuthenticationTypeEnum.None;
        }

        if (typeValue is JsonElement typeElement)
        {
            if (typeElement.ValueKind == JsonValueKind.String &&
                Enum.TryParse<ToolAuthenticationTypeEnum>(typeElement.GetString(), ignoreCase: true, out var parsed))
            {
                return parsed;
            }

            if (typeElement.ValueKind == JsonValueKind.Number && typeElement.TryGetInt32(out var numeric))
            {
                return (ToolAuthenticationTypeEnum)numeric;
            }
        }

        return Enum.TryParse<ToolAuthenticationTypeEnum>(typeValue.ToString(), ignoreCase: true, out var fallback)
            ? fallback
            : ToolAuthenticationTypeEnum.None;
    }

    private static string? GetString(Dictionary<string, string> parameters, string key) =>
        parameters.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value) ? value : null;
}

/// <summary>
/// Authentication resolution outcome for a custom tool credential.
/// </summary>
public sealed class CustomToolAuthResult
{
    public bool IsSuccess { get; private init; }
    public string? ErrorMessage { get; private init; }
    public Dictionary<string, string> Headers { get; private init; } = [];
    public string? Query { get; private init; }

    /// <summary>
    /// Secret values carried by this authentication, in the forms an upstream may echo.
    /// </summary>
    public string[] Secrets { get; private init; } = [];

    public static CustomToolAuthResult Succeeded(Dictionary<string, string> headers, string? query, string[] secrets) => new()
    {
        IsSuccess = true,
        Headers = headers,
        Query = query,
        Secrets = secrets,
    };

    public static CustomToolAuthResult Failure(string errorMessage) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage,
    };
}
