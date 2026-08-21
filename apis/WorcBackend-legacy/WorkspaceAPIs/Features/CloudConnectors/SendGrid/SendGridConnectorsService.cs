using SendGrid;
using SendGrid.Helpers.Mail;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.SendGrid;

public class SendGridConnectorsService : ISendGridConnectorsService
{
    private readonly ILogger<SendGridConnectorsService> _logger;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;

    public SendGridConnectorsService(
        ILogger<SendGridConnectorsService> logger,
        ICloudConnectorsVaultService cloudConnectorsVaultService)
    {
        _logger = logger;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
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
            //Get the decrypted SendGrid API Key from Vault
            string? apiKey = await GetSendGridApiKeyAsync(cloudConnectorReqDto.CredentialName);
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Data.Response = "Unable to retrieve or decrypt SendGrid API key.";
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
            bool sendSuccess = await SendEmailAsync(credentialName: cloudConnectorReqDto.CredentialName,
                toEmail: toEmail, subject: subject, body: body, fromEmail: fromEmail,
                fromName: fromName, ccEmail: ccEmail, bccEmail: bccEmail);

            // success response
            if (sendSuccess)
            {
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "SendGrid connector invoked successfully.";
                serviceResponse.Data.Response = "Email sent successfully.";
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
            serviceResponse.Message = $"Error: {ex.Message}";
            serviceResponse.Data.Response = $"Error: {ex.Message}";
        }
        return serviceResponse;
    }

    // Get sendgrid apikey from the vault credential name.
    private async Task<string?> GetSendGridApiKeyAsync(string credentialName)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName);
        if (vaultCredential == null)
        {
            _logger.LogWarning("Vault credential not found for Name: {CredentialName}", credentialName);
            return null;
        }
        if (vaultCredential.Data == null ||
            !vaultCredential.Data.TryGetValue("ApiKey", out var apiKeyValue) ||
            apiKeyValue == null)
        {
            _logger.LogWarning("No 'ApiKey' found in vault credential Data for Name: {CredentialName}", credentialName);
            return null;
        }
        string? apiKey = apiKeyValue.ToString();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("ApiKey is null or whitespace for credential Name: {CredentialName}", credentialName);
            return null;
        }

        return apiKey;
    }


    public async Task<bool> SendEmailAsync(string credentialName, string toEmail, string subject,
       string body, string fromEmail, string? fromName = null, string? ccEmail = null, string? bccEmail = null)
    {
        // 1. Get API key from vault
        var apiKey = await GetSendGridApiKeyAsync(credentialName);
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("Unable to retrieve or decrypt SendGrid API key for Credential Name: {CredentialName}", credentialName);
            return false;
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
                return true;
            }
            else
            {
                _logger.LogError("SendGrid returned status: {StatusCode} for email to {ToEmail}", response.StatusCode, toEmail);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending email via SendGrid for Credential Name: {CredentialName}", credentialName);
            return false;
        }
    }
}