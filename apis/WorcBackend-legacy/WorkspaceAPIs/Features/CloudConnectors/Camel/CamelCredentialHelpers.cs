namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Builds <see cref="CamelAuthResult"/> instances from a decrypted vault
/// credential for the supported Camel authentication types.
///
/// Credential key conventions (matching the existing cloud-connector vault
/// usage):
///   - accessToken:      <c>AccessToken</c>
///   - basic:            <c>Username</c>, <c>Password</c>
///   - database:         <c>ConnectionString</c> (or <c>Url</c>), with optional
///                       <c>Username</c>/<c>Password</c> overrides
///   - clientCredentials:<c>AzureTenantId</c>, <c>ClientId</c>, <c>ClientSecret</c>
/// </summary>
public static class CamelCredentialHelpers
{
    /// <summary>Unauthenticated request.</summary>
    public static CamelAuthResult None() => CamelAuthResult.None();

    /// <summary>Credential was required but could not be resolved.</summary>
    public static CamelAuthResult MissingCredential(string family, string? credentialName)
    {
        return CamelAuthResult.Failure(
            400,
            $"Credential '{credentialName}' was not found for Camel connector '{family}'.");
    }

    /// <summary>
    /// Access-token authentication (e.g. GitHub PATs). Reads the <c>AccessToken</c>
    /// key from the credential data.
    /// </summary>
    public static CamelAuthResult AccessToken(VaultCredentialObj credential)
    {
        var token = GetString(credential, "AccessToken");
        if (string.IsNullOrWhiteSpace(token))
        {
            return CamelAuthResult.Failure(400, $"Credential '{credential.Name}' has no 'AccessToken' value.");
        }

        return CamelAuthResult.Success(new Dictionary<string, object?>
        {
            ["type"] = "accessToken",
            ["token"] = token
        });
    }

    /// <summary>
    /// Basic authentication. Reads <c>Username</c> and optional <c>Password</c>
    /// from the credential data. Extra payload keys (e.g. host, port, privateKey)
    /// are passed through as auth properties when present.
    /// </summary>
    public static CamelAuthResult Basic(
        VaultCredentialObj credential,
        Dictionary<string, object> payload,
        string family,
        params string[] extraKeys)
    {
        var username = GetString(credential, "Username");
        if (string.IsNullOrWhiteSpace(username))
        {
            return CamelAuthResult.Failure(400, $"Credential '{credential.Name}' has no 'Username' value.");
        }

        var auth = new Dictionary<string, object?>
        {
            ["type"] = "basic",
            ["username"] = username
        };

        var password = GetString(credential, "Password");
        if (!string.IsNullOrWhiteSpace(password))
        {
            auth["password"] = password;
        }

        var properties = new Dictionary<string, object?>();
        foreach (var key in extraKeys)
        {
            if (payload.TryGetValue(key, out var value) && value != null)
            {
                properties[key] = value;
            }
        }
        if (properties.Count > 0)
        {
            auth["properties"] = properties;
        }

        return CamelAuthResult.Success(auth);
    }

    /// <summary>
    /// Database authentication. Reads the connection string/URL from the
    /// <c>ConnectionString</c> (or <c>Url</c>) key. Username/password may be
    /// overridden via the <c>dbUsername</c>/<c>dbPassword</c> payload fields or
    /// the credential's <c>Username</c>/<c>Password</c> keys.
    /// </summary>
    public static CamelAuthResult Database(
        VaultCredentialObj credential,
        Dictionary<string, object> payload,
        string family)
    {
        var url = GetString(credential, "ConnectionString")
                  ?? GetString(credential, "Url");
        if (string.IsNullOrWhiteSpace(url))
        {
            return CamelAuthResult.Failure(
                400,
                $"Credential '{credential.Name}' has no 'ConnectionString'/'Url' value.");
        }

        var properties = new Dictionary<string, object?>
        {
            ["url"] = url
        };

        var username = GetPayloadString(payload, "dbUsername") ?? GetString(credential, "Username");
        var password = GetPayloadString(payload, "dbPassword") ?? GetString(credential, "Password");
        if (!string.IsNullOrWhiteSpace(username))
        {
            properties["username"] = username;
        }
        if (!string.IsNullOrWhiteSpace(password))
        {
            properties["password"] = password;
        }

        return CamelAuthResult.Success(new Dictionary<string, object?>
        {
            ["type"] = "database",
            ["properties"] = properties
        });
    }

    /// <summary>
    /// Client-credentials authentication (e.g. Microsoft 365). Reads
    /// <c>AzureTenantId</c>, <c>ClientId</c> and <c>ClientSecret</c>.
    /// </summary>
    public static CamelAuthResult ClientCredentials(VaultCredentialObj credential)
    {
        var tenantId = GetString(credential, "AzureTenantId");
        var clientId = GetString(credential, "ClientId");
        var clientSecret = GetString(credential, "ClientSecret");

        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId)
            || string.IsNullOrWhiteSpace(clientSecret))
        {
            return CamelAuthResult.Failure(
                400,
                $"Credential '{credential.Name}' must contain 'AzureTenantId', 'ClientId' and 'ClientSecret'.");
        }

        return CamelAuthResult.Success(new Dictionary<string, object?>
        {
            ["type"] = "client_credentials",
            ["tenantId"] = tenantId,
            ["clientId"] = clientId,
            ["clientSecret"] = clientSecret
        });
    }

    private static string? GetString(VaultCredentialObj credential, string key)
    {
        if (credential.Data == null)
        {
            return null;
        }
        foreach (var kv in credential.Data)
        {
            if (string.Equals(kv.Key, key, StringComparison.OrdinalIgnoreCase) && kv.Value != null)
            {
                return Convert.ToString(kv.Value);
            }
        }
        return null;
    }

    private static string? GetPayloadString(Dictionary<string, object> payload, string key)
    {
        foreach (var kv in payload)
        {
            if (string.Equals(kv.Key, key, StringComparison.OrdinalIgnoreCase) && kv.Value != null)
            {
                return Convert.ToString(kv.Value);
            }
        }
        return null;
    }
}
