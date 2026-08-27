using System.Net.Http.Json;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Proxies cloud-connector invocations to the internal Apache Camel connector
/// harness (Spring Boot app on <c>EnvironmentConfig.CamelApiBaseUrl</c>).
///
/// Contract mapping (see the harness's <c>ConnectorRequest</c> envelope):
///   node name   "Camel/Github/RepositoryCreateConnector" ->
///     Provider  "Camel/Github"  (route family = "camel/github")
///     Action    "RepositoryCreate"  (resolved to the generated config file)
///
/// The conversion from node fields to the harness envelope is driven entirely by
/// the generated connector config files (the <c>camel</c> metadata block):
///   - <c>operation</c>   fixed dotted operation (github/m365) or the payload's
///                        operation select (wrapper families)
///   - <c>configKeys</c>  node field names placed into the harness `configuration`
///   - <c>bodyField</c>   node field name that becomes the harness `payload`
///   - <c>authType</c>    maps to the vault credential resolution
///
/// Credentials are resolved from the vault exactly like existing cloud
/// connectors (Q7=A reuse-only mapping):
///   github -> AppSecretTypesEnum.GitHub      (AccessToken)
///   m365   -> AppSecretTypesEnum.M365        (AzureTenantId/ClientId/ClientSecret)
///   http/ftp/jms/kafka/mail -> GeneralCredentials (Username/Password)
///   sql/jdbc -> ConnectionString             (ConnectionString URL) + dbUsername/dbPassword
/// </summary>
public class CamelConnectorsService : ICamelConnectorsService
{
    private readonly ILogger<CamelConnectorsService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly CamelConnectorsConfigRepository _configRepository;

    // Families whose requiredAuth needs a `database` block (url/username/password).
    private static readonly HashSet<string> DatabaseFamilies = new(StringComparer.OrdinalIgnoreCase)
    {
        "sql", "jdbc"
    };

    public CamelConnectorsService(
        ILogger<CamelConnectorsService> logger,
        EnvironmentConfig environmentConfig,
        ICloudConnectorsVaultService cloudConnectorsVaultService,
        IHttpClientFactory httpClientFactory,
        CamelConnectorsConfigRepository configRepository)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _httpClientFactory = httpClientFactory;
        _configRepository = configRepository;
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Response = null,
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Provider is "Camel/<Family>" (e.g. "Camel/Github"). The last segment
            // is the family used for the harness route and config lookup.
            var (family, ok) = ResolveFamily(cloudConnectorReqDto.Provider);
            if (!ok || string.IsNullOrWhiteSpace(family))
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Invalid Camel connector provider. Expected 'Camel/<Family>'.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            // Build the Camel request envelope (mirrors ConnectorRequest.java),
            // driven by the generated connector config file.
            var envelope = await BuildRequestEnvelopeAsync(cloudConnectorReqDto, family);
            if (envelope == null)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"No Camel connector config found for '{cloudConnectorReqDto.Provider}/{cloudConnectorReqDto.Action}'.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            var camelBaseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(camelBaseUrl))
            {
                serviceResponse.StatusCode = 500;
                serviceResponse.Message = "Camel API base URL is not configured.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            var url = $"{camelBaseUrl}/api/connectors/{family.ToLowerInvariant()}";
            using var client = _httpClientFactory.CreateClient("CamelConnectors");

            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(envelope, new System.Net.Http.Headers.MediaTypeHeaderValue("application/json"))
            };

            Console.WriteLine($"Request Endpoint: {url}");
            Console.WriteLine($"Request Method: {request.Method}");

            var requestBody = await request.Content.ReadAsStringAsync();
            Console.WriteLine($"Request Body: {requestBody}");

