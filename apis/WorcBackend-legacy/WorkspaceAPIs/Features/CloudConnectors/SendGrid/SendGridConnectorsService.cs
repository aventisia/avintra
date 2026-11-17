using SendGrid;
using SendGrid.Helpers.Mail;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.SendGrid;

public class SendGridConnectorsService : ISendGridConnectorsService
{
    private readonly ILogger<SendGridConnectorsService> _logger;
    private readonly ICloudConnectorsVaultCredentialService _cloudConnectorsVaultCredentialService;

    public SendGridConnectorsService(
        ILogger<SendGridConnectorsService> logger,
        ICloudConnectorsVaultCredentialService cloudConnectorsVaultCredentialService)
    {
        _logger = logger;
        _cloudConnectorsVaultCredentialService = cloudConnectorsVaultCredentialService;
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
        string? apiKey = null;
        try
        {
            //Get the decrypted SendGrid API Key from Vault
            var (resolvedApiKey, credentialFailure) = await GetSendGridApiKeyAsync(cloudConnectorReqDto.CredentialName);
            apiKey = resolvedApiKey;
            if (apiKey == null)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = credentialFailure;
                serviceResponse.Data.Response = credentialFailure;
                return serviceResponse;
            }

            // Extract email parameters from payload
            var payload = cloudConnectorReqDto.Payload;

            if (!payload.TryGetValue("to", out object? toEmailObj) || toEmailObj == null)
                throw new ArgumentException("'to' is required in payload.");

            if (!payload.TryGetValue("subject", out object? subjectObj) || subjectObj == null)
                throw new ArgumentException("'subject' is required in payload.");

            if (!payload.TryGetValue("body", out object? bodyObj) || bodyObj == null)
                throw new ArgumentException("'body' is required in payload.");

            if (!payload.TryGetValue("from", out object? fromObj) || fromObj == null)
                throw new ArgumentException("'from' is required in payload.");

            string toEmail = toEmailObj.ToString()!;
            string fromEmail = fromObj.ToString()!;
            string subject = subjectObj.ToString()!;
            string body = bodyObj.ToString()!;

            string? fromName = payload.TryGetValue("fromName", out var fromNameObj) ? fromNameObj?.ToString() : null;
            string? ccEmail = payload.TryGetValue("cc", out var ccEmailObj) ? ccEmailObj?.ToString() : null;
            string? bccEmail = payload.TryGetValue("bcc", out var bccEmailObj) ? bccEmailObj?.ToString() : null;

            // Send the email using the API key
            var (sendSuccess, upstreamStatusCode) = await SendEmailAsync(credentialName: cloudConnectorReqDto.CredentialName,
                toEmail: toEmail, subject: subject, body: body, fromEmail: fromEmail,
                fromName: fromName, ccEmail: ccEmail, bccEmail: bccEmail);

            // success response
            if (sendSuccess)
            {
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "SendGrid connector invoked successfully.";
                serviceResponse.Data.Response = "Email sent successfully.";
            }
            else if (upstreamStatusCode is 401 or 403)
            {
                _logger.LogWarning("SendGrid rejected credential {CredentialName} with status {StatusCode}.", CloudConnectorLogRedactor.SanitizeForLog(cloudConnectorReqDto.CredentialName), upstreamStatusCode);
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = CredentialResolution.ToLogMessage(
                    CredentialResolutionReason.RejectedUpstream,
                    cloudConnectorReqDto.CredentialName,
                    CloudConnectorLogRedactor.RedactProviderReason($"SendGrid returned {upstreamStatusCode}.", apiKey));
                serviceResponse.Data.Response = serviceResponse.Message;
            }
            else
            {
                serviceResponse.StatusCode = 500;
                serviceResponse.Message = "Failed to send email.";
                serviceResponse.Data.Response = "Email sending failed. Check logs for details.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking SendGrid connector.");
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {CloudConnectorLogRedactor.RedactProviderReason(ex.Message, apiKey)}";
            serviceResponse.Data.Response = serviceResponse.Message;
        }
        return serviceResponse;
    }

    // Get sendgrid apikey from the vault credential name.
    private async Task<(string? ApiKey, string? Failure)> GetSendGridApiKeyAsync(string credentialName)
    {
        var resolution = await _cloudConnectorsVaultCredentialService.ResolveVaultCredentialAsync(credentialName);
        if (!resolution.IsSuccess)
        {
            return (null, resolution.FailureMessage);
        }

        if (resolution.Credential!.Data == null ||
            !resolution.Credential.Data.TryGetValue("ApiKey", out var apiKeyValue) ||
            string.IsNullOrWhiteSpace(apiKeyValue?.ToString()))
        {
            _logger.LogWarning("No 'ApiKey' value in vault credential Data for Name: {CredentialName}", CloudConnectorLogRedactor.SanitizeForLog(credentialName));
            return (null, CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "ApiKey"));
        }

        return (apiKeyValue!.ToString(), null);
    }


    public async Task<(bool Success, int StatusCode)> SendEmailAsync(string credentialName, string toEmail, string subject,
       string body, string fromEmail, string? fromName = null, string? ccEmail = null, string? bccEmail = null)
    {
        // 1. Get API key from vault
        var (apiKey, _) = await GetSendGridApiKeyAsync(credentialName);
        if (apiKey == null)
        {
            _logger.LogError("Unable to retrieve or decrypt SendGrid API key for Credential Name: {CredentialName}", credentialName);
            return (false, 400);
        }

        // 2. Create SendGrid client
        var client = new SendGridClient(apiKey);

        // 3. Prepare email
        var from = new EmailAddress(fromEmail, fromName ?? string.Empty);
        var to = new EmailAddress(toEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: string.Empty, htmlContent: body);

        //  Add CC/BCC
        if (!string.IsNullOrEmpty(ccEmail))
            msg.AddCc(new EmailAddress(ccEmail));
        if (!string.IsNullOrEmpty(bccEmail))
            msg.AddBcc(new EmailAddress(bccEmail));

        // 4. Send email
        try
        {
            var response = await client.SendEmailAsync(msg);
            if (response.StatusCode == System.Net.HttpStatusCode.Accepted ||
                response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return (true, (int)response.StatusCode);
            }
            else
            {
                _logger.LogError("SendGrid returned status: {StatusCode} for email to {ToEmail}", response.StatusCode, toEmail);
                return (false, (int)response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending email via SendGrid for Credential Name: {CredentialName}", credentialName);
            return (false, 500);
        }
    }
}