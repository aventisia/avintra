namespace WorkspaceAPIs.Features.CloudConnectors.M365.Outlook;

public class M365OutlookConnectorsService : IM365OutlookConnectorsService
{
    private readonly ILogger<M365OutlookConnectorsService> _logger;

    private readonly IM365ConnectorsService _m365ConnectorsService;

    public M365OutlookConnectorsService(
        ILogger<M365OutlookConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
    }

    /// <summary>
    /// Entry point for invoking M365 Outlook cloud connector actions
    /// </summary>
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Validate Enum
            if (!Enum.TryParse<M365OutlookActionsEnum>(
                    cloudConnectorReqDto.Action,
                    true,
                    out var parsedAction))
            {
                _logger.LogWarning("Invalid Outlook action: {Action}", cloudConnectorReqDto.Action);

                serviceResponse.Message = "Invalid Outlook action.";
                return serviceResponse;
            }

            // Get Access Token
            var accessToken = await _m365ConnectorsService
                    .GetM365AccessTokenAsync(cloudConnectorReqDto.CredentialId);

            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Access token retrieval failed.");
                serviceResponse.Message = "Failed to obtain M365 access token.";
                return serviceResponse;
            }

            var payload = cloudConnectorReqDto.Payload ?? new Dictionary<string, object>();

            var result = await TakeM365OutlookActionAsync(parsedAction, accessToken, payload);

            if (result == null)
            {
                serviceResponse.Message = "M365 Outlook connector action failed.";
                return serviceResponse;
            }

            serviceResponse.Data.Response = result;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "M365 Outlook connector invoked successfully.";

            _logger.LogInformation("Outlook action executed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception in Outlook connector.");
            serviceResponse.Message = "Unexpected error occurred.";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Core Outlook Action Dispatcher and Responsible for calling Microsoft Graph endpoints based on enum action
    /// </summary>
    private async Task<JsonDocument?> TakeM365OutlookActionAsync(
        M365OutlookActionsEnum action,
        string accessToken,
        Dictionary<string, object> payload)
    {
        // Base URL for Microsoft Graph API
        string baseUrl = $"{_m365ConnectorsService.GRAPH_BASE_URL}";

        // Retrieve important values from the payload
        var mailboxAddress = CloudConnectionPayloadUtil.GetValue(payload, "MailboxAddress");

        // Function to determine the correct path based on mailbox address
        string GetMailboxPath(string mailbox)
        {
            if (string.IsNullOrWhiteSpace(mailbox))
            {
                // If mailboxAddress is not provided, use the authenticated user's mailbox ("me")
                return "me";
            }

            // Otherwise, use the provided mailbox address
            return $"users/{mailbox}";
        }

        // Construct paths for messages and mail folders
        string userPath = GetMailboxPath(mailboxAddress);

        // Construct the final URL paths for messages and folders API
        string messagesApiUrl = $"{baseUrl}/{userPath}/messages";
        string mailFoldersApiUrl = $"{baseUrl}/{userPath}/mailFolders";

        switch (action)
        {
            #region EMAIL MANAGEMENT
            // EMAIL SENDING
            case M365OutlookActionsEnum.SendEmail:
                { return await SendEmailFromPayloadAsync(userPath, accessToken, payload); }

            case M365OutlookActionsEnum.GetEmailById:
                {
                    // Retrieve required message ID
                    var messageId = CloudConnectionPayloadUtil.GetValue(payload, "MessageId");

                    // Determine whether attachments should be included
                    var includeAttachments = CloudConnectionPayloadUtil.GetBool(payload, "IncludeAttachments", false);

                    // Build base request URL
                    var requestUrl = $"{messagesApiUrl.TrimEnd('/')}/{messageId}";

                    // Add query parameters if needed
                    if (includeAttachments)
                        requestUrl += requestUrl.Contains("?") ? "&$expand=attachments" : "?$expand=attachments";

                    return await HttpClientHelper.GetAsync(requestUrl, accessToken);
                }

            case M365OutlookActionsEnum.GetEmails:
                return await GetEmailsAsync(messagesApiUrl, accessToken, payload);

            case M365OutlookActionsEnum.MoveEmailToFolder:
                {
                    // Extract the message ID and folder ID from the payload
                    var messageId = CloudConnectionPayloadUtil.GetValue(payload, "MessageId");
                    var folderId = CloudConnectionPayloadUtil.GetValue(payload, "FolderId");

                    // Prepare the request body with the destination folder ID
                    var requestBody = new { destinationId = folderId };

                    // Make a POST request to move the email to the specified folder
                    return await HttpClientHelper.PostAsync($"{messagesApiUrl}/{messageId}/move", requestBody, accessToken);
                }

            case M365OutlookActionsEnum.UpdateAllEmailProperties:
                {
                    // Retrieve the message ID and all the properties to update from the payload
                    var messageId = CloudConnectionPayloadUtil.GetValue(payload, "MessageId");
                    var isRead = CloudConnectionPayloadUtil.GetBool(payload, "IsRead", false);
                    var flagStatus = CloudConnectionPayloadUtil.GetValue(payload, "FlagStatus");
                    var categories = CloudConnectionPayloadUtil.GetList<string>(payload, "Categories");
                    var importance = CloudConnectionPayloadUtil.GetValue(payload, "Importance");

                    // Build the request body dynamically based on the available properties
                    var requestBody = new
                    {
                        isRead = isRead,
                        flag = flagStatus != null ? new { flagStatus = flagStatus } : null,
                        categories = categories ?? null,
                        importance = importance ?? null
                    };

                    // Send a PATCH request to update the email properties
                    return await HttpClientHelper.PatchAsync($"{messagesApiUrl}/{messageId}", requestBody, accessToken);
                }

            // case M365OutlookActionsEnum.ReplyToEmail:
            //     return await HttpClientHelper.PostAsync(
            //         $"{baseUrl}/messages/{GetValue("messageId")}/reply",
            //         new
            //         {
            //             message = new
            //             {
            //                 body = new { contentType = "HTML", content = GetValue("body") }
            //             }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.ReplyAllToEmail:
            //     return await HttpClientHelper.PostAsync(
            //         $"{baseUrl}/messages/{GetValue("messageId")}/replyAll",
            //         new
            //         {
            //             message = new
            //             {
            //                 body = new { contentType = "HTML", content = GetValue("body") }
            //             }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.ForwardEmail:
            //     return await HttpClientHelper.PostAsync(
            //         $"{baseUrl}/messages/{GetValue("messageId")}/forward",
            //         new
            //         {
            //             message = new
            //             {
            //                 body = new { contentType = "HTML", content = GetValue("body") },
            //                 toRecipients = new[]
            //                 {
            //             new { emailAddress = new { address = GetValue("to") } }
            //                 }
            //             }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.DeleteEmail:
            //     return await HttpClientHelper.DeleteAsync($"{baseUrl}/messages/{GetValue("messageId")}", accessToken);

            // case M365OutlookActionsEnum.SendDraftEmail:
            //     return await HttpClientHelper.PostAsync($"{baseUrl}/messages/{GetValue("messageId")}/send", null, accessToken);

            // case M365OutlookActionsEnum.CreateDraftEmail:
            //     return await HttpClientHelper.PostAsync($"{baseUrl}/messages",
            //         new
            //         {
            //             subject = GetValue("subject"),
            //             body = new { contentType = "HTML", content = GetValue("body") },
            //             toRecipients = new[]
            //             {
            //         new { emailAddress = new { address = GetValue("to") } }
            //             }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.UpdateDraftEmail:
            //     return await HttpClientHelper.PatchAsync($"{baseUrl}/messages/{GetValue("messageId")}",
            //         new
            //         {
            //             subject = GetValue("subject"),
            //             body = new { contentType = "HTML", content = GetValue("body") }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.DeleteDraftEmail:
            //     return await HttpClientHelper.DeleteAsync($"{baseUrl}/messages/{GetValue("messageId")}", accessToken);

            // case M365OutlookActionsEnum.GetAttachmentsFromEmail:
            //     return await HttpClientHelper.GetAsync($"{baseUrl}/messages/{GetValue("messageId")}/attachments", accessToken);

            // case M365OutlookActionsEnum.AddAttachmentToDraft:
            //     return await HttpClientHelper.PostAsync($"{baseUrl}/messages/{GetValue("messageId")}/attachments",
            //         new
            //         {
            //             // @odata.type = "#microsoft.graph.fileAttachment",
            //             name = GetValue("fileName"),
            //             contentBytes = GetValue("contentBytes")
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.DownloadAttachment:
            // return await HttpClientHelper.GetAsync($"{baseUrl}/messages/{GetValue("messageId")}/attachments/{GetValue("attachmentId")}", accessToken);
            #endregion

            #region MAIL FOLDER MANAGEMENT
            // ======================================================
            // MAIL FOLDER MANAGEMENT
            // ======================================================

            case M365OutlookActionsEnum.GetEmailsByFolder:
                {
                    // Retrieve the folder ID (optionally for checking hidden folders)
                    var folderId = CloudConnectionPayloadUtil.GetValue(payload, "FolderId");

                    // Fetch emails from the specified folder
                    return await HttpClientHelper.GetAsync($"{mailFoldersApiUrl}/{folderId}/messages", accessToken);
                }

            case M365OutlookActionsEnum.GetMailFolders:
                {
                    // Determine whether to include hidden folders in the request
                    var includeHiddenFolders = CloudConnectionPayloadUtil.GetBool(payload, "IncludeHiddenFolders", false);

                    // Add query parameter when hidden folders need to be included
                    if (includeHiddenFolders)
                        mailFoldersApiUrl += "?includeHiddenFolders=true";

                    // Call the API to retrieve all mail folders, passing the access token for authorization
                    return await HttpClientHelper.GetAsync(mailFoldersApiUrl, accessToken);
                }

            case M365OutlookActionsEnum.CreateMailFolder:
                {
                    // Retrieve the folder display name and hidden status from the payload. "IsHidden" defaults to false if missing or invalid.
                    var displayName = CloudConnectionPayloadUtil.GetValue(payload, "DisplayName");
                    var isHidden = CloudConnectionPayloadUtil.GetBool(payload, "IsHidden", false);

                    // Build the request payload with the folder name and visibility flag
                    var requestBody = new
                    {
                        displayName = displayName,
                        isHidden = isHidden // Indicates whether the folder should be hidden
                    };

                    // Send a POST request to create the folder in the user's mailbox
                    return await HttpClientHelper.PostAsync(mailFoldersApiUrl, requestBody, accessToken);
                }

            case M365OutlookActionsEnum.RenameMailFolder:
                {
                    // Retrieve the folder ID and updated display name from the payload
                    var folderId = CloudConnectionPayloadUtil.GetValue(payload, "FolderId");
                    var displayName = CloudConnectionPayloadUtil.GetValue(payload, "DisplayName");

                    // Create the request body with the updated folder name
                    var requestBody = new
                    {
                        displayName = displayName
                    };

                    // Send a PATCH request to update the folder name using its ID
                    return await HttpClientHelper.PatchAsync($"{mailFoldersApiUrl}/{folderId}", requestBody, accessToken);
                }

            case M365OutlookActionsEnum.DeleteMailFolder:
                {
                    // Retrieve the folder ID from the payload
                    var folderId = CloudConnectionPayloadUtil.GetValue(payload, "FolderId");

                    // Send a DELETE request to remove the folder from the mailbox
                    return await HttpClientHelper.DeleteAsync($"{mailFoldersApiUrl}/{folderId}", accessToken);
                }
            #endregion

            // ======================================================
            // CATEGORIES
            // ======================================================

            // case M365OutlookActionsEnum.AddCategoryToEmail:
            //     return await HttpClientHelper.PatchAsync($"{baseUrl}/messages/{GetValue("messageId")}",
            //         new { categories = new[] { GetValue("category") } },
            //         accessToken);

            // case M365OutlookActionsEnum.RemoveCategoryFromEmail:
            //     return await HttpClientHelper.PatchAsync($"{baseUrl}/messages/{GetValue("messageId")}",
            //         new { categories = Array.Empty<string>() },
            //         accessToken);

            // case M365OutlookActionsEnum.GetCategories:
            //     return await HttpClientHelper.GetAsync($"{baseUrl}/outlook/masterCategories", accessToken);

            // ======================================================
            // CALENDAR
            // ======================================================

            // case M365OutlookActionsEnum.CreateCalendarEvent:
            //     return await HttpClientHelper.PostAsync($"{baseUrl}/events",
            //         new
            //         {
            //             subject = GetValue("subject"),
            //             start = new { dateTime = GetValue("startDateTime"), timeZone = "UTC" },
            //             end = new { dateTime = GetValue("endDateTime"), timeZone = "UTC" }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.UpdateCalendarEvent:
            //     return await HttpClientHelper.PatchAsync($"{baseUrl}/events/{GetValue("eventId")}",
            //         new { subject = GetValue("subject") },
            //         accessToken);

            // case M365OutlookActionsEnum.DeleteCalendarEvent:
            //     return await HttpClientHelper.DeleteAsync($"{baseUrl}/events/{GetValue("eventId")}", accessToken);

            // case M365OutlookActionsEnum.GetCalendarEvents:
            //     return await HttpClientHelper.GetAsync($"{baseUrl}/events", accessToken);

            // ======================================================
            // CONTACTS
            // ======================================================

            // case M365OutlookActionsEnum.CreateContact:
            //     return await HttpClientHelper.PostAsync($"{baseUrl}/contacts",
            //         new
            //         {
            //             givenName = GetValue("givenName"),
            //             surname = GetValue("surname"),
            //             emailAddresses = new[]
            //             {
            //         new { address = GetValue("email") }
            //             }
            //         },
            //         accessToken);

            // case M365OutlookActionsEnum.UpdateContact:
            //     return await HttpClientHelper.PatchAsync($"{baseUrl}/contacts/{GetValue("contactId")}",
            //         new { givenName = GetValue("givenName") },
            //         accessToken);

            // case M365OutlookActionsEnum.DeleteContact:
            //     return await HttpClientHelper.DeleteAsync($"{baseUrl}/contacts/{GetValue("contactId")}", accessToken);

            // case M365OutlookActionsEnum.GetContacts:
            //     return await HttpClientHelper.GetAsync($"{baseUrl}/contacts", accessToken);

            // ======================================================
            // USER INFO
            // ======================================================

            case M365OutlookActionsEnum.GetMailboxSettings:
                return await HttpClientHelper.GetAsync($"{baseUrl}/mailboxSettings", accessToken);

            case M365OutlookActionsEnum.GetUserProfile:
                return await HttpClientHelper.GetAsync($"{baseUrl}", accessToken);

            default:
                _logger.LogWarning("Unsupported Outlook action: {Action}", action);
                return null;
        }
    }

    public async Task<JsonDocument?> SendEmailFromPayloadAsync(
    string userPath,
    string accessToken,
    Dictionary<string, object> payload)
    {
        string GetPayloadValue(string key) =>
            payload.ContainsKey(key) ? payload[key]?.ToString()?.Trim() ?? string.Empty : string.Empty;

        var from = GetPayloadValue("From");
        var to = GetPayloadValue("To");
        var cc = GetPayloadValue("CC");
        var bcc = GetPayloadValue("BCC");
        var subject = GetPayloadValue("Subject");
        var contentType = string.IsNullOrWhiteSpace(GetPayloadValue("ContentType")) ? "Text" : GetPayloadValue("ContentType");
        var content = GetPayloadValue("Content");
        var sensitivity = string.IsNullOrWhiteSpace(GetPayloadValue("Sensitivity")) ? "Normal" : GetPayloadValue("Sensitivity");
        var saveToSentItems = bool.TryParse(GetPayloadValue("SaveToSentItems"), out var save) ? save : true;

        // Convert attachments using reusable method
        object[] attachments = Array.Empty<object>();
        if (payload.ContainsKey("Attachments") && payload["Attachments"] is IEnumerable<object> attList)
        {
            attachments = ConvertPayloadAttachmentsToGraph(attList);
        }

        // Build recipients
        object[] BuildRecipients(string addresses) =>
            string.IsNullOrWhiteSpace(addresses)
                ? Array.Empty<object>()
                : addresses.Split(';', StringSplitOptions.RemoveEmptyEntries)
                           .Select(email => new { emailAddress = new { address = email.Trim() } })
                           .ToArray();

        var messagePayload = new
        {
            message = new
            {
                subject = subject,
                body = new { contentType = contentType, content = content },
                toRecipients = BuildRecipients(to),
                ccRecipients = BuildRecipients(cc),
                bccRecipients = BuildRecipients(bcc),
                attachments = attachments
            },
            saveToSentItems = saveToSentItems
        };

        return await HttpClientHelper.PostAsync(
            $"{userPath}/sendMail",
            messagePayload,
            accessToken);
    }

    //Converts a payload Attachments array into Microsoft Graph file attachments. Each object in the payload must have 'name', 'contentType', and 'contentBytes' (base64 string).
    public static object[] ConvertPayloadAttachmentsToGraph(IEnumerable<object>? payloadAttachments)
    {
        if (payloadAttachments == null)
            return Array.Empty<object>();

        var attachments = new List<object>();

        foreach (var attObj in payloadAttachments)
        {
            if (attObj is Dictionary<string, object> dict &&
                dict.ContainsKey("Name") &&
                dict.ContainsKey("ContentType") &&
                dict.ContainsKey("ContentBytes"))
            {
                string name = dict["Name"]?.ToString() ?? "file.dat";
                string contentType = dict["ContentType"]?.ToString() ?? "application/octet-stream";
                string base64Content = dict["ContentBytes"]?.ToString() ?? "";

                attachments.Add(new
                {
                    @odata_type = "#microsoft.graph.fileAttachment", // Required by Graph
                    name = name,
                    contentType = contentType,
                    contentBytes = base64Content
                });
            }
        }

        return attachments.ToArray();
    }
    public async Task<JsonDocument?> GetEmailsAsync(
        string messagesApiUrl,
        string accessToken,
        Dictionary<string, object> payload)
    {
        // Helper methods for safely getting values from the payload
        string GetValue(string key) =>
            payload.ContainsKey(key) ? payload[key]?.ToString()?.Trim() ?? string.Empty : string.Empty;

        bool GetBool(string key, bool defaultValue = false) =>
            payload.ContainsKey(key) && bool.TryParse(payload[key]?.ToString(), out var b) ? b : defaultValue;

        int GetInt(string key, int defaultValue) =>
            payload.ContainsKey(key) && int.TryParse(payload[key]?.ToString(), out var i) ? i : defaultValue;

        // Extract values from the payload
        var mailbox = GetValue("MailboxAddress");
        var folder = string.IsNullOrWhiteSpace(GetValue("Folder")) ? "Inbox" : GetValue("Folder");
        var fromFilter = GetValue("FromFilter");
        var toFilter = GetValue("ToFilter");
        var ccFilter = GetValue("CcFilter");
        var subjectContains = GetValue("SubjectContains");
        var importance = GetValue("Importance");
        var searchKeyword = GetValue("Search");
        var unreadOnly = CloudConnectionPayloadUtil.GetBool(payload, "UnreadOnly", false);

        var onlyWithAttachments = GetBool("OnlyWithAttachments");
        var includeAttachments = GetBool("IncludeAttachments");
        var top = GetInt("Top", 10);
        var skip = GetInt("Skip", 0);
        var count = GetBool("Count", false);
        var orderby = GetValue("Orderby");
        var filter = GetValue("Filter");
        var select = GetValue("Select");
        var expand = GetValue("Expand");
        var format = GetValue("Format");

        // Helper method to append query parameters correctly
        string AppendQueryParameter(string url, string queryParam)
        {
            return url.Contains("?")
                ? $"{url}&{queryParam}"
                : $"{url}?{queryParam}";
        }

        // Add '$count=true' to the query string if 'count' is true
        if (count)
            messagesApiUrl = AppendQueryParameter(messagesApiUrl, "$count=true");

        // Add '$top' to the query string if 'top' is not 0
        if (top != 0)
            messagesApiUrl = AppendQueryParameter(messagesApiUrl, $"$top={top}");

        // Add '$skip' to the query string if 'skip' is not 0
        if (skip != 0)
            messagesApiUrl = AppendQueryParameter(messagesApiUrl, $"$skip={skip}");

        // Build the query string for other filters
        var queryParams = new List<string>();

        // -----------------------------
        // SEARCH (takes priority)
        // -----------------------------
        if (!string.IsNullOrWhiteSpace(searchKeyword))
        {
            queryParams.Add($"$search=\"{searchKeyword}\"");
        }
        else
        {
            var filters = new List<string>();

            if (unreadOnly)
                filters.Add("isRead eq false");

            if (!string.IsNullOrWhiteSpace(fromFilter))
                filters.Add($"from/emailAddress/address eq '{fromFilter}'");

            if (!string.IsNullOrWhiteSpace(toFilter))
                filters.Add($"toRecipients/any(r:r/emailAddress/address eq '{toFilter}')");

            if (!string.IsNullOrWhiteSpace(ccFilter))
                filters.Add($"ccRecipients/any(r:r/emailAddress/address eq '{ccFilter}')");

            if (!string.IsNullOrWhiteSpace(subjectContains))
                filters.Add($"contains(subject,'{subjectContains}')");

            if (!string.IsNullOrWhiteSpace(importance))
                filters.Add($"importance eq '{importance}'");

            if (onlyWithAttachments)
                filters.Add("hasAttachments eq true");

            if (!string.IsNullOrWhiteSpace(filter))
                filters.Add(filter); // Custom filter if provided

            if (filters.Any())
                queryParams.Add($"$filter={string.Join(" and ", filters)}");
        }

        // -----------------------------
        // EXPAND ATTACHMENTS
        // -----------------------------
        if (includeAttachments)
            queryParams.Add("$expand=attachments");

        // -----------------------------
        // ORDER BY (optional but recommended)
        // -----------------------------
        if (!string.IsNullOrWhiteSpace(orderby))
            queryParams.Add($"$orderby={orderby}");

        // -----------------------------
        // SELECT SPECIFIC FIELDS
        // -----------------------------
        if (!string.IsNullOrWhiteSpace(select))
            queryParams.Add($"$select={select}");

        // -----------------------------
        // FORMAT
        // -----------------------------
        if (!string.IsNullOrWhiteSpace(format))
            queryParams.Add($"$format={format}");

        // Combine all query parameters into the final URL
        var finalUrl = queryParams.Any()
            ? $"{messagesApiUrl}&{string.Join("&", queryParams)}"
            : messagesApiUrl;

        // Return the result from the API call
        return await HttpClientHelper.GetAsync(finalUrl, accessToken);
    }
}
