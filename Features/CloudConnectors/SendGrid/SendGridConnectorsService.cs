using SendGrid;
using SendGrid.Helpers.Mail;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.M365.SendGrid;

public class SendGridConnectorsService : ISendGridConnectorsService
{
    private readonly ILogger<SendGridConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly IStringEncryptionService _stringEncryptionService;

    public SendGridConnectorsService(
        ILogger<SendGridConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService, ICloudConnectorsVaultService cloudConnectorsVaultService,
        IStringEncryptionService stringEncryptionService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _stringEncryptionService = stringEncryptionService;

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
            string? apiKey = await GetSendGridApiKeyAsync(cloudConnectorReqDto.CredentialId);
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Data.Response = "Unable to retrieve or decrypt SendGrid API key.";
                return serviceResponse;
            }

            // Extract email parameters from payload
            var payload = cloudConnectorReqDto.Payload;

            if (!payload.TryGetValue("toEmail", out object? toEmailObj) || toEmailObj == null)
                throw new ArgumentException("'toEmail' is required in payload.");

            if (!payload.TryGetValue("subject", out object? subjectObj) || subjectObj == null)
                throw new ArgumentException("'subject' is required in payload.");

            if (!payload.TryGetValue("htmlContent", out object? htmlContentObj) || htmlContentObj == null)
                throw new ArgumentException("'htmlContent' is required in payload.");

            string toEmail = toEmailObj.ToString()!;
            string subject = subjectObj.ToString()!;
            string htmlContent = htmlContentObj.ToString()!;

            string? fromEmail = payload.TryGetValue("fromEmail", out var fromEmailObj) ? fromEmailObj?.ToString() : null;
            string? fromName = payload.TryGetValue("fromName", out var fromNameObj) ? fromNameObj?.ToString() : null;
            string? ccEmail = payload.TryGetValue("ccEmail", out var ccEmailObj) ? ccEmailObj?.ToString() : null;
            string? bccEmail = payload.TryGetValue("bccEmail", out var bccEmailObj) ? bccEmailObj?.ToString() : null;

            // Send the email using the API key
            bool sendSuccess = await SendEmailAsync(credentialId: cloudConnectorReqDto.CredentialId,
                toEmail: toEmail, subject: subject, htmlContent: htmlContent, fromEmail: fromEmail,
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
    // private async Task<string?> GetSendGridApiKeyAsync(Guid credentialId)
    // {
    //     var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialId);
    //     if (vaultCredential == null)
    //     {
    //         _logger.LogWarning("Vault credential not found for ID: {CredentialId}", credentialId);
    //         return null;
    //     }

    //     // Assuming API key is stored encrypted in vaultCredential.Data["ApiKey"]
    //     if (vaultCredential.Data == null || !vaultCredential.Data.TryGetValue("ApiKey", out var apiKeyValue))
    //     {
    //         _logger.LogWarning("No 'ApiKey' found in vault credential Data for ID: {CredentialId}", credentialId);
    //         return null;
    //     }

    //     var encryptedApiKey = apiKeyValue?.ToString();
    //     if (string.IsNullOrWhiteSpace(encryptedApiKey))
    //     {
    //         _logger.LogWarning("ApiKey value is null or empty for credential ID: {CredentialId}", credentialId);
    //         return null;
    //     }

    //     try
    //     {
    //         var decryptedApiKey = _stringEncryptionService.DecryptString(encryptedApiKey);
    //         return decryptedApiKey;
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Failed to decrypt SendGrid API key for Credential ID: {CredentialId}", credentialId);
    //         return null;
    //     }
    // }

    private async Task<string?> GetSendGridApiKeyAsync(Guid credentialId)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialId);
        if (vaultCredential == null)
        {
            _logger.LogWarning("Vault credential not found for ID: {CredentialId}", credentialId);
            return null;
        }
        if (vaultCredential.Data == null ||
            !vaultCredential.Data.TryGetValue("ApiKey", out var apiKeyValue) ||
            apiKeyValue == null)
        {
            _logger.LogWarning("No 'ApiKey' found in vault credential Data for ID: {CredentialId}", credentialId);
            return null;
        }
        string? apiKey = apiKeyValue.ToString();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("ApiKey is null or whitespace for credential ID: {CredentialId}", credentialId);
            return null;
        }

        return apiKey;
    }


    public async Task<bool> SendEmailAsync(Guid credentialId, string toEmail, string subject,
       string htmlContent, string? fromEmail = null, string? fromName = null, string? ccEmail = null, string? bccEmail = null)
    {
        // 1. Get API key from vault
        var apiKey = await GetSendGridApiKeyAsync(credentialId);
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("Unable to retrieve or decrypt SendGrid API key for Credential ID: {CredentialId}", credentialId);
            return false;
        }

        // 2. Create SendGrid client
        var client = new SendGridClient(apiKey);

        // 3. Prepare email
        var from = new EmailAddress(fromEmail ?? "aventisia.com", fromName ?? "Your App");
        var to = new EmailAddress(toEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: "", htmlContent: htmlContent);

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
                _logger.LogInformation("Email sent successfully to {ToEmail} using Credential ID: {CredentialId}", toEmail, credentialId);
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
            _logger.LogError(ex, "Exception while sending email via SendGrid for Credential ID: {CredentialId}", credentialId);
            return false;
        }
    }


}