            using var response = await client.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"Response Status: {(int)response.StatusCode}");
            Console.WriteLine($"Response Body: {responseBody}");

            if (!response.IsSuccessStatusCode)
            {
                serviceResponse.StatusCode = (int)response.StatusCode;
                serviceResponse.Message = $"Camel connector '{family}' returned {response.StatusCode}.";
                serviceResponse.Data.Response = TryParseError(responseBody) ?? responseBody;
                return serviceResponse;
            }

            // Harness success envelope: { ok, connector, targetUri, body, headers }
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            var body = root.TryGetProperty("body", out var bodyEl) ? bodyEl.Clone() : root.Clone();

            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Camel connector '{family}' invoked successfully.";
            serviceResponse.Data.Response = body;
            return serviceResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Camel connector '{Provider}'.", cloudConnectorReqDto.Provider);
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.GetBaseException().Message}";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }
    }

    /// <summary>
    /// Splits "Camel/Github" into family "github". Accepts "Camel/Github" or "Github".
    /// </summary>
    private static (string? family, bool ok) ResolveFamily(string? provider)
    {
        if (string.IsNullOrWhiteSpace(provider)) return (null, false);
        var segments = provider.Split('/');
        var family = segments[^1];
        return (family, true);
    }

    private async Task<Dictionary<string, object?>?> BuildRequestEnvelopeAsync(CloudConnectorReqDto dto, string family)
    {
        var payload = dto.Payload ?? new Dictionary<string, object>();

        // Resolve the generated config file for this family + action. The `camel`
        // metadata block drives the entire conversion.
        var config = _configRepository.Get(family, dto.Action);
        if (config?.Camel == null)
        {
            _logger.LogWarning("No Camel config/camel metadata for '{Family}/{Action}'.", family, dto.Action);
            return null;
        }
        var camel = config.Camel;

        // Determine the harness operation:
        //  - Large families (github/m365): fixed dotted operation from the config.
        //  - Wrapper families: operation select from the payload.
        string? operation = ResolveOperation(camel, family, dto.Action, payload);

        var configuration = new Dictionary<string, object>();
        var headers = new Dictionary<string, object>();

        // Explicit headers field (HTTP-style headers to pass to the Camel exchange).
        if (payload.TryGetValue("headers", out var headersObj) && headersObj != null)
        {
            headers = ParseJsonObject(headersObj) ?? headers;
        }

        // Place the node's config fields into the harness `configuration`.
        // Which keys belong there is declared by the config file's camel.configKeys.
        // The executor camelCases payload keys (per_page -> perPage), so match
        // config keys case-insensitively and store the value under the canonical
        // harness key name (the harness reads config.get("per_page")).
        foreach (var kv in payload)
        {
            if (kv.Key is "operation" or "headers" or "__CredentialName__" or "credentialName")
            {
                continue;
            }
            if (kv.Key.StartsWith("__CredentialName__", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            if (camel.ConfigKeys == null || camel.ConfigKeys.Count == 0)
            {
                configuration[kv.Key] = kv.Value ?? string.Empty;
                continue;
            }
            // Find the canonical config key that matches this payload key.
            var canonical = camel.ConfigKeys.FirstOrDefault(
                k => string.Equals(NormalizeKey(k), NormalizeKey(kv.Key), StringComparison.Ordinal));
            if (canonical != null)
            {
                configuration[canonical] = kv.Value ?? string.Empty;
            }
        }

        // Request body: the node field named by camel.bodyField (e.g. payload,
        // content, message, parameters).
        object? requestBody = null;
        if (!string.IsNullOrWhiteSpace(camel.BodyField))
        {
            requestBody = payload.TryGetValue(camel.BodyField, out var bodyObj) && bodyObj != null
                ? bodyObj
                : (object?)new Dictionary<string, object>();
        }

        var auth = await BuildAuthAsync(family, dto, payload, camel.AuthType);

        var envelope = new Dictionary<string, object?>
        {
            ["connector"] = family.ToLowerInvariant(),
            ["operation"] = operation,
            ["configuration"] = configuration.Count > 0 ? configuration : null,
            ["auth"] = auth,
            ["headers"] = headers.Count > 0 ? headers : null,
            ["payload"] = requestBody,
        };
        return envelope;
    }

    private string? ResolveOperation(CamelMeta camel, string family, string action, Dictionary<string, object> payload)
    {
        // Large families: fixed dotted operation from the config metadata.
        if (!string.IsNullOrWhiteSpace(camel.Operation))
        {
            return camel.Operation;
        }

        // Wrapper families: operation select from the payload.
        if (payload.TryGetValue("operation", out var opObj) && opObj != null)
        {
            return opObj.ToString();
        }

        // Fallback: map PascalCase action to dotted harness operation via the
        // generated CamelActionMapping.json (defensive; configs carry it now).
        var mapping = LoadActionMapping();
        if (mapping != null &&
            mapping.TryGetValue(family, out var familyMap) &&
            familyMap is Dictionary<string, object?> fam &&
            fam.TryGetValue(action, out var mapped) &&
            mapped is string op &&
            !string.IsNullOrWhiteSpace(op))
        {
            return op;
        }
        return string.IsNullOrWhiteSpace(action) ? null : action;
    }

    // The action mapping is static content; load it once and cache it so the
    // fallback path does not hit the disk on every invocation.
    private static Dictionary<string, object?>? _actionMappingCache;
    private static readonly object _actionMappingGate = new();

    private Dictionary<string, object?>? LoadActionMapping()
    {
        lock (_actionMappingGate)
        {
            if (_actionMappingCache != null)
            {
                return _actionMappingCache;
            }
            try
            {
                var path = Path.Combine(
                    AppContext.BaseDirectory,
                    "Features", "CloudConnectors", "ConfigFiles", "Camel", "CamelActionMapping.json");
                if (!System.IO.File.Exists(path))
                {
                    _logger.LogWarning("CamelActionMapping.json not found at {Path}.", path);
                    _actionMappingCache = new Dictionary<string, object?>();
                    return null;
                }
                var json = System.IO.File.ReadAllText(path);
                _actionMappingCache = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(json);
                return _actionMappingCache;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load Camel action mapping.");
                _actionMappingCache = new Dictionary<string, object?>();
                return null;
            }
        }
    }

    private async Task<Dictionary<string, object?>?> BuildAuthAsync(
        string family,
        CloudConnectorReqDto dto,
        Dictionary<string, object> payload,
        string? authType)
    {
        // CredentialName is required on the DTO and is always populated by the
        // executor from the node's __CredentialName__ input, so no payload fallback is needed.
        var credentialName = dto.CredentialName;

        var vaultCredential = !string.IsNullOrWhiteSpace(credentialName)
            ? await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName)
            : null;

        // Families that genuinely need no auth (declared in the config).
        if (string.Equals(authType, "none", StringComparison.OrdinalIgnoreCase) || vaultCredential == null)
        {
            if (vaultCredential == null && !string.IsNullOrWhiteSpace(credentialName))
            {
                _logger.LogWarning("No vault credential found for Camel connector '{Family}' (credential '{Credential}').",
                    family, credentialName);
            }
            return new Dictionary<string, object?> { ["type"] = "none" };
        }

        var data = vaultCredential.Data;

        // Database families: auth.type=database + properties { url, username, password }.
        // The ConnectionString credential carries the full connection string
        // (JDBC `jdbc:postgresql://...` or URL-style `postgresql://user:pass@host:port/db`).
        // The harness normalizes URL-style strings and extracts username/password
        // from the URL userinfo when they are not supplied separately.
        if (DatabaseFamilies.Contains(family))
        {
            var dbUrl = GetString(data, "ConnectionString");
            var dbUsername = GetString(payload, "dbUsername") ?? GetString(data, "Username");
            var dbPassword = GetString(payload, "dbPassword") ?? GetString(data, "Password");

            // Credentials embedded in the URL userinfo (postgresql://user:pass@host/db)
            // satisfy the username requirement without separate dbUsername/dbPassword.
            // Percent-encoded characters (e.g. %40 for '@') are decoded so the
            // harness receives the literal credential value.
            var userInfo = ExtractUserInfo(dbUrl);
            if (userInfo != null)
            {
                if (string.IsNullOrWhiteSpace(dbUsername))
                {
                    dbUsername = DecodeUserInfo(userInfo.Value.Username);
                }
                if (string.IsNullOrWhiteSpace(dbPassword))
                {
                    dbPassword = DecodeUserInfo(userInfo.Value.Password);
                }
            }

            if (string.IsNullOrWhiteSpace(dbUrl) ||
                (string.IsNullOrWhiteSpace(dbUsername) && userInfo == null))
            {
                _logger.LogWarning("Camel '{Family}' database credential is missing url/username.", family);
            }

            return new Dictionary<string, object?>
            {
                ["type"] = "database",
                ["properties"] = new Dictionary<string, object?>
                {
                    ["url"] = dbUrl,
                    ["username"] = dbUsername,
                    ["password"] = dbPassword
                }
            };
        }

        // GitHub: auth.type=accessToken with the PAT.
        if (family.Equals("github", StringComparison.OrdinalIgnoreCase))
        {
            return new Dictionary<string, object?>
            {
                ["type"] = "accessToken",
                ["token"] = GetString(data, "AccessToken")
            };
        }

        // M365: client_credentials app-only flow.
        if (family.Equals("m365", StringComparison.OrdinalIgnoreCase))
        {
            return new Dictionary<string, object?>
            {
                ["type"] = "client_credentials",
                ["tenantId"] = GetString(data, "AzureTenantId"),
                ["clientId"] = GetString(data, "ClientId"),
                ["clientSecret"] = GetString(data, "ClientSecret")
            };
        }

        // http/ftp/jms/kafka/mail: basic auth from GeneralCredentials.
        var username = GetString(data, "Username");
        var password = GetString(data, "Password");
        if (!string.IsNullOrWhiteSpace(username))
        {
            var auth = new Dictionary<string, object?> { ["type"] = "basic", ["username"] = username };
            if (!string.IsNullOrWhiteSpace(password)) auth["password"] = password;

            // JMS needs brokerUrl in auth.properties (defaults to local Artemis otherwise).
            if (family.Equals("jms", StringComparison.OrdinalIgnoreCase))
            {
                var brokerUrl = GetString(payload, "brokerUrl");
                if (!string.IsNullOrWhiteSpace(brokerUrl))
                {
                    auth["properties"] = new Dictionary<string, object?> { ["brokerUrl"] = brokerUrl };
                }
            }
            return auth;
        }

        // Fallback: no auth.
        return new Dictionary<string, object?> { ["type"] = "none" };
    }

    private static string? GetString(Dictionary<string, object> dict, string key)
    {
        if (dict.TryGetValue(key, out var val) && val != null)
        {
            return Convert.ToString(val);
        }
        // Case-insensitive fallback (JsonElement keys are preserved as-is).
        foreach (var kv in dict)
        {
            if (string.Equals(kv.Key, key, StringComparison.OrdinalIgnoreCase))
            {
                return Convert.ToString(kv.Value);
            }
        }
        return null;
    }

    /// <summary>
    /// Extracts the username/password pair from a database connection string's
    /// URL userinfo (e.g. <c>postgresql://user:pass@host:port/db</c> or
    /// <c>jdbc:postgresql://user:pass@host:port/db</c>). Splits on the LAST
    /// <c>@</c> so passwords containing <c>@</c> are handled correctly. Returns
    /// <c>null</c> when the URL has no userinfo.
    /// </summary>
    private static (string Username, string Password)? ExtractUserInfo(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return null;
        }
        var schemeEnd = url.IndexOf("://", StringComparison.Ordinal);
        if (schemeEnd < 0)
        {
            return null;
        }
        var at = url.LastIndexOf('@');
        if (at < 0 || at < schemeEnd)
        {
            return null;
        }
        var userInfo = url.Substring(schemeEnd + 3, at - (schemeEnd + 3));
        if (string.IsNullOrWhiteSpace(userInfo))
        {
            return null;
        }
        var colon = userInfo.IndexOf(':');
        var username = colon < 0 ? userInfo : userInfo.Substring(0, colon);
        var password = colon < 0 ? string.Empty : userInfo.Substring(colon + 1);
        if (string.IsNullOrWhiteSpace(username))
        {
            return null;
        }
        return (username, password);
    }

    /// <summary>
    /// Percent-decodes a credential extracted from the URL userinfo. Connection
    /// strings may encode reserved characters (e.g. <c>%40</c> for <c>@</c>,
    /// <c>%25</c> for <c>%</c>) so the harness receives the literal value.
    /// Malformed sequences are left as-is.
    /// </summary>
    private static string DecodeUserInfo(string value)
    {
        if (string.IsNullOrEmpty(value) || value.IndexOf('%') < 0)
        {
            return value;
        }
        using var output = new System.IO.MemoryStream(value.Length);
        for (var i = 0; i < value.Length; i++)
        {
            var c = value[i];
            if (c == '%' && i + 2 < value.Length &&
                Uri.IsHexDigit(value[i + 1]) && Uri.IsHexDigit(value[i + 2]))
            {
                output.WriteByte((byte)((HexValue(value[i + 1]) << 4) | HexValue(value[i + 2])));
                i += 2;
                continue;
            }
            var bytes = Encoding.UTF8.GetBytes(c.ToString());
            output.Write(bytes, 0, bytes.Length);
        }
        return Encoding.UTF8.GetString(output.ToArray());
    }

    private static int HexValue(char c) => c switch
    {
        >= '0' and <= '9' => c - '0',
        >= 'a' and <= 'f' => c - 'a' + 10,
        >= 'A' and <= 'F' => c - 'A' + 10,
        _ => 0
    };

    /// <summary>
    /// Normalizes a payload/config key so the executor's camelCased keys match the
    /// harness's snake_case config keys (per_page -> perPage -> per_page). Strips
    /// non-alphanumeric characters and lowercases, so camelCase, snake_case, and
    /// kebab-case all normalize to the same token.
    /// </summary>
    private static string NormalizeKey(string key)
    {
        var chars = key.Where(char.IsLetterOrDigit).Select(char.ToLowerInvariant).ToArray();
        return new string(chars);
    }

    private static Dictionary<string, object>? ParseJsonObject(object value)
    {
        if (value is JsonElement el && el.ValueKind == JsonValueKind.Object)
        {
            return el.EnumerateObject().ToDictionary(p => p.Name, p => (object)p.Value.Clone());
        }
        if (value is string s && !string.IsNullOrWhiteSpace(s))
        {
            try
            {
                var parsed = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(s);
                return parsed;
            }
            catch
            {
                return null;
            }
        }
        return null;
    }

    private static string? TryParseError(string responseBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            if (root.TryGetProperty("error", out var err))
            {
                return err.GetString();
            }
        }
        catch
        {
            // ignore
        }
        return null;
    }
}
