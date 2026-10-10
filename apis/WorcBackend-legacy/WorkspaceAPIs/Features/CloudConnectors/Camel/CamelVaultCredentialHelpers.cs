using System.Text.Json;
using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Builds <see cref="CamelAuthResult"/> instances from a decrypted vault credential
/// for the supported Camel authentication types.
///
/// Credential key conventions (matching the existing cloud-connector vault credential
/// usage):
///   - accessToken:      <c>AccessToken</c>
///   - basic:            <c>Username</c>, <c>Password</c>
///   - database:         <c>ConnectionString</c> (or <c>Url</c>), with optional
///                       <c>Username</c>/<c>Password</c> overrides
///   - clientCredentials:<c>AzureTenantId</c>, <c>ClientId</c>, <c>ClientSecret</c>
/// </summary>
public static class CamelVaultCredentialHelpers
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
    public static CamelAuthResult AccessToken(VaultCredentialDto credential)
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
        VaultCredentialDto credential,
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
    /// <c>ConnectionString</c> (or <c>Url</c>) key. Username/password are
    /// resolved in this precedence:
    ///   1. <c>dbUsername</c>/<c>dbPassword</c> payload fields (explicit override)
    ///   2. credential <c>Username</c>/<c>Password</c> keys
    ///   3. parsed from the connection string itself (URL userinfo or ADO.NET
    ///      <c>Username</c>/<c>Password</c> key-value pairs)
    /// The harness SQL metadata requires a <c>username</c> auth property, so the
    /// parsed credentials are always injected into the auth properties.
    /// </summary>
    public static CamelAuthResult Database(
        VaultCredentialDto credential,
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

        // When the credential does not carry explicit username/password, extract
        // them from the connection string so the harness receives the required
        // auth properties without the caller having to pass dbUsername/dbPassword.
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            TryExtractCredentials(url, out var parsedUsername, out var parsedPassword);
            username ??= parsedUsername;
            password ??= parsedPassword;
        }

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
    /// Extracts username/password from a database connection string. Supports:
    ///   - URL-style:  <c>postgresql://user:pass@host:port/db</c> (also
    ///     <c>jdbc:postgresql://user:pass@host:port/db</c>)
    ///   - ADO.NET:    <c>Host=...;Username=...;Password=...</c> (Npgsql-style
    ///     key=value pairs; keys are case-insensitive)
    /// Percent-encoded characters in URL userinfo (e.g. <c>%40</c> for <c>@</c>)
    /// are decoded.
    /// </summary>
    private static void TryExtractCredentials(
        string connectionString,
        out string? username,
        out string? password)
    {
        username = null;
        password = null;

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        // URL-style with userinfo: scheme://user:pass@host...
        var schemeEnd = connectionString.IndexOf("://", StringComparison.Ordinal);
        if (schemeEnd >= 0)
        {
            // Split on the LAST '@' so passwords containing '@' (e.g.
            // postgres:Post@123@localhost) are handled correctly. The first '@'
            // after the scheme may be inside the password, not the userinfo
            // separator.
            var atIndex = connectionString.LastIndexOf('@');
            if (atIndex > schemeEnd + 3)
            {
                var userInfo = connectionString.Substring(schemeEnd + 3, atIndex - (schemeEnd + 3));
                var colon = userInfo.IndexOf(':');
                if (colon >= 0)
                {
                    username = Uri.UnescapeDataString(userInfo.Substring(0, colon));
                    password = Uri.UnescapeDataString(userInfo.Substring(colon + 1));
                }
                else
                {
                    username = Uri.UnescapeDataString(userInfo);
                }
                return;
            }
        }

        // ADO.NET / Npgsql key=value pairs separated by ';'.
        try
        {
            var builder = new System.Data.Common.DbConnectionStringBuilder
            {
                ConnectionString = connectionString
            };
            if (builder.TryGetValue("Username", out var u)
                || builder.TryGetValue("User ID", out u)
                || builder.TryGetValue("Uid", out u))
            {
                username = Convert.ToString(u);
            }
            if (builder.TryGetValue("Password", out var p)
                || builder.TryGetValue("Pwd", out p))
            {
                password = Convert.ToString(p);
            }
        }
        catch
        {
            // Not a parseable key=value connection string; leave credentials null.
        }
    }

    /// <summary>
    /// Client-credentials authentication (e.g. Microsoft 365). Reads
    /// <c>AzureTenantId</c>, <c>ClientId</c> and <c>ClientSecret</c>.
    /// </summary>
    public static CamelAuthResult ClientCredentials(VaultCredentialDto credential)
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

    /// <summary>OAuth2 credentials used by Salesforce and similar providers.</summary>
    public static CamelAuthResult OAuth2(VaultCredentialDto credential)
    {
        var auth = new Dictionary<string, object?> { ["type"] = "oauth2" };
        AddCredentialValue(auth, credential, "ClientId", "clientId");
        AddCredentialValue(auth, credential, "ClientSecret", "clientSecret");
        AddCredentialValue(auth, credential, "AccessToken", "token");
        AddCredentialValue(auth, credential, "RefreshToken", "refreshToken");
        AddCredentialValue(auth, credential, "TokenUrl", "tokenUrl");
        return auth.Count == 1
            ? CamelAuthResult.Failure(400, $"Credential '{credential.Name}' has no OAuth2 values.")
            : CamelAuthResult.Success(auth);
    }

    private static string? GetString(VaultCredentialDto credential, string key)
    {
        if (credential.Data == null)
        {
            return null;
        }

        if (credential.Data is Dictionary<string, object?> dict)
        {
            foreach (var kv in dict)
            {
                if (string.Equals(kv.Key, key, StringComparison.OrdinalIgnoreCase) && kv.Value != null)
                {
                    return Convert.ToString(kv.Value);
                }
            }
            return null;
        }

        if (credential.Data is JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(key, out var prop))
            {
                return prop.ValueKind == JsonValueKind.Null ? null : prop.ToString();
            }
            return null;
        }

        // Fallback: Newtonsoft JObject-style dictionary or other generic dictionary
        var dataType = credential.Data.GetType();
        if (dataType.IsGenericType && dataType.GetGenericTypeDefinition() == typeof(Dictionary<,>))
        {
            foreach (dynamic kv in (System.Collections.IEnumerable)credential.Data)
            {
                if (string.Equals(Convert.ToString(kv.Key), key, StringComparison.OrdinalIgnoreCase) && kv.Value != null)
                {
                    return Convert.ToString(kv.Value);
                }
            }
        }

        return null;
    }

    private static void AddCredentialValue(
        Dictionary<string, object?> auth,
        VaultCredentialDto credential,
        string credentialKey,
        string authKey)
    {
        var value = GetString(credential, credentialKey);
        if (!string.IsNullOrWhiteSpace(value))
        {
            auth[authKey] = value;
        }
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
