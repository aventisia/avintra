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
        var mailboxAddress = CloudConnectionPayloadUtil.GetValue(payload, "mailboxAddress");

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
        string messagesApiUrl = $"{baseUrl}/{userPath}";
        string mailFoldersApiUrl = $"{baseUrl}/{userPath}/mailFolders";

        switch (action)
        {
            #region EMAIL MANAGEMENT
            // EMAIL SENDING
            case M365OutlookActionsEnum.SendEmail:
                { return await SendEmailFromPayloadAsync(messagesApiUrl, accessToken, payload); }

            case M365OutlookActionsEnum.GetEmailById:
                {
                    var messageId = CloudConnectionPayloadUtil.GetValue(payload, "messageId");
                    var includeAttachments = CloudConnectionPayloadUtil.GetBool(payload, "includeAttachments", false);

                    var baseMessageUrl = $"{messagesApiUrl}/messages/{messageId}";
                    var rootEmailUrl = includeAttachments
                        ? $"{baseMessageUrl}?$expand=attachments"
                        : baseMessageUrl;

                    var headers = new Dictionary<string, string>
                    {
                        { "Prefer", "outlook.body-content-type=\"text\"" }
                    };

                    var rootEmail = await HttpClientHelper.GetAsync(rootEmailUrl, accessToken, headers);
                    if (rootEmail == null) return null;

                    var structured = await BuildStructuredFlatEmailResponseAsync(
                        rootEmail,
                        baseMessageUrl,
                        accessToken,
                        headers);

                    var camelCaseOptions = new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    };

                    return JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(structured, camelCaseOptions));
                }
            case M365OutlookActionsEnum.GetEmails:
                return await GetEmailsAsync(messagesApiUrl, accessToken, payload);

            case M365OutlookActionsEnum.MoveEmailToFolder:
                {
                    // Extract the message ID and folder namd from the payload
                    var messageId = CloudConnectionPayloadUtil.GetValue(payload, "messageId");
                    var folderName = CloudConnectionPayloadUtil.GetValue(payload, "folderName");

                    // Get the folder ID by name using the helper method
                    var folderId = await GetFolderIdByNameAsync(mailFoldersApiUrl, accessToken, folderName);

                    // Prepare the request body with the destination folder ID
                    var requestBody = new { destinationId = folderId };

                    // Make a POST request to move the email to the specified folder
                    return await HttpClientHelper.PostAsync($"{messagesApiUrl}/messages/{messageId}/move", requestBody, accessToken);
                }

            case M365OutlookActionsEnum.UpdateAllEmailProperties:
                {
                    // Retrieve the message ID and all the properties to update from the payload
                    var messageId = CloudConnectionPayloadUtil.GetValue(payload, ",messageId");
                    var isRead = CloudConnectionPayloadUtil.GetBool(payload, "isRead", false);
                    var flagStatus = CloudConnectionPayloadUtil.GetValue(payload, "flagStatus");
                    var categories = CloudConnectionPayloadUtil.GetList<string>(payload, "categories");
                    var importance = CloudConnectionPayloadUtil.GetValue(payload, "importance");

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

            case M365OutlookActionsEnum.ReplyEmail:
                {
                    // Determine whether to send a Reply or Reply All action.
                    var endpoint = CloudConnectionPayloadUtil.GetValue(payload, "replyType") == "ReplyAll"
                        ? "replyAll"
                        : "reply";

                    // Retrieve common input values.
                    var replyMessageId = CloudConnectionPayloadUtil.GetValue(payload, "messageId");
                    var replyComment = CloudConnectionPayloadUtil.GetValue(payload, "comment") ?? string.Empty;

                    // Reply All automatically sends the response to the original sender and all recipients from the original email.
                    if (endpoint == "replyAll")
                    {
                        return await HttpClientHelper.PostAsync(
                            $"{baseUrl}/messages/{replyMessageId}/replyAll",
                            new { replyComment },
                            accessToken);
                    }

                    // Reply sends the response only to the original sender.
                    // Microsoft Graph supports an optional 'message' object for overrides, but this connector uses the simpler comment-based reply.
                    return await HttpClientHelper.PostAsync(
                        $"{baseUrl}/messages/{replyMessageId}/reply",
                        new { replyComment },
                        accessToken);
                }

            case M365OutlookActionsEnum.ForwardEmail:
                {
                    // Message to forward.
                    var forwardMessageId = CloudConnectionPayloadUtil.GetValue(payload, "messageId");

                    // Optional comment that appears above the forwarded message.
                    var forwardComment = CloudConnectionPayloadUtil.GetValue(payload, "comment") ?? string.Empty;

                    // Build recipient collection from a semicolon-separated list.
                    var recipients = CloudConnectionPayloadUtil.GetValue(payload, "toRecipients")
                        .Split(';', StringSplitOptions.RemoveEmptyEntries)
                        .Select(email => new
                        {
                            emailAddress = new
                            {
                                address = email.Trim()
                            }
                        })
                        .ToArray();

                    // Forward the email to the specified recipients.
                    return await HttpClientHelper.PostAsync(
                        $"{baseUrl}/messages/{forwardMessageId}/forward",
                        new
                        {
                            forwardComment,
                            toRecipients = recipients
                        },
                        accessToken);
                }

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

            case M365OutlookActionsEnum.GetEmailsByFolderName:
                {
                    // Retrieve the folder name from the payload
                    var folderName = CloudConnectionPayloadUtil.GetValue(payload, "folderName");

                    // Get the folder ID by name using the helper method.
                    var folderId = await GetFolderIdByNameAsync(mailFoldersApiUrl, accessToken, folderName);

                    // Add pagination parameters if provided
                    mailFoldersApiUrl = BuildPaginatedUrl($"{mailFoldersApiUrl}/{folderId}/messages", payload);

                    // Call the API to retrieve all mail from folder, passing the access token for authorization
                    return await HttpClientHelper.GetAsync(mailFoldersApiUrl, accessToken);
                }

            case M365OutlookActionsEnum.GetMailFolders:
                {
                    // Determine whether hidden folders should be included based on the payload
                    var includeHiddenFolders = CloudConnectionPayloadUtil.GetBool(payload, "includeHiddenFolders", false);

                    // If hidden folders should be included, add the appropriate query parameter to the API URL
                    if (includeHiddenFolders)
                        mailFoldersApiUrl += "?includeHiddenFolders=true";

                    // Add pagination parameters if provided
                    mailFoldersApiUrl = BuildPaginatedUrl(mailFoldersApiUrl, payload);

                    // Call the API to retrieve all mail folders, passing the access token for authorization
                    return await HttpClientHelper.GetAsync(mailFoldersApiUrl, accessToken);
                }

            case M365OutlookActionsEnum.CreateMailFolder:
                {
                    // Retrieve the folder display name and hidden status from the payload. "IsHidden" defaults to false if missing or invalid.
                    var displayName = CloudConnectionPayloadUtil.GetValue(payload, "displayName");
                    var isHidden = CloudConnectionPayloadUtil.GetBool(payload, "isHidden", false);

                    // Create the request body with the folder name and hidden status
                    var requestBody = new
                    {
                        displayName = displayName,
                        isHidden = isHidden // Indicates whether the folder should be hidden
                    };

                    // Call the API to create a new mail folder in the user's mailbox, passing the access token for authorization
                    return await HttpClientHelper.PostAsync(mailFoldersApiUrl, requestBody, accessToken);
                }

            case M365OutlookActionsEnum.GetMailFolderByName:
                {
                    // Retrieve the folder name from the payload
                    var folderName = CloudConnectionPayloadUtil.GetValue(payload, "folderName");

                    // Get the folder ID by name using the helper method.
                    var folderId = await GetFolderIdByNameAsync(mailFoldersApiUrl, accessToken, folderName);

                    // Call the API to retrieve the mail folder details by ID, passing the access token for authorization
                    return await HttpClientHelper.GetAsync($"{mailFoldersApiUrl}/{folderId}", accessToken);
                }

            case M365OutlookActionsEnum.RenameMailFolder:
                {
                    // Retrieve the current folder name and the new display name from the payload
                    var folderName = CloudConnectionPayloadUtil.GetValue(payload, "folderName");
                    var displayName = CloudConnectionPayloadUtil.GetValue(payload, "displayName");

                    // Get the folder ID by name using the helper method.
                    var folderId = await GetFolderIdByNameAsync(mailFoldersApiUrl, accessToken, folderName);

                    // Create the request body with the new display name for the folder
                    var requestBody = new
                    {
                        displayName = displayName
                    };

                    // Call the API to update the mail folder's display name by ID, passing the access token for authorization
                    return await HttpClientHelper.PatchAsync($"{mailFoldersApiUrl}/{folderId}", requestBody, accessToken);
                }

            case M365OutlookActionsEnum.DeleteMailFolder:
                {
                    // Retrieve the folder name from the payload
                    var folderName = CloudConnectionPayloadUtil.GetValue(payload, "folderName");

                    // Get the folder ID by name using the helper method.
                    var folderId = await GetFolderIdByNameAsync(mailFoldersApiUrl, accessToken, folderName);

                    // Call the API to delete the mail folder by ID, passing the access token for authorization
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
    string messageApiUrl,
    string accessToken,
    Dictionary<string, object> payload)
    {
        string GetPayloadValue(string key) =>
            payload.ContainsKey(key) ? payload[key]?.ToString()?.Trim() ?? string.Empty : string.Empty;

        var to = GetPayloadValue("to");
        var cc = GetPayloadValue("cc");
        var bcc = GetPayloadValue("bcc");
        var subject = GetPayloadValue("subject");
        var contentType = string.IsNullOrWhiteSpace(GetPayloadValue("contentType")) ? "Text" : GetPayloadValue("contentType");
        var content = GetPayloadValue("content");
        var sensitivity = string.IsNullOrWhiteSpace(GetPayloadValue("sensitivity")) ? "Normal" : GetPayloadValue("sensitivity");
        var saveToSentItems = bool.TryParse(GetPayloadValue("saveToSentItems"), out var save) ? save : true;

        // Convert attachments using reusable method
        object[] attachments = Array.Empty<object>();
        if (payload.ContainsKey("attachments") && payload["attachments"] is IEnumerable<object> attList)
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
            $"{messageApiUrl}/sendMail",
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
                dict.ContainsKey("name") &&
                dict.ContainsKey("contentType") &&
                dict.ContainsKey("contentBytes"))
            {
                string name = dict["Name"]?.ToString() ?? "file.dat";
                string contentType = dict["contentType"]?.ToString() ?? "application/octet-stream";
                string base64Content = dict["contentBytes"]?.ToString() ?? "";

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
        var requesturl = $"{messagesApiUrl}/messages";

        // Extract values from the payload
        var mailbox = CloudConnectionPayloadUtil.GetValue(payload, "mailboxAddress");
        var folder = CloudConnectionPayloadUtil.GetBool(payload, "folderName");
        var unreadOnly = CloudConnectionPayloadUtil.GetBool(payload, "unreadOnly", false);
        var onlyWithAttachments = CloudConnectionPayloadUtil.GetBool(payload, "onlyWithAttachments", false);
        var includeAttachments = CloudConnectionPayloadUtil.GetBool(payload, "includeAttachments", false);
        var count = CloudConnectionPayloadUtil.GetBool(payload, "count", false);

        // Add '$count=true' to the query string if 'count' is true
        if (count)
            requesturl = CloudConnectionPayloadUtil.AppendQueryParameter(requesturl, "count", "$count={true}");
        if (onlyWithAttachments)
            requesturl = CloudConnectionPayloadUtil.AppendQueryParameter(requesturl, "$filter", "hasAttachments eq true");
        if (unreadOnly)
            requesturl = CloudConnectionPayloadUtil.AppendQueryParameter(requesturl, "$filter", "isRead eq false");

        // Add pagination parameters if provided
        requesturl = BuildPaginatedUrl(requesturl, payload);

        // Add header to prefer email body in text format
        var headers = new Dictionary<string, string>
        {
            { "Prefer", "outlook.body-content-type=\"text\"" }
        };

        // Return the result from the API call
        return await HttpClientHelper.GetAsync(requesturl, accessToken, headers);
    }

    // Retrieves the folder ID for a given folder name by calling the Microsoft Graph API to list mail folders and matching by display name.
    private async Task<string> GetFolderIdByNameAsync(string mailFoldersApiUrl, string accessToken, string folderName)
    {
        var requestUrl = $"{mailFoldersApiUrl}?includeHiddenFolders=true&$top=100";

        // Call the API to retrieve all mail folders, passing the access token for authorization
        var response = await HttpClientHelper.GetAsync(requestUrl, accessToken);

        // Check if the response contains the "value" property which holds the array of folders
        if (!response.RootElement.TryGetProperty("value", out JsonElement folders))
            return string.Empty;

        // Iterate through the folders to find a match by display name (case-insensitive)
        foreach (var folder in folders.EnumerateArray())
        {
            // Get the display name of the folder and compare it to the provided folder name
            var displayName = folder.GetProperty("displayName").GetString();

            // If a match is found, return the folder ID
            if (string.Equals(displayName, folderName, StringComparison.OrdinalIgnoreCase))
            {
                // If the display name matches, return the corresponding folder ID
                return folder.GetProperty("id").GetString() ?? string.Empty;
            }
        }

        return string.Empty;
    }
    private string BuildPaginatedUrl(string baseUrl, Dictionary<string, object> payload)
    {
        // Start with the base URL and append pagination parameters if they are provided in the payload
        var url = baseUrl;

        // Extract 'top' and 'skip' values from the payload, using default values if they are not present or invalid
        var top = CloudConnectionPayloadUtil.GetInt(payload, "top", 10);
        var skip = CloudConnectionPayloadUtil.GetInt(payload, "skip", 0);

        // Append '$top' and '$skip' query parameters to the URL for pagination
        url = CloudConnectionPayloadUtil.AppendQueryParameter(url, "$top", top.ToString());
        url = CloudConnectionPayloadUtil.AppendQueryParameter(url, "$skip", skip.ToString());

        return url;
    }

    private async Task<object> BuildStructuredFlatEmailResponseAsync(
        JsonDocument rootEmailDoc,
        string rootMessageBaseUrl,
        string accessToken,
        Dictionary<string, string> headers)
    {
        var messages = new List<object>();
        var queue = new Queue<EmailQueueItem>();

        var rootId = GetString(rootEmailDoc.RootElement, "id");
        queue.Enqueue(new EmailQueueItem(
            rootEmailDoc.RootElement,
            0,
            "0",
            null,
            null,
            rootMessageBaseUrl));

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            var message = current.Message;

            var currentMessageId = GetString(message, "id");
            var attachments = ExtractAttachments(message);

            messages.Add(new
            {
                messageId = currentMessageId,
                parentMessageId = current.ParentMessageId,
                parentAttachmentId = current.ParentAttachmentId,
                level = current.Level,
                path = current.Path,
                subject = GetString(message, "subject"),
                bodyPreview = GetString(message, "bodyPreview"),
                receivedDateTime = GetString(message, "receivedDateTime"),
                sentDateTime = GetString(message, "sentDateTime"),
                createdDateTime = GetString(message, "createdDateTime"),
                lastModifiedDateTime = GetString(message, "lastModifiedDateTime"),
                internetMessageId = GetString(message, "internetMessageId"),
                conversationId = GetString(message, "conversationId"),
                conversationIndex = GetString(message, "conversationIndex"),
                importance = GetString(message, "importance"),
                isRead = GetBool(message, "isRead"),
                isDraft = GetBool(message, "isDraft"),
                hasAttachments = GetBool(message, "hasAttachments"),
                from = ExtractAddressObject(message, "from"),
                sender = ExtractAddressObject(message, "sender"),
                toRecipients = ExtractRecipients(message, "toRecipients"),
                ccRecipients = ExtractRecipients(message, "ccRecipients"),
                bccRecipients = ExtractRecipients(message, "bccRecipients"),
                body = ExtractBody(message),
                attachments = attachments
            });

            var childIndex = 0;
            foreach (var attachment in EnumerateAttachments(message))
            {
                var odataType = GetString(attachment, "@odata.type");
                if (!string.Equals(odataType, "#microsoft.graph.itemAttachment", StringComparison.OrdinalIgnoreCase))
                    continue;

                var attachmentId = GetString(attachment, "id");
                if (string.IsNullOrWhiteSpace(attachmentId))
                    continue;

                JsonElement? childMessage = null;

                if (attachment.TryGetProperty("item", out var inlinedItem) &&
                    inlinedItem.ValueKind == JsonValueKind.Object)
                {
                    childMessage = inlinedItem;
                }
                else
                {
                    var nestedUrl = $"{current.MessageBaseUrl}/attachments/{attachmentId}/?$expand=microsoft.graph.itemattachment/item";
                    var nestedDoc = await HttpClientHelper.GetAsync(nestedUrl, accessToken, headers);

                    if (nestedDoc != null &&
                        nestedDoc.RootElement.TryGetProperty("item", out var fetchedItem) &&
                        fetchedItem.ValueKind == JsonValueKind.Object)
                    {
                        childMessage = fetchedItem;
                    }
                }

                if (childMessage.HasValue)
                {
                    var childMessageId = GetString(childMessage.Value, "id");
                    var childBaseUrl = !string.IsNullOrWhiteSpace(childMessageId)
                        ? $"{rootMessageBaseUrl.Split("/messages/")[0]}/messages/{childMessageId}"
                        : current.MessageBaseUrl;

                    queue.Enqueue(new EmailQueueItem(
                        childMessage.Value,
                        current.Level + 1,
                        $"{current.Path}.{childIndex}",
                        currentMessageId,
                        attachmentId,
                        childBaseUrl));

                    childIndex++;
                }
            }
        }

        return new
        {
            rootMessageId = rootId,
            messages = messages
        };
    }

    private sealed record EmailQueueItem(
        JsonElement Message,
        int Level,
        string Path,
        string? ParentMessageId,
        string? ParentAttachmentId,
        string MessageBaseUrl);

    private static IEnumerable<JsonElement> EnumerateAttachments(JsonElement message)
    {
        if (message.TryGetProperty("attachments", out var attachments) &&
            attachments.ValueKind == JsonValueKind.Array)
        {
            foreach (var att in attachments.EnumerateArray())
                yield return att;
        }
    }

    private static object[] ExtractAttachments(JsonElement message)
    {
        return EnumerateAttachments(message)
            .Select(att => new
            {
                attachmentId = GetString(att, "id"),
                odataType = GetString(att, "@odata.type"),
                name = GetString(att, "name"),
                contentType = GetString(att, "contentType"),
                size = GetLong(att, "size"),
                isInline = GetBool(att, "isInline"),
                contentId = GetString(att, "contentId"),
                contentLocation = GetString(att, "contentLocation"),
                contentBytes = GetString(att, "contentBytes")
            })
            .Cast<object>()
            .ToArray();
    }

    private static object ExtractBody(JsonElement message)
    {
        if (message.TryGetProperty("body", out var body) && body.ValueKind == JsonValueKind.Object)
        {
            var contentType = GetString(body, "contentType");
            var content = GetString(body, "content");

            // Graph does not honour the Prefer: outlook.body-content-type header for nested
            // itemAttachment item bodies, so they may return as HTML or as text with HTML entities.
            // Always normalise: strip tags if HTML, then decode any remaining HTML entities.
            if (string.Equals(contentType, "html", StringComparison.OrdinalIgnoreCase))
            {
                content = StripHtml(content);
                contentType = "text";
            }

            // Always decode HTML entities — Graph returns &nbsp;, &amp; etc. even in text bodies.
            if (!string.IsNullOrEmpty(content))
                content = System.Net.WebUtility.HtmlDecode(content);

            return new { contentType, content };
        }

        return new { contentType = (string?)null, content = (string?)null };
    }

    private static string? StripHtml(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return html;

        var doc = new HtmlAgilityPack.HtmlDocument();
        doc.LoadHtml(html);

        // Remove <script>, <style>, and <head> nodes entirely
        foreach (var node in doc.DocumentNode
            .SelectNodes("//script|//style|//head") ?? Enumerable.Empty<HtmlAgilityPack.HtmlNode>())
        {
            node.Remove();
        }

        // Replace <br> and block-level elements with a newline sentinel before extracting text
        foreach (var node in doc.DocumentNode
            .SelectNodes("//br|//p|//div|//tr|//li|//h1|//h2|//h3|//h4|//h5|//h6")
            ?? Enumerable.Empty<HtmlAgilityPack.HtmlNode>())
        {
            node.ParentNode?.InsertBefore(doc.CreateTextNode("\n"), node);
        }

        // InnerText decodes HTML entities and returns the raw text content
        var text = doc.DocumentNode.InnerText;

        // Collapse runs of blank lines to at most two, and trim
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[ \t]+", " ");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\n{3,}", "\n\n").Trim();

        return text;
    }

    private static object? ExtractAddressObject(JsonElement message, string prop)
    {
        if (!message.TryGetProperty(prop, out var wrapper) || wrapper.ValueKind != JsonValueKind.Object)
            return null;

        if (!wrapper.TryGetProperty("emailAddress", out var ea) || ea.ValueKind != JsonValueKind.Object)
            return null;

        return new
        {
            name = GetString(ea, "name"),
            address = GetString(ea, "address")
        };
    }

    private static object[] ExtractRecipients(JsonElement message, string prop)
    {
        if (!message.TryGetProperty(prop, out var recipients) || recipients.ValueKind != JsonValueKind.Array)
            return Array.Empty<object>();

        return recipients.EnumerateArray()
            .Select(r =>
            {
                if (r.TryGetProperty("emailAddress", out var ea) && ea.ValueKind == JsonValueKind.Object)
                {
                    return (object)new
                    {
                        name = GetString(ea, "name"),
                        address = GetString(ea, "address")
                    };
                }

                return new { name = (string?)null, address = (string?)null };
            })
            .ToArray();
    }

    private static string? GetString(JsonElement obj, string prop)
    {
        if (obj.ValueKind == JsonValueKind.Object &&
            obj.TryGetProperty(prop, out var value) &&
            value.ValueKind != JsonValueKind.Null &&
            value.ValueKind != JsonValueKind.Undefined)
        {
            return value.GetString();
        }

        return null;
    }

    private static bool? GetBool(JsonElement obj, string prop)
    {
        if (obj.ValueKind == JsonValueKind.Object &&
            obj.TryGetProperty(prop, out var value) &&
            (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False))
        {
            return value.GetBoolean();
        }

        return null;
    }

    private static long? GetLong(JsonElement obj, string prop)
    {
        if (obj.ValueKind == JsonValueKind.Object &&
            obj.TryGetProperty(prop, out var value) &&
            value.ValueKind == JsonValueKind.Number &&
            value.TryGetInt64(out var parsed))
        {
            return parsed;
        }

        return null;
    }
}
