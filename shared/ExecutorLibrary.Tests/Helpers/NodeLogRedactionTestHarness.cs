using System.Text.Json;
using System.Text.Json.Nodes;
using NodeLibrary.Helpers;
using static ExecutorLibrary.Tests.TestHarness;

namespace ExecutorLibrary.Tests.Helpers;

/// <summary>
/// Coverage for the secret-value scrubbing of <see cref="NodeLogHelper.ConvertValueForLogging"/>.
/// </summary>
public static class NodeLogRedactionTestHarness
{
    private const string Key = "value";
    private const string InOrOut = "Output";
    private const string Placeholder = "[REDACTED]";

    public static int Run()
    {
        var failures = 0;
        failures += RunCase("PasswordKeyIsMasked", PasswordKeyIsMasked);
        failures += RunCase("NestedSecretKeysAreMasked", NestedSecretKeysAreMasked);
        failures += RunCase("ConnectionStringKeyIsMasked", ConnectionStringKeyIsMasked);
        failures += RunCase("JsonElementSecretKeyIsMasked", JsonElementSecretKeyIsMasked);
        failures += RunCase("SecretKeyInsideArrayIsMasked", () => SecretKeyInsideArrayIsMasked());
        failures += RunCase("ContainerAuthKeyIsMaskedWhole", ContainerAuthKeyIsMaskedWhole);
        failures += RunCase("CredentialProviderAndActionStayVisible", CredentialProviderAndActionStayVisible);
        failures += RunCase("PlainStringAuthorizationIsScrubbed", PlainStringAuthorizationIsScrubbed);
        failures += RunCase("PlainStringPasswordPairIsScrubbed", PlainStringPasswordPairIsScrubbed);
        failures += RunCase("PlainStringWithoutSecretsUnchanged", PlainStringWithoutSecretsUnchanged);
        failures += RunCase("AuthorKeyStaysVisible", AuthorKeyStaysVisible);
        failures += RunCase("PlainStringAccountKeyIsScrubbed", PlainStringAccountKeyIsScrubbed);
        failures += RunCase("JsonValuePasswordPairIsScrubbed", JsonValuePasswordPairIsScrubbed);
        failures += RunCase("AccountKeyJsonKeyIsMasked", AccountKeyJsonKeyIsMasked);
        failures += RunCase("TruncationLimitsUnchanged", TruncationLimitsUnchanged);
        return failures;
    }

    private static void PasswordKeyIsMasked()
    {
        var value = new Dictionary<string, object?> { ["password"] = "hunter2" };

        AssertEqual("""{"password":"[REDACTED]"}""", Log(value));
    }

    private static void NestedSecretKeysAreMasked()
    {
        var value = new Dictionary<string, object?>
        {
            ["request"] = new Dictionary<string, object?> { ["apiKey"] = "sk-live-1234", ["headerName"] = "X-Api-Key" }
        };

        AssertEqual("""{"request":{"apiKey":"[REDACTED]","headerName":"X-Api-Key"}}""", Log(value));
    }

    private static void ConnectionStringKeyIsMasked()
    {
        var value = new Dictionary<string, object?> { ["ConnectionString"] = "DefaultEndpointsProtocol=https;AccountKey=abc123" };

        AssertEqual("""{"ConnectionString":"[REDACTED]"}""", Log(value));
    }

    private static void JsonElementSecretKeyIsMasked()
    {
        using var document = JsonDocument.Parse("""{"clientSecret":"s3cr3t-value","provider":"github"}""");

        var logged = Log(document.RootElement);

        AssertTrue(!logged.Contains("s3cr3t-value"), logged);
        AssertTrue(logged.Contains("\"provider\":\"github\""), logged);
    }

    private static void SecretKeyInsideArrayIsMasked()
    {
        var value = new List<object?> { new Dictionary<string, object?> { ["accessToken"] = "ghp_secret" } };

        AssertEqual("""[{"accessToken":"[REDACTED]"}]""", Log(value));
    }

    private static void ContainerAuthKeyIsMaskedWhole()
    {
        var value = new Dictionary<string, object?>
        {
            ["authentication"] = new Dictionary<string, object?> { ["type"] = "basic", ["password"] = "hunter2" }
        };

        var logged = Log(value);

        AssertTrue(!logged.Contains("hunter2"), logged);
        AssertTrue(logged.Contains("\"authentication\":\"[REDACTED]\""), logged);
    }

    private static void CredentialProviderAndActionStayVisible()
    {
        var value = new Dictionary<string, object?>
        {
            ["credentialName"] = "GitHub PAT",
            ["provider"] = "github",
            ["action"] = "ApiIssuesList"
        };

        AssertEqual("""{"credentialName":"GitHub PAT","provider":"github","action":"ApiIssuesList"}""", Log(value));
    }

    private static void PlainStringAuthorizationIsScrubbed()
    {
        var logged = Log("request to upstream failed with Authorization: Bearer ghp_live_token123");

        AssertTrue(!logged.Contains("ghp_live_token123"), logged);
        AssertTrue(logged.Contains(Placeholder), logged);
    }

    private static void PlainStringPasswordPairIsScrubbed()
    {
        var logged = Log("connect failed (password=hunter2, retry=0)");

        AssertTrue(!logged.Contains("hunter2"), logged);
        AssertTrue(logged.Contains("retry=0"), logged);
    }

    private static void PlainStringWithoutSecretsUnchanged()
    {
        const string status = "400:Credential 'GitHub PAT' was not found.";

        AssertEqual(status, Log(status));
    }

    private static void AuthorKeyStaysVisible()
    {
        var value = new Dictionary<string, object?> { ["author"] = "John Smith" };

        AssertEqual("""{"author":"John Smith"}""", Log(value));
    }

    private static void PlainStringAccountKeyIsScrubbed()
    {
        var logged = Log("DefaultEndpointsProtocol=https;AccountKey=az-secret-value;AccountName=acct");

        AssertTrue(!logged.Contains("az-secret-value"), logged);
        AssertTrue(logged.Contains("AccountName=acct"), logged);
    }

    private static void JsonValuePasswordPairIsScrubbed()
    {
        var value = new Dictionary<string, object?>
        {
            ["note"] = "connect failed (password=hunter2, retry=0)"
        };

        var logged = Log(value);

        AssertTrue(!logged.Contains("hunter2"), logged);
        AssertTrue(logged.Contains("retry=0"), logged);
    }

    private static void AccountKeyJsonKeyIsMasked()
    {
        var value = new Dictionary<string, object?> { ["accountKey"] = "az-secret-value" };

        AssertEqual("""{"accountKey":"[REDACTED]"}""", Log(value));
    }

    private static void TruncationLimitsUnchanged()
    {
        var logged = Log(new string('x', 400));

        AssertEqual(255 + "...".Length, logged.Length);
        AssertTrue(logged.EndsWith("..."));
    }

    private static string Log(object? value) => NodeLogHelper.ConvertValueForLogging(Key, value, InOrOut);
}
