using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
namespace WorkspaceAPIs.Features.CloudConnectors.Twilio;

public class TwilioConnectorsService : ITwilioConnectorsService
{
    private readonly ILogger<TwilioConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;

    public TwilioConnectorsService(ILogger<TwilioConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService, ICloudConnectorsVaultService cloudConnectorsVaultService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
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
            // Get AccountSid and AuthToken 
            var twilioCreds = await GetTwilioAccountSidAndAuthTokenAsync(cloudConnectorReqDto.CredentialId);
            if (twilioCreds == null)
            {
                _logger.LogWarning("Failed to obtain Twilio credentials for Credential ID: {CredentialId}", cloudConnectorReqDto.CredentialId);
                serviceResponse.Message = "Failed to retrieve Twilio AccountSid and AuthToken.";
                return serviceResponse;
            }

            // Convert string action to enum
            if (!Enum.TryParse<TwilioActionsEnum>(cloudConnectorReqDto.Action, true, out var twilioAction))
            {
                _logger.LogWarning("Invalid Twilio action: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = $"Unsupported Twilio action: '{cloudConnectorReqDto.Action}'. Valid actions: SendTextSms, SendWhatsappMessage, SendWhatsappTemplateMessage.";
                return serviceResponse;
            }

            // Take action as per enum
            var twilioResponse = await TakeTwilioActionAsync(twilioAction, cloudConnectorReqDto.Payload, twilioCreds.Value.AccountSid, twilioCreds.Value.AuthToken
            );

            if (twilioResponse == null)
            {
                _logger.LogWarning("Twilio action failed or returned null for action: {Action}", twilioAction);
                serviceResponse.Message = "Twilio action execution failed.";
                return serviceResponse;
            }

            // Task Success
            serviceResponse.Data.Response = twilioResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Twilio connector invoked successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Twilio connector.");
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.Message}";
            serviceResponse.Data.Response = $"Error: {ex.Message}";
        }

        return serviceResponse;
    }

    // Get twilio auth token and accountSid.
    private async Task<(string AccountSid, string AuthToken)?> GetTwilioAccountSidAndAuthTokenAsync(Guid credentialId)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialId);
        if (vaultCredential == null)
        {
            _logger.LogWarning("Vault credential not found for ID: {CredentialId}", credentialId);
            return null;
        }

        if (vaultCredential.Data == null ||
            !vaultCredential.Data.TryGetValue("AccountSid", out var sidValue) ||
            !vaultCredential.Data.TryGetValue("AuthToken", out var tokenValue))
        {
            _logger.LogWarning("No 'AccountSid' or 'AuthToken' found in vault credential Data for ID: {CredentialId}", credentialId);
            return null;
        }
        string? accountSid = sidValue?.ToString();
        string? authToken = tokenValue?.ToString();

        if (string.IsNullOrWhiteSpace(accountSid) || string.IsNullOrWhiteSpace(authToken))
        {
            _logger.LogWarning("AccountSid or AuthToken is null or whitespace for credential ID: {CredentialId}", credentialId);
            return null;
        }
        return (accountSid, authToken);
    }

    //  Take twilio actions as per the enum.
    private async Task<object?> TakeTwilioActionAsync(TwilioActionsEnum action, object payload, string accountSid, string authToken)
    {
        // Initialize Twilio client
        TwilioClient.Init(accountSid, authToken);

        // Validate payload format
        if (payload is not System.Collections.Generic.IDictionary<string, object> dict)
            return new { Error = "Invalid payload format. Expected Dictionary<string, object>." };

        // Extract required fields
        if (!dict.TryGetValue("ToNumber", out var toObj) || toObj == null)
            return new { Error = "'ToNumber' is required in payload." };
        if (!dict.TryGetValue("MessageBody", out var bodyObj) || bodyObj == null)
            return new { Error = "'MessageBody' is required in payload." };

        string toNumber = toObj.ToString() ?? string.Empty;
        string messageBody = bodyObj.ToString() ?? string.Empty;

        // Extract optional fields
        string? fromPhoneNumber = dict.TryGetValue("FromPhoneNumber", out var fromObj) ? fromObj?.ToString() : null;
        string? messagingServiceSid = dict.TryGetValue("MessagingServiceSid", out var msgSvcObj) ? msgSvcObj?.ToString() : null;
        string? templateName = dict.TryGetValue("TemplateName", out var tmplObj) ? tmplObj?.ToString() : null;
        string? templateLanguage = dict.TryGetValue("TemplateLanguage", out var langObj) ? langObj?.ToString() : null;
        string? templateParameters = dict.TryGetValue("TemplateParameters", out var paramsObj) ? paramsObj?.ToString() : null;

        try
        {
            switch (action)
            {
                case TwilioActionsEnum.SendTextSms:
                    if (string.IsNullOrEmpty(fromPhoneNumber) && string.IsNullOrEmpty(messagingServiceSid))
                        return new { Error = "Either 'FromPhoneNumber' or 'MessagingServiceSid' is required for SMS." };

                    var smsMsg = await MessageResource.CreateAsync(
                        body: messageBody,
                        from: !string.IsNullOrEmpty(fromPhoneNumber) ? new PhoneNumber(fromPhoneNumber) : null,
                        messagingServiceSid: !string.IsNullOrEmpty(messagingServiceSid) ? messagingServiceSid : null,
                        to: new PhoneNumber(toNumber)
                    );
                    return new { MessageSid = smsMsg.Sid, Status = smsMsg.Status?.ToString() };

                case TwilioActionsEnum.SendWhatsappMessage:
                    if (string.IsNullOrEmpty(fromPhoneNumber))
                        return new { Error = "'FromPhoneNumber' is required for WhatsApp messages." };

                    var waMsg = await MessageResource.CreateAsync(
                        body: messageBody,
                        from: new PhoneNumber($"whatsapp:{fromPhoneNumber}"),
                        to: new PhoneNumber($"whatsapp:{toNumber}")
                    );
                    return new { MessageSid = waMsg.Sid, Status = waMsg.Status?.ToString() };

                case TwilioActionsEnum.SendWhatsappTemplateMessage:
                    if (string.IsNullOrEmpty(templateName))
                        return new { Error = "'TemplateName' is required for WhatsApp template messages." };

                    string? contentVariables = null;
                    if (!string.IsNullOrEmpty(templateParameters))
                    {
                        var paramList = templateParameters.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        if (paramList.Length > 0)
                        {
                            var variables = string.Join(", ", paramList.Select((p, i) => $"\"{i + 1}\":\"{p}\""));
                            contentVariables = $"{{{variables}}}";
                        }
                    }
                    // Add approved number
                    var tmplMsg = await MessageResource.CreateAsync(
                        from: new PhoneNumber("whatsapp:+14155238886"),
                        to: new PhoneNumber($"whatsapp:{toNumber}"),
                        contentSid: templateName,
                        contentVariables: contentVariables
                    // Create async does not have a parameter language getting error.
                    //language: templateLanguage ?? "en"
                    );
                    return new { MessageSid = tmplMsg.Sid, Status = tmplMsg.Status?.ToString() };

                default:
                    return new { Error = $"Unsupported Twilio action: {action}" };
            }
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending twilio message");
            return new { Error = ex.Message };
        }
    }
}
