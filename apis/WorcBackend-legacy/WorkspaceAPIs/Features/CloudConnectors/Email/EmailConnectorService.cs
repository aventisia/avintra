using MailKit.Security;
using MimeKit;
using System.IO;
using System.Net.Mail;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit;
using System.Text.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;


namespace WorkspaceAPIs.Features.CloudConnectors.Email;

public class EmailConnectorsService : IEmailConnectorsService
{
    private readonly ILogger<EmailConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;

    public EmailConnectorsService(
        ILogger<EmailConnectorsService> logger,
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
            // Get Username and Password 
            var emailCred = await GetEmailCredentialAsync(cloudConnectorReqDto.CredentialName);
            if (emailCred == null)
            {
                _logger.LogWarning("Failed to obtain Email credentials for Credential Name: {CredentialName}", cloudConnectorReqDto.CredentialName);
                serviceResponse.Message = "Failed to retrieve Email Username and AppPassword.";
                return serviceResponse;
            }

            // Convert string action to enum
            if (!Enum.TryParse<EmailActionsEnum>(cloudConnectorReqDto.Action, true, out var emailActions))
            {
                _logger.LogWarning("Invalid Email action: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = $"Unsupported Email action: '{cloudConnectorReqDto.Action}'. Valid actions: SendEmailMessage,ProcessEmailMessages, RetrieveEmailMessagese.";
                return serviceResponse;
            }

            // Take action as per the enum
            var emailResponse = await TakeEmailActionAsync(emailActions, cloudConnectorReqDto.Payload, emailCred.Value.Username, emailCred.Value.Password);

            if (emailResponse == null)
            {
                _logger.LogWarning("Email action failed or returned null for action: {Action}", emailActions);
                serviceResponse.Message = "Email action execution failed.";
                return serviceResponse;
            }
            serviceResponse.Data.Response = emailResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email connector invoked successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Email connector.");
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.Message}";
            serviceResponse.Data.Response = $"Error: {ex.Message}";
        }
        return serviceResponse;
    }


    // Get Email Username  and Password.
    // Get Email Username  and Password.
    private async Task<(string Username, string Password)?> GetEmailCredentialAsync(string credentialName)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName);
        if (vaultCredential == null)
        {
            _logger.LogWarning("Vault credential not found for Name: {CredentialName}", credentialName);
            return null;
        }

        if (vaultCredential.Data == null ||
            !vaultCredential.Data.TryGetValue("Username", out var usernameValue) ||
            !vaultCredential.Data.TryGetValue("Password", out var passwordValue))
        {
            _logger.LogWarning("No 'Username' or 'Password' found in vault credential Data for Name: {CredentialName}", credentialName);
            return null;
        }
        string? username = usernameValue?.ToString();
        string? password = passwordValue?.ToString();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("Username or Password is null or whitespace for credential Name: {CredentialName}", credentialName);
            return null;
        }
        return (username, password);
    }

    // Perform the email actions.
    private async Task<object?> TakeEmailActionAsync(EmailActionsEnum action, object payload, string username, string password)
    {
        // Validate payload is Dictionary<string, object>
        if (payload is not System.Collections.Generic.IDictionary<string, object> dict)
            return new { Error = "Invalid payload format. Expected Dictionary<string, object>." };

        try
        {
            switch (action)
            {
                case EmailActionsEnum.SendEmailMessage:
                    {
                        // Required fields
                        var from = GetValue<string>(dict, "from") ?? throw new ArgumentException("'from' is required in payload.");
                        var to = GetValue<string>(dict, "to") ?? throw new ArgumentException("'to' is required in payload.");
                        var subject = GetValue<string>(dict, "subject") ?? throw new ArgumentException("'subject' is required in payload.");
                        var body = GetValue<string>(dict, "body") ?? throw new ArgumentException("'body' is required in payload.");

                        // Optional fields
                        var cc = GetValue<string>(dict, "cc");
                        var bcc = GetValue<string>(dict, "bcc");
                        var isHtml = GetValue<bool>(dict, "isHtml");
                        var smtpServer = GetValue<string>(dict, "smtpServer") ?? throw new ArgumentException("'smtpServer' is required.");
                        var serverPort = GetValue<int>(dict, "serverPort");
                        var needsAuth = GetValue<bool>(dict, "smtpServerNeedsAuthentication");
                        var securityProtocol = GetValue<string>(dict, "securityProtocol") ?? "StartTls";
                        var acceptUntrusted = GetValue<bool>(dict, "acceptUntrustedCertificates");

                        // MailKit message
                        var message = new MimeMessage();
                        message.From.Add(MailboxAddress.Parse(from));
                        message.To.Add(MailboxAddress.Parse(to));
                        message.Subject = subject;

                        var builder = new BodyBuilder
                        {
                            HtmlBody = isHtml ? body : null,
                            TextBody = !isHtml ? body : null
                        };

                        message.Body = builder.ToMessageBody();

                        using var client = new MailKit.Net.Smtp.SmtpClient();
                        client.CheckCertificateRevocation = false;

                        SecureSocketOptions secureOption;

                        if (securityProtocol.Equals("StartTls", StringComparison.OrdinalIgnoreCase))
                        {
                            secureOption = SecureSocketOptions.StartTls;
                        }
                        else if (securityProtocol.Equals("Ssl", StringComparison.OrdinalIgnoreCase))
                        {
                            secureOption = SecureSocketOptions.SslOnConnect;
                        }
                        else
                        {
                            secureOption = SecureSocketOptions.None;
                        }
                        if (acceptUntrusted)
                        {
                            client.ServerCertificateValidationCallback = (_, _, _, _) => true;
                        }

                        await client.ConnectAsync(smtpServer, serverPort, secureOption);
                        if (needsAuth)
                        {
                            await client.AuthenticateAsync(username, password);
                        }

                        await client.SendAsync(message);
                        await client.DisconnectAsync(true);

                        return new { Success = true, Message = "Email sent successfully." };
                    }

                case EmailActionsEnum.RetrieveEmailMessages:
                    {
                        // Extract required fields
                        if (!dict.TryGetValue("imapServer", out var imapServerObj) || imapServerObj == null)
                            throw new ArgumentException("'imapServer' is required in payload.");

                        var securityProtocol = GetValue<string>(dict, "securityProtocol") ?? "StartTls";

                        var imapPort = GetValue<int>(dict, "imapPort");
                        var imapServer = GetValue<string>(dict, "imapServer");
                        var acceptUntrusted = GetValue<bool>(dict, "acceptUntrusted");
                        var useSsl = GetValue<bool>(dict, "useSsl");
                        var folderName = GetValue<string>(dict, "mailFolder");
                        var retrieveModeStr = dict.TryGetValue("retrieveMode", out var modeObj) ? modeObj?.ToString() ?? "AllEmails" : "AllEmails";
                        var topNInput = GetValue<int>(dict, "topN");
                        var topN = Math.Min(10, Math.Max(1, topNInput));
                        var markAsRead = GetValue<bool>(dict, "markAsRead");

                        // Parse enum
                        if (!Enum.TryParse<EmailRetrieveModeEnum>(retrieveModeStr, true, out var retrieveMode))
                            retrieveMode = EmailRetrieveModeEnum.AllEmails;

                        SecureSocketOptions secureOption;

                        if (securityProtocol.Equals("StartTls", StringComparison.OrdinalIgnoreCase))
                        {
                            secureOption = SecureSocketOptions.StartTls;
                        }
                        else if (securityProtocol.Equals("Ssl", StringComparison.OrdinalIgnoreCase))
                        {
                            secureOption = SecureSocketOptions.SslOnConnect;
                        }
                        else
                        {
                            secureOption = SecureSocketOptions.None;
                        }

                        var subjects = new List<string>();
                        var bodies = new List<string>();
                        var fromAddresses = new List<string>();
                        var receivedDates = new List<DateTime>();
                        var messageUids = new List<uint>();

                        using (var client = new MailKit.Net.Imap.ImapClient())
                        {
                            if (acceptUntrusted)
                                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                            client.Timeout = 60 * 1000;

                            if (string.IsNullOrWhiteSpace(imapServer))
                                return new { Error = "'imapServer' is required." };

                            if (string.IsNullOrWhiteSpace(folderName))
                                return new { Error = "'mailFolder' is required." };

                            await client.ConnectAsync(imapServer, imapPort, secureOption);
                            await client.AuthenticateAsync(username, password);

                            var folder = await client.GetFolderAsync(folderName);
                            await folder.OpenAsync(FolderAccess.ReadWrite);

                            // Build search query based on mode
                            SearchQuery query;
                            switch (retrieveMode)
                            {
                                case EmailRetrieveModeEnum.UnreadOnly:
                                    query = SearchQuery.NotSeen;
                                    break;
                                case EmailRetrieveModeEnum.ReadOnly:
                                    query = SearchQuery.Seen;
                                    break;
                                default:
                                    query = SearchQuery.All;
                                    break;
                            }

                            // Search for messages
                            var uids = await folder.SearchAsync(query);
                            int total = uids.Count;
                            int startIndex = Math.Max(0, total - topN);

                            // Retrieve latest emails first (reverse order)
                            for (int i = total - 1; i >= startIndex; i--)
                            {
                                var uid = uids[i];
                                var message = await folder.GetMessageAsync(uid);

                                subjects.Add(message.Subject ?? string.Empty);
                                bodies.Add(message.TextBody ?? message.HtmlBody ?? string.Empty);
                                fromAddresses.Add(message.From.ToString());
                                receivedDates.Add(message.Date.LocalDateTime);
                                messageUids.Add(uid.Id);

                                // Mark as read if requested
                                if (markAsRead)
                                    await folder.AddFlagsAsync(uid, MessageFlags.Seen, true);
                            }

                            await client.DisconnectAsync(true);
                        }

                        return new
                        {
                            Count = subjects.Count,
                            Subjects = subjects,
                            Bodies = bodies,
                            FromAddresses = fromAddresses,
                            ReceivedDates = receivedDates,
                            MessageUids = messageUids
                        };
                    }

                case EmailActionsEnum.ProcessEmailMessages:
                    {
                        // Extract required fields
                        if (!dict.TryGetValue("operation", out var operationObj) || operationObj == null)
                            throw new ArgumentException("'operation' is required in payload.");
                        string? targetFolder = dict.TryGetValue("mailFolder", out var mailFolderObj) ? mailFolderObj?.ToString() : null;

                        var imapPort = GetValue<int>(dict, "imapPort");
                        var imapServer = GetValue<string>(dict, "imapServer");
                        var acceptUntrusted = GetValue<bool>(dict, "acceptUntrusted");
                        var enableSsl = GetValue<bool>(dict, "enableSsl");
                        var messageUidsObj = GetValue<List<uint>>(dict, "messageUidsObj");
                        if (string.IsNullOrWhiteSpace(imapServer))
                            return new { Error = "'imapServer' is required." };

                        if (!Enum.TryParse<EmailOperationEnum>(operationObj.ToString(), true, out var operation))
                            return new { Error = $"Invalid operation: {operationObj}. Valid values: Delete, MarkAsUnread, MoveToFolder" };

                        // Parse message UIDs

                        var uidsList = new List<uint>();
                        if (messageUidsObj is System.Collections.IEnumerable enumerable)
                        {
                            foreach (var item in enumerable)
                            {
                                if (item != null && uint.TryParse(item.ToString(), out var uid))
                                    uidsList.Add(uid);
                            }
                        }

                        if (uidsList.Count == 0)
                            return new { Error = "At least one valid Message UID (uint) is required." };

                        if (operation == EmailOperationEnum.MoveToFolder && string.IsNullOrWhiteSpace(targetFolder))
                            return new { Error = "Target folder is required when operation is 'MoveToFolder'." };

                        var securityProtocol = enableSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.None;

                        using (var client = new MailKit.Net.Imap.ImapClient())
                        {
                            if (acceptUntrusted)
                                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                            client.Timeout = 30 * 1000;

                            await client.ConnectAsync(imapServer, imapPort, securityProtocol);
                            await client.AuthenticateAsync(username, password);

                            var uniqueIds = uidsList.Select(uid => new UniqueId(uid)).ToList();

                            switch (operation)
                            {
                                case EmailOperationEnum.Delete:
                                    {
                                        var inbox = client.Inbox;
                                        await inbox.OpenAsync(FolderAccess.ReadWrite);
                                        await inbox.AddFlagsAsync(uniqueIds, MessageFlags.Deleted, true);
                                        await inbox.ExpungeAsync(uniqueIds);
                                        break;
                                    }

                                case EmailOperationEnum.MarkAsUnread:
                                    {
                                        var inbox = client.Inbox;
                                        await inbox.OpenAsync(FolderAccess.ReadWrite);
                                        await inbox.RemoveFlagsAsync(uniqueIds, MessageFlags.Seen, true);
                                        break;
                                    }
                                case EmailOperationEnum.MoveToFolder:
                                    {
                                        if (string.IsNullOrWhiteSpace(targetFolder))
                                            return new { Error = "Target folder is required when operation is 'MoveToFolder'." };

                                        var inbox = client.Inbox;
                                        await inbox.OpenAsync(FolderAccess.ReadWrite);

                                        // Try to get folder by name directly
                                        var destFolder = await client.GetFolderAsync(targetFolder);

                                        if (destFolder == null || !destFolder.Exists)
                                        {
                                            // Create it under Inbox (most reliable)                                           
                                            destFolder = await inbox.CreateAsync(targetFolder, true);
                                        }
                                        await destFolder.OpenAsync(FolderAccess.ReadWrite);
                                        await inbox.MoveToAsync(uniqueIds, destFolder);
                                        break;
                                    }

                                default:
                                    return new { Error = $"Unsupported operation: {operation}" };
                            }

                            await client.DisconnectAsync(true);
                        }

                        return new
                        {
                            Status = "Success",
                            Message = $"Processed {uidsList.Count} email(s) with operation: {operation}."
                        };
                    }
                default:
                    return new { Error = $"Unsupported Email action: '{action}'." };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email operation failed");
            return new { Error = ex.Message };
        }
    }

    // Helper method to add addresses
    // private static void AddAddresses(InternetAddressList list, string addresses)
    //{
    // if (string.IsNullOrWhiteSpace(addresses)) return;

    // foreach (var addr in addresses.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
    //    list.Add(MailboxAddress.Parse(addr.Trim()));
    // } 

    public enum EmailBodyFormatEnum
    {
        [Display(Name = "Plain Text", Description = "Sends the email body as plain text.")]
        Text,

        [Display(Name = "HTML", Description = "Sends the email body as HTML content.")]
        Html
    }
    public enum EmailRetrieveModeEnum
    {
        [Display(Name = "All email messages", Description = "Retrieves all email messages.")]
        AllEmails,

        [Display(Name = "Unread email messages only", Description = "Retrieves only unread email messages.")]
        UnreadOnly,

        [Display(Name = "Read email messages only", Description = "Retrieves only read email messages.")]
        ReadOnly
    }
    public enum EmailOperationEnum
    {
        [Display(Name = "Delete", Description = "Deletes email messages from the server.")]
        Delete,

        [Display(Name = "Mark as Unread", Description = "Marks email messages as unread.")]
        MarkAsUnread,

        [Display(Name = "Move to Mail Folder", Description = "Moves email messages to a specified mail folder.")]
        MoveToFolder
    }


    private static T? GetValue<T>(IDictionary<string, object> dict, string key)
    {
        if (!dict.TryGetValue(key, out var obj) || obj == null)
            return default;

        if (obj is JsonElement je)
        {
            return typeof(T) switch
            {
                var t when t == typeof(string) => (T?)(object?)je.GetString(),
                var t when t == typeof(int) => (T)(object)je.GetInt32(),
                var t when t == typeof(bool) => (T)(object)je.GetBoolean(),
                _ => JsonSerializer.Deserialize<T>(je.GetRawText())
            };
        }

        return (T)obj;
    }

}