using System.Net;
using System.Reflection;
using NodeLibrary.CloudConnectorNodes;
using NodeLibrary.Core;
using WorkspaceAPIs.Features.CloudConnectors;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;
using static ExecutorLibrary.Tests.TestHarness;

namespace ExecutorLibrary.Tests.FlowProcessor;

/// <summary>
/// Coverage for the cloud-connector authentication failure messages, the log redactor, and the
/// built-in connector node's error status.
/// </summary>
public static class CloudConnectorAuthErrorsTestHarness
{
    public static int Run()
    {
        var failures = 0;

        failures += RunCase("CredentialNotFoundNamesCredential", CredentialNotFoundNamesCredential);
        failures += RunCase("CredentialDisabledSaysDisabled", CredentialDisabledSaysDisabled);
        failures += RunCase("CredentialNoAccessSaysNoAccess", CredentialNoAccessSaysNoAccess);
        failures += RunCase("CredentialMissingValueNamesField", CredentialMissingValueNamesField);
        failures += RunCase("CredentialRejectedStatesRejection", CredentialRejectedStatesRejection);
        failures += RunCase("CredentialRejectedWithoutDetailOmitsColon", CredentialRejectedWithoutDetailOmitsColon);
        failures += RunCase("CredentialUnavailableSaysCouldNotRetrieve", CredentialUnavailableSaysCouldNotRetrieve);
        failures += RunCase("ResolutionFailureCarriesReasonAndMessage", ResolutionFailureCarriesReasonAndMessage);
        failures += RunCase("ResolutionSuccessCarriesCredential", ResolutionSuccessCarriesCredential);
        failures += RunCase("RedactRemovesEchoedSecret", RedactRemovesEchoedSecret);
        failures += RunCase("RedactKeepsNamesVisible", RedactKeepsNamesVisible);
        failures += RunCase("RedactIgnoresValuesShorterThanFour", RedactIgnoresValuesShorterThanFour);
        failures += RunCase("RedactIgnoresEmptySecret", RedactIgnoresEmptySecret);
        failures += RunCase("ProviderReasonCollapsesWhitespace", ProviderReasonCollapsesWhitespace);
        failures += RunCase("ProviderReasonTruncatesToTwoHundred", ProviderReasonTruncatesToTwoHundred);
        failures += RunCase("ProviderReasonScrubsAuthorizationHeader", ProviderReasonScrubsAuthorizationHeader);
        failures += RunCase("ProviderReasonScrubsJsonSecretKey", ProviderReasonScrubsJsonSecretKey);
        failures += RunCase("ProviderReasonRemovesKnownSecret", ProviderReasonRemovesKnownSecret);
        failures += RunCase("CustomToolQueryApiKeyEchoIsRedacted", CustomToolQueryApiKeyEchoIsRedacted);
        failures += RunCase("CamelHarnessBodySecretIsRedacted", CamelHarnessBodySecretIsRedacted);
        failures += RunCase("CamelHarnessPlainUrlStaysVisible", CamelHarnessPlainUrlStaysVisible);
        failures += RunCase("CamelHarnessCredentialUrlIsSecret", CamelHarnessCredentialUrlIsSecret);
        failures += RunCase("CorsairNeedsConnectSecretIsRedacted", CorsairNeedsConnectSecretIsRedacted);
        failures += RunCase("AzureGenericErrorRedactsConnectionString", AzureGenericErrorRedactsConnectionString);
        failures += RunCase("AzurePartialAccountKeyIsScrubbed", AzurePartialAccountKeyIsScrubbed);
        failures += RunCase("ProviderReasonKeepsAccountIdentifier", ProviderReasonKeepsAccountIdentifier);
        failures += RunCase("NodeErrorStatusExtractsEnvelopeMessage", NodeErrorStatusExtractsEnvelopeMessage);
        failures += RunCase("NodeErrorStatusKeepsPlainTextMessage", NodeErrorStatusKeepsPlainTextMessage);
        failures += RunCase("NodeErrorStatusScrubsPlainTextSecret", NodeErrorStatusScrubsPlainTextSecret);
        failures += RunCase("NodeErrorStatusWithoutBody", NodeErrorStatusWithoutBody);
        failures += RunCase("NodeErrorStatusCapsHugePlainTextDetail", NodeErrorStatusCapsHugePlainTextDetail);
        failures += RunCase("NodeErrorStatusWithoutAuthenticationDetail", NodeErrorStatusWithoutAuthenticationDetail);
        failures += RunCase("CorsairPlainTextReasonIsPreserved", CorsairPlainTextReasonIsPreserved);
        failures += RunCase("CorsairPlainTextDisabledIsPreserved", CorsairPlainTextDisabledIsPreserved);
        failures += RunCase("CorsairPlainTextNoAccessIsPreserved", CorsairPlainTextNoAccessIsPreserved);
        failures += RunCase("ConnectorNodeNormalizesSchemeLessBaseUrl", ConnectorNodeNormalizesSchemeLessBaseUrl);
        failures += RunCase("ConnectorNodeKeepsExplicitSchemeAndTrailingSlash", ConnectorNodeKeepsExplicitSchemeAndTrailingSlash);
        failures += RunCase("ConnectorNodeRejectsMissingCredential", ConnectorNodeRejectsMissingCredential);
        failures += RunCase("ConnectorNodeRejectsMissingProviderOrAction", ConnectorNodeRejectsMissingProviderOrAction);
        failures += RunCase("SanitizeForLogKeepsBenignNameByteIdentical", SanitizeForLogKeepsBenignNameByteIdentical);
        failures += RunCase("SanitizeForLogStripsCrLfVariants", SanitizeForLogStripsCrLfVariants);
        failures += RunCase("SanitizeForLogNullGoesEmpty", SanitizeForLogNullGoesEmpty);

        return failures;
    }

    private static void CredentialNotFoundNamesCredential()
    {
        AssertEqual(
            "Credential 'GitHub PAT' was not found.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.NotFound, "GitHub PAT"));
    }

    private static void CredentialDisabledSaysDisabled()
    {
        AssertEqual(
            "Credential 'GitHub PAT' is disabled.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.Disabled, "GitHub PAT"));
    }

    private static void CredentialNoAccessSaysNoAccess()
    {
        AssertEqual(
            "You do not have access to credential 'GitHub PAT'.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.NoAccess, "GitHub PAT"));
    }

    private static void CredentialMissingValueNamesField()
    {
        AssertEqual(
            "Credential 'SendGrid' has no 'ApiKey' value.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, "SendGrid", "ApiKey"));
    }

    private static void CredentialRejectedStatesRejection()
    {
        AssertEqual(
            "The external system rejected credential 'SendGrid': Bad credentials.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.RejectedUpstream, "SendGrid", "Bad credentials"));
    }

    private static void CredentialRejectedWithoutDetailOmitsColon()
    {
        AssertEqual(
            "The external system rejected credential 'SendGrid'.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.RejectedUpstream, "SendGrid", "   "));
    }

    private static void CredentialUnavailableSaysCouldNotRetrieve()
    {
        AssertEqual(
            "Credential 'SendGrid' could not be retrieved.",
            CredentialResolution.ToLogMessage(CredentialResolutionReason.Unavailable, "SendGrid"));
    }

    private static void ResolutionFailureCarriesReasonAndMessage()
    {
        var resolution = CredentialResolution.Failure(CredentialResolutionReason.Disabled, "SendGrid");

        AssertTrue(!resolution.IsSuccess);
        AssertTrue(resolution.Credential is null);
        AssertEqual(CredentialResolutionReason.Disabled, resolution.Reason);
        AssertEqual("Credential 'SendGrid' is disabled.", resolution.FailureMessage);
    }

    private static void ResolutionSuccessCarriesCredential()
    {
        var credential = new VaultCredentialObj
        {
            Name = "SendGrid",
            Data = new Dictionary<string, object> { ["ApiKey"] = "SG.secret-value" }
        };

        var resolution = CredentialResolution.Succeeded(credential);

        AssertTrue(resolution.IsSuccess);
        AssertEqual(credential, resolution.Credential);
        AssertTrue(resolution.FailureMessage is null);
    }

    private static void RedactRemovesEchoedSecret()
    {
        const string secret = "SG.revoked-secret-value";
        var message = $"The external system rejected credential 'SendGrid': {secret}";

        var redacted = CloudConnectorLogRedactor.Redact(message, secret);

        AssertTrue(!redacted.Contains(secret));
        AssertTrue(redacted.Contains("[REDACTED]"));
    }

    private static void RedactKeepsNamesVisible()
    {
        var message = "Credential 'SendGrid' has no 'ApiKey' value.";

        AssertEqual(message, CloudConnectorLogRedactor.Redact(message, "SG.secret-value"));
    }

    private static void RedactIgnoresValuesShorterThanFour()
    {
        var message = "Upstream said ab1 twice for ab1.";

        AssertEqual(message, CloudConnectorLogRedactor.Redact(message, "ab1"));
    }

    private static void RedactIgnoresEmptySecret()
    {
        var message = "No todo over the ledger.";

        AssertEqual(message, CloudConnectorLogRedactor.Redact(message, null, "", "  "));
    }

    private static void ProviderReasonCollapsesWhitespace()
    {
        var reason = CloudConnectorLogRedactor.RedactProviderReason("invalid_client\n\n  AADSTS7000215 ");

        AssertEqual("invalid_client AADSTS7000215", reason);
    }

    private static void ProviderReasonTruncatesToTwoHundred()
    {
        var reason = CloudConnectorLogRedactor.RedactProviderReason(new string('x', 500));

        AssertEqual(203, reason.Length);
        AssertTrue(reason.EndsWith("..."));
    }

    private static void ProviderReasonScrubsAuthorizationHeader()
    {
        var reason = CloudConnectorLogRedactor.RedactProviderReason("request failed for Authorization: Bearer sk-live-123456");

        AssertTrue(!reason.Contains("sk-live-123456"), reason);
        AssertTrue(reason.Contains("[REDACTED]"), reason);
    }

    private static void ProviderReasonScrubsJsonSecretKey()
    {
        var reason = CloudConnectorLogRedactor.RedactProviderReason("""{"access_token":"abc123token","message":"expired_key"}""");

        AssertTrue(!reason.Contains("abc123token"), reason);
        AssertTrue(reason.Contains("expired_key"), reason);
    }

    private static void ProviderReasonRemovesKnownSecret()
    {
        var reason = CloudConnectorLogRedactor.RedactProviderReason(
            "upstream echoed SG.revoked-secret-value in the body",
            "SG.revoked-secret-value");

        AssertTrue(!reason.Contains("SG.revoked-secret-value"), reason);
    }

    private static void CustomToolQueryApiKeyEchoIsRedacted()
    {
        const string apiKey = "k3y+abc/def=";
        var escapedKey = Uri.EscapeDataString(apiKey);
        var reason = $"Invalid key: https://api.example.com/items?key={escapedKey}&page=2";

        var message = CredentialResolution.ToLogMessage(
            CredentialResolutionReason.RejectedUpstream,
            "Stripe key",
            CloudConnectorLogRedactor.RedactProviderReason(reason, CloudConnectorLogRedactor.WithEscapedForms(apiKey)));

        AssertTrue(!message.Contains(escapedKey), message);
        AssertTrue(!message.Contains(apiKey), message);
        AssertTrue(message.Contains("[REDACTED]"), message);
        AssertTrue(message.Contains("credential 'Stripe key'"), message);
    }

    private static void CamelHarnessBodySecretIsRedacted()
    {
        const string token = "camel-harness-secret-value";
        var structuredRequest = new Dictionary<string, object?>
        {
            ["authentication"] = new Dictionary<string, object?>
            {
                ["type"] = "accessToken",
                ["credential"] = new Dictionary<string, object?>
                {
                    ["name"] = "GitHub PAT",
                    ["value"] = new Dictionary<string, object?> { ["token"] = token }
                }
            }
        };

        var secrets = CamelConnectorService.HarnessSecretValues(structuredRequest);
        var message = CredentialResolution.ToLogMessage(
            CredentialResolutionReason.RejectedUpstream,
            "GitHub PAT",
            CloudConnectorLogRedactor.RedactProviderReason(
                $"{{\"error\":{{\"message\":\"harness rejected token {token}\"}}}}", secrets));

        AssertTrue(!message.Contains(token), message);
        AssertTrue(message.Contains("harness rejected token"), message);
        AssertTrue(message.Contains("credential 'GitHub PAT'"), message);
        AssertTrue(secrets.Contains(token), string.Join(",", secrets));
    }

    private static void CamelHarnessPlainUrlStaysVisible()
    {
        var structuredRequest = new Dictionary<string, object?>
        {
            ["authentication"] = new Dictionary<string, object?>
            {
                ["type"] = "database",
                ["credential"] = new Dictionary<string, object?>
                {
                    ["value"] = new Dictionary<string, object?>
                    {
                        ["properties"] = new Dictionary<string, object?>
                        {
                            ["url"] = "https://api.example.com/v1",
                            ["password"] = "db-password-value"
                        }
                    }
                }
            }
        };

        var secrets = CamelConnectorService.HarnessSecretValues(structuredRequest);

        AssertTrue(!secrets.Contains("https://api.example.com/v1"), string.Join(",", secrets));
        AssertTrue(secrets.Contains("db-password-value"), string.Join(",", secrets));
    }

    private static void CamelHarnessCredentialUrlIsSecret()
    {
        const string url = "postgresql://user:pass@db.internal:5432/app";
        var structuredRequest = new Dictionary<string, object?>
        {
            ["authentication"] = new Dictionary<string, object?>
            {
                ["type"] = "database",
                ["credential"] = new Dictionary<string, object?>
                {
                    ["value"] = new Dictionary<string, object?>
                    {
                        ["properties"] = new Dictionary<string, object?> { ["url"] = url }
                    }
                }
            }
        };

        var secrets = CamelConnectorService.HarnessSecretValues(structuredRequest);

        AssertTrue(secrets.Contains(url), string.Join(",", secrets));
    }

    private static void CorsairNeedsConnectSecretIsRedacted()
    {
        const string secret = "corsair-api-secret-value";

        var message = CredentialResolution.ToLogMessage(
            CredentialResolutionReason.RejectedUpstream,
            "Corsair",
            CloudConnectorLogRedactor.RedactProviderReason(
                $"sidecar says the stored key '{secret}' needs reconnecting to the provider", secret));

        AssertTrue(!message.Contains(secret), message);
        AssertTrue(message.Contains("needs reconnecting"), message);
        AssertTrue(message.Contains("The external system rejected credential 'Corsair'"), message);
    }

    private static void AzureGenericErrorRedactsConnectionString()
    {
        const string connectionString = "DefaultEndpointsProtocol=https;AccountName=acct;AccountKey=az-secret-value;EndpointSuffix=core.windows.net";

        var message = $"Error: {CloudConnectorLogRedactor.Redact($"Unable to parse '{connectionString}'.", connectionString)}";

        AssertEqual("Error: Unable to parse '[REDACTED]'.", message);
    }

    private static void AzurePartialAccountKeyIsScrubbed()
    {
        var message = CloudConnectorLogRedactor.RedactProviderReason(
            "AuthenticationFailed: AccountKey=az-secret-value; AccountName=acct is not valid.");

        AssertTrue(!message.Contains("az-secret-value"), message);
        AssertTrue(message.Contains("AccountName=acct"), message);
    }

    private static void ProviderReasonKeepsAccountIdentifier()
    {
        var message = CloudConnectorLogRedactor.RedactProviderReason(
            "Twilio rejected request for account AC00000000000000000000000000000000.",
            "auth-token-value");

        AssertTrue(message.Contains("AC00000000000000000000000000000000"), message);
        AssertTrue(!message.Contains("auth-token-value"), message);
    }

    private static void NodeErrorStatusExtractsEnvelopeMessage()
    {
        const string body = """{"data":null,"statusCode":400,"message":"Credential 'SendGrid' was not found."}""";

        var status = ConnectorNodeErrors.BuildErrorStatus(HttpStatusCode.BadRequest, body);

        AssertTrue(status.Contains("Credential 'SendGrid' was not found."), status);
        AssertTrue(status.Contains("HTTP 400"), status);
    }

    private static void NodeErrorStatusKeepsPlainTextMessage()
    {
        var status = ConnectorNodeErrors.BuildErrorStatus(HttpStatusCode.BadRequest, "  Credential 'SendGrid' is disabled. ");

        AssertTrue(status.Contains("Credential 'SendGrid' is disabled."), status);
        AssertTrue(status.Contains("HTTP 400"), status);
    }

    private static void NodeErrorStatusScrubsPlainTextSecret()
    {
        var status = ConnectorNodeErrors.BuildErrorStatus(
            HttpStatusCode.InternalServerError,
            "call failed for https://api.example.com/items?api_key=super-secret-value");

        AssertTrue(!status.Contains("super-secret-value"), status);
        AssertTrue(status.Contains("[REDACTED]"), status);
    }

    private static void NodeErrorStatusWithoutBody()
    {
        AssertEqual(
            "Error: Connector request failed with HTTP 503 (ServiceUnavailable).",
            ConnectorNodeErrors.BuildErrorStatus(HttpStatusCode.ServiceUnavailable, "   "));
    }

    private static void NodeErrorStatusCapsHugePlainTextDetail()
    {
        var status = ConnectorNodeErrors.BuildErrorStatus(HttpStatusCode.InternalServerError, new string('x', 5000));

        AssertTrue(status.Contains("HTTP 500"), status);
        AssertTrue(status.Length < 700, status.Length.ToString());
    }

    private static void NodeErrorStatusWithoutAuthenticationDetail()
    {
        const string body = """{"data":null,"statusCode":502,"message":"Camel connector 'sql' returned 502."}""";

        var status = ConnectorNodeErrors.BuildErrorStatus(HttpStatusCode.BadGateway, body);

        AssertTrue(status.Contains("Camel connector 'sql' returned 502."), status);
        AssertTrue(!status.Contains("REDACTED"), status);
    }

    private static void CorsairPlainTextReasonIsPreserved()
    {
        AssertEqual(
            "Error: Corsair request failed with HTTP 400 (BadRequest): Credential 'Corsair Mail' was not found.",
            ConnectorNodeErrors.BuildErrorStatus(
                HttpStatusCode.BadRequest,
                "  Credential 'Corsair Mail' was not found. ",
                "Corsair"));
    }

    private static void CorsairPlainTextDisabledIsPreserved()
    {
        AssertEqual(
            "Error: Corsair request failed with HTTP 400 (BadRequest): Credential 'Corsair Mail' is disabled.",
            ConnectorNodeErrors.BuildErrorStatus(
                HttpStatusCode.BadRequest,
                "Credential 'Corsair Mail' is disabled.",
                "Corsair"));
    }

    private static void CorsairPlainTextNoAccessIsPreserved()
    {
        AssertEqual(
            "Error: Corsair request failed with HTTP 400 (BadRequest): You do not have access to credential 'Corsair Mail'.",
            ConnectorNodeErrors.BuildErrorStatus(
                HttpStatusCode.BadRequest,
                "You do not have access to credential 'Corsair Mail'.",
                "Corsair"));
    }

    private static void ConnectorNodeNormalizesSchemeLessBaseUrl()
    {
        AssertEqual(
            "https://wt1-avintra.aventisia.com/workspace/api/cloud-connector/sendgrid/invoke",
            BuildConnectorApiUrl("wt1-avintra.aventisia.com", "SendGrid"));
    }

    private static void ConnectorNodeKeepsExplicitSchemeAndTrailingSlash()
    {
        AssertEqual(
            "https://wt1-avintra.aventisia.com/workspace/api/cloud-connector/sendgrid/invoke",
            BuildConnectorApiUrl("https://wt1-avintra.aventisia.com/", "sendgrid"));
        AssertEqual(
            "http://host:8080/workspace/api/cloud-connector/email/invoke",
            BuildConnectorApiUrl("http://host:8080", "email"));
    }

    private static void ConnectorNodeRejectsMissingCredential()
    {
        var provider = new InArgument<string>("SendGrid");
        var action = new InArgument<string>("SendEmailThroughSendGrid");
        const string expected = "Error: No credential is selected for this connector step.";

        AssertNodeRejects(provider, action, null, expected);
        AssertNodeRejects(provider, action, new InArgument<string>(string.Empty), expected);
        AssertNodeRejects(provider, action, new InArgument<string>("   "), expected);
    }

    private static void ConnectorNodeRejectsMissingProviderOrAction()
    {
        var credentialName = new InArgument<string>("SendGrid");
        const string expected = "Error: No connector provider or action is selected for this connector step.";

        AssertNodeRejects(null, new InArgument<string>("SendEmailThroughSendGrid"), credentialName, expected);
        AssertNodeRejects(new InArgument<string>("SendGrid"), null, credentialName, expected);
        AssertNodeRejects(new InArgument<string>("SendGrid"), new InArgument<string>("  "), credentialName, expected);
    }

    private static void AssertNodeRejects(
        InArgument<string>? provider,
        InArgument<string>? action,
        InArgument<string>? credentialName,
        string expectedStatus)
    {
        var node = new ProcessConnectorRequestNode
        {
            Provider = provider!,
            Action = action!,
            CredentialName = credentialName!,
            Payload = new InArgument<string>("{}"),
            FlowMetadata = new InArgument<FlowMetadata>(new FlowMetadata()),
            JobContext = new InArgument<JobContext>(new JobContext()),
            CallerContext = new InArgument<CallerContext>(new CallerContext()),
            IsSuccess = new OutArgument<bool>(),
            StatusMessage = new OutArgument<string>()
        };

        var context = new NodeContext();
        if (InternalExecuteAsyncMethod.Invoke(node, new object[] { context }) is not Task task)
            throw new InvalidOperationException("InternalExecuteAsync did not return a Task.");
        task.GetAwaiter().GetResult();

        AssertEqual(false, node.IsSuccess.Get(context));
        AssertEqual(expectedStatus, node.StatusMessage.Get(context));
    }

    private static void SanitizeForLogKeepsBenignNameByteIdentical()
    {
        AssertEqual("GitHub PAT", CloudConnectorLogRedactor.SanitizeForLog("GitHub PAT"));
        AssertEqual(
            "Credential 'SendGrid' has no 'ApiKey' value.",
            CloudConnectorLogRedactor.SanitizeForLog("Credential 'SendGrid' has no 'ApiKey' value."));

        var longName = new string('n', 300);
        AssertEqual(longName, CloudConnectorLogRedactor.SanitizeForLog(longName));
    }

    private static void SanitizeForLogStripsCrLfVariants()
    {
        AssertEqual("a b", CloudConnectorLogRedactor.SanitizeForLog("a\rb"));
        AssertEqual("a b", CloudConnectorLogRedactor.SanitizeForLog("a\nb"));
        AssertEqual("a  b", CloudConnectorLogRedactor.SanitizeForLog("a\r\nb"));
        AssertEqual(
            "Credential 'a b' was not found. b",
            CloudConnectorLogRedactor.SanitizeForLog("Credential 'a\nb' was not found.\nb"));
    }

    private static void SanitizeForLogNullGoesEmpty()
    {
        AssertEqual(string.Empty, CloudConnectorLogRedactor.SanitizeForLog(null));
        AssertEqual(string.Empty, CloudConnectorLogRedactor.SanitizeForLog(string.Empty));
    }

    private static readonly MethodInfo BuildApiUrlMethod = typeof(ProcessConnectorRequestNode)
        .GetMethod("BuildApiUrl", BindingFlags.NonPublic | BindingFlags.Static)
        ?? throw new InvalidOperationException("BuildApiUrl was not found on ProcessConnectorRequestNode.");

    private static readonly MethodInfo InternalExecuteAsyncMethod = typeof(BaseNode)
        .GetMethod("InternalExecuteAsync", BindingFlags.Instance | BindingFlags.NonPublic)
        ?? throw new InvalidOperationException("InternalExecuteAsync was not found on BaseNode.");

    private static string BuildConnectorApiUrl(string baseUrl, string? provider) =>
        (string)BuildApiUrlMethod.Invoke(null, new object?[] { baseUrl, provider })!;
}
