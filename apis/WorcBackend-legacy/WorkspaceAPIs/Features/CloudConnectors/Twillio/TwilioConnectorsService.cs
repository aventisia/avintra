using Microsoft.CSharp.RuntimeBinder;
using Twilio;
using Twilio.Exceptions;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
namespace WorkspaceAPIs.Features.CloudConnectors.Twilio;

public class TwilioConnectorsService : ITwilioConnectorsService
{
    private readonly ILogger<TwilioConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    private readonly ICloudConnectorsVaultCredentialService _cloudConnectorsVaultCredentialService;

    public TwilioConnectorsService(ILogger<TwilioConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService, ICloudConnectorsVaultCredentialService cloudConnectorsVaultCredentialService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
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

        string? accountSid = null;
        string? authToken = null;
        try
        {
            // Get AccountSid and AuthToken 
            var twilioCredential = await GetTwilioAccountSidAndAuthTokenAsync(cloudConnectorReqDto.CredentialName);
            accountSid = twilioCredential.AccountSid;
            authToken = twilioCredential.AuthToken;
            if (twilioCredential.Failure != null)
            {
                _logger.LogWarning("Failed to obtain Twilio credentials for Credential Name: {CredentialName}", cloudConnectorReqDto.CredentialName);
                serviceResponse.Message = twilioCredential.Failure;
                return serviceResponse;
            }

            // Convert string action to enum
            if (!Enum.TryParse<TwilioActionsEnum>(cloudConnectorReqDto.Action, true, out var twilioAction))
            {
                _logger.LogWarning("Invalid Twilio action: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = $"Unsupported Twilio action: '{cloudConnectorReqDto.Action}'. Valid actions: SendTextSms, SendWhatsAppMessage, SendWhatsAppTemplateMessage.";
                return serviceResponse;
            }

            // Take action as per enum
            var twilioResponse = await TakeTwilioActionAsync(twilioAction, cloudConnectorReqDto.Payload, accountSid!, authToken!
            );

            if (twilioResponse == null)
            {
                _logger.LogWarning("Twilio action failed or returned null for action: {Action}", twilioAction);
                serviceResponse.Message = "Twilio action execution failed.";
                return serviceResponse;
            }

            // twillio response error validate
            try
            {
                //Add Error and error message using dynamic
                dynamic responseObj = twilioResponse;

                if (responseObj.Error != null && !string.IsNullOrEmpty(responseObj.Error.ToString()))
                {
                    string errorMessage = responseObj.Error.ToString();
                    _logger.LogError($"Twilio action return an error :{errorMessage}");
                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = " Twilio operation failed";
                    serviceResponse.Data.Response = twilioResponse;
                    return serviceResponse;
                }
                //  if no error ocuur show Task Success
                serviceResponse.Data.Response = twilioResponse;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Twilio connector invoked successfully.";
            }
            catch (RuntimeBinderException)
            {
                serviceResponse.Data.Response = twilioResponse;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Twilio connector invoked successfully.";
            }

        }
        catch (ApiException ex) when (ex.Status is 401 or 403)
        {
            _logger.LogWarning("Twilio rejected credential {CredentialName} with status {Status}.", cloudConnectorReqDto.CredentialName, ex.Status);
            serviceResponse.StatusCode = 400;
            serviceResponse.Message = CredentialResolution.ToLogMessage(
                CredentialResolutionReason.RejectedUpstream,
                cloudConnectorReqDto.CredentialName,
                CloudConnectorLogRedactor.RedactProviderReason(ex.Message, authToken));
            serviceResponse.Data.Response = new
            {
                Error = CloudConnectorLogRedactor.RedactProviderReason(ex.Message, authToken),
                AuthFailed = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Twilio connector.");
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {CloudConnectorLogRedactor.RedactProviderReason(ex.Message, authToken)}";
            serviceResponse.Data.Response = serviceResponse.Message;
        }

        return serviceResponse;
    }

    // Get twilio auth token and accountSid.
    private async Task<(string? AccountSid, string? AuthToken, string? Failure)> GetTwilioAccountSidAndAuthTokenAsync(string credentialName)
    {
        var resolution = await _cloudConnectorsVaultCredentialService.ResolveVaultCredentialAsync(credentialName);
        if (!resolution.IsSuccess)
        {
            return (null, null, resolution.FailureMessage);
        }

        var credentialData = resolution.Credential!.Data;
        if (credentialData == null ||
            !credentialData.TryGetValue("AccountSid", out var sidValue) ||
            !credentialData.TryGetValue("AuthToken", out var tokenValue))
        {
            var missingField = credentialData == null || !credentialData.ContainsKey("AccountSid") ? "AccountSid" : "AuthToken";
            _logger.LogWarning("No '{Field}' value in vault credential Data for Name: {CredentialName}", missingField, credentialName);
            return (null, null, CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, missingField));
        }

        string? accountSid = sidValue?.ToString();
        string? authToken = tokenValue?.ToString();

        if (string.IsNullOrWhiteSpace(accountSid))
        {
            _logger.LogWarning("AccountSid is null or whitespace for credential Name: {CredentialName}", credentialName);
            return (null, null, CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "AccountSid"));
        }

        if (string.IsNullOrWhiteSpace(authToken))
        {
            _logger.LogWarning("AuthToken is null or whitespace for credential Name: {CredentialName}", credentialName);
            return (null, null, CredentialResolution.ToLogMessage(CredentialResolutionReason.MissingValue, credentialName, "AuthToken"));
        }

        return (accountSid, authToken, null);
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

        if (!dict.TryGetValue("toNumber", out var toObj) || toObj == null)
            return new { Error = "'toNumber' is required in payload." };
        string toNumber = toObj?.ToString() ?? string.Empty;

        // Extract optional fields
        string? recipientType = dict.TryGetValue("recipientType", out var recipientTypeObj) ? recipientTypeObj?.ToString() : null;
        string? recipientTypeValue = dict.TryGetValue("recipientTypeValue", out var recipientTypeValueObj) ? recipientTypeValueObj?.ToString() : null;
        string? messagingServiceSid = dict.TryGetValue("messagingServiceSid", out var msgSvcObj) ? msgSvcObj?.ToString() : null;
        string? templateId = dict.TryGetValue("templateId", out var templateIdObj) ? templateIdObj?.ToString() : null;
        string? templateParameters = dict.TryGetValue("templateParameters", out var paramsObj) ? paramsObj?.ToString() : null;
        string? messageBody = dict.TryGetValue("messageBody", out var messageBodyObj) ? messageBodyObj?.ToString() : null;

        try
        {
            switch (action)
            {
                case TwilioActionsEnum.SendTextSms:

                    if (string.IsNullOrEmpty(recipientTypeValue))
                        return new { Error = "'recipientTypeValue' is required for SMS messages." };
                    if (string.IsNullOrEmpty(messageBody))
                        return new { Error = "'messageBody' is required in payload." };

                    // Determine the recipient type: PhoneNumber or MessagingServiceSID
                    if (recipientType == "PhoneNumber")
                    {
                        // Use a phone number as the sender
                        var smsMsg = await MessageResource.CreateAsync(
                            body: messageBody,
                            from: new PhoneNumber(recipientTypeValue),
                            to: new PhoneNumber(toNumber)
                        );

                        // Return the message SID and status
                        return new { MessageSid = smsMsg.Sid, Status = smsMsg.Status?.ToString() };
                    }
                    else if (recipientType == "MessagingServiceSID")
                    {
                        // Use a Messaging Service SID as the sender
                        var smsMsg = await MessageResource.CreateAsync(
                            body: messageBody,
                            messagingServiceSid: recipientTypeValue,
                            to: new PhoneNumber(toNumber)
                        );

                        // Return the message SID and status
                        return new { MessageSid = smsMsg.Sid, Status = smsMsg.Status?.ToString() };
                    }
                    else
                    {
                        // Handle invalid recipient type
                        throw new ArgumentException("Invalid recipient type. Must be 'PhoneNumber' or 'MessagingServiceSID'.");
                    }

                case TwilioActionsEnum.SendWhatsAppMessage:
                    if (string.IsNullOrEmpty(recipientTypeValue))
                        return new { Error = "'recipientTypeValue' is required for WhatsApp template messages." };
                    if (string.IsNullOrEmpty(messageBody))
                        return new { Error = "'messageBody' is required in payload." };

                    // Determine if recipientType is PhoneNumber or MessagingServiceSID
                    if (recipientType == "PhoneNumber")
                    {
                        // Use a phone number as the sender
                        var tmplMsg = await MessageResource.CreateAsync(
                            body: messageBody,
                            from: new PhoneNumber($"whatsapp:{recipientTypeValue}"),
                            to: new PhoneNumber($"whatsapp:{toNumber}")
                        );

                        // Return the message SID and status
                        return new { MessageSid = tmplMsg.Sid, Status = tmplMsg.Status?.ToString() };
                    }
                    else if (recipientType == "MessagingServiceSID")
                    {
                        // Use a Messaging Service SID for the sender
                        var tmplMsg = await MessageResource.CreateAsync(
                            body: messageBody,
                            messagingServiceSid: recipientTypeValue,
                            to: new PhoneNumber($"whatsapp:{toNumber}")
                        );
                        // Return the message SID and status
                        return new { MessageSid = tmplMsg.Sid, Status = tmplMsg.Status?.ToString() };
                    }
                    else
                    {
                        // Handle invalid recipient type
                        throw new ArgumentException("Invalid recipient type. Must be 'PhoneNumber' or 'MessagingServiceSID'.");
                    }

                case TwilioActionsEnum.SendWhatsAppTemplateMessage:
                    if (string.IsNullOrEmpty(templateId))
                        return new { Error = "'templateId' is required for WhatsApp template messages." };
                    if (string.IsNullOrEmpty(recipientTypeValue))
                        return new { Error = "'tecipientTypeValue' is required for WhatsApp template messages." };

                    string? contentVariables = null;
                    if (!string.IsNullOrEmpty(templateParameters))
                    {
                        // Split the input templateParameters by commas and remove empty entries and trim spaces
                        var paramList = templateParameters.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        if (paramList.Length > 0)
                        {
                            // Create a dictionary with parameter index as key and parameter value as the value
                            var parametersDict = paramList.Select((param, index) => new KeyValuePair<string, string>((index + 1).ToString(), param)).ToDictionary(kv => kv.Key, kv => kv.Value);
                            contentVariables = JsonConvert.SerializeObject(parametersDict, Formatting.Indented);
                        }
                    }

                    // Determine if recipientType is PhoneNumber or MessagingServiceSID
                    if (recipientType == "PhoneNumber")
                    {
                        // Use a phone number as the sender
                        var tmplMsg = await MessageResource.CreateAsync(
                            from: new PhoneNumber($"whatsapp:{recipientTypeValue}"),
                            to: new PhoneNumber($"whatsapp:{toNumber}"),
                            contentSid: templateId,
                            contentVariables: contentVariables
                        // language: templateLanguage ?? "en"
                        );

                        // Return the message SID and status
                        return new { MessageSid = tmplMsg.Sid, Status = tmplMsg.Status?.ToString() };
                    }
                    else if (recipientType == "MessagingServiceSID")
                    {
                        // Use a Messaging Service SID for the sender
                        var tmplMsg = await MessageResource.CreateAsync(
                            messagingServiceSid: recipientTypeValue,
                            to: new PhoneNumber($"whatsapp:{toNumber}"),
                            contentSid: templateId,
                            contentVariables: contentVariables
                        // language: templateLanguage ?? "en"
                        );

                        // Return the message SID and status
                        return new { MessageSid = tmplMsg.Sid, Status = tmplMsg.Status?.ToString() };
                    }
                    else
                    {
                        // Handle invalid recipient type
                        throw new ArgumentException("Invalid recipient type. Must be 'PhoneNumber' or 'MessagingSID'.");
                    }
                default:
                    return new { Error = $"Unsupported Twilio action: {action}" };
            }
        }

        catch (ApiException ex) when (ex.Status is 401 or 403)
        {
            // IMPORTANT NOTE: a rejected credential must reach the invoke path, which alone knows the
            // credential name needed for the execution-log message.
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending twilio message");
            return new { Error = CloudConnectorLogRedactor.RedactProviderReason(ex.Message, authToken) };
        }
    }
}
