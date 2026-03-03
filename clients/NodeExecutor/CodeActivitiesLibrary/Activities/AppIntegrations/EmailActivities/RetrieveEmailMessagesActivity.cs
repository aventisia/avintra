using CodeActivitiesLibrary.Extensions;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit.Security;
using MimeKit;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.EmailActivities
{
    [DisplayName("Retrieve Email Messages")]
    [Description("Retrieves email messages from an IMAP server.")]
    [ActivityMetaData(nodeImg:"/assets/Email.svg")]
    public class RetrieveEmailMessagesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("IMAP Server")]
        [Description("The IMAP server URL.")]
        public InArgument<string> ImapServer { get; set; }

        [RequiredArgument]
        [DisplayName("Username")]
        [Description("The username for authentication.")]
        public InArgument<string> Username { get; set; }

        [RequiredArgument]
        [DisplayName("Password")]
        [Description("The password for authentication.")]
        public InArgument<SecureString> Password { get; set; }


        [DisplayName("Port")]
        [Description("The port number for the IMAP server (default is 993).")]
        public InArgument<int> Port { get; set; } = 993;


        [DisplayName("Enable SSL")]
        [Description("If true, uses SSL encryption for the connection.")]
        public InArgument<bool> EnableSSL { get; set; } = true;


        [DisplayName("Accept Untrusted Certificates")]
        [Description("If true, accepts untrusted SSL certificates.")]
        public InArgument<bool> AcceptUntrustedCertificates { get; set; } = false;


        [DisplayName("Mail Folder")]
        [Description("The folder to retrieve emails from (e.g., Inbox).")]
        public InArgument<string> MailFolder { get; set; } = "Inbox";


        [DisplayName("Retrieve Mode")]
        [Description("Specifies which emails to retrieve.")]
        [DefaultValue(EmailRetrieveModeEnum.AllEmails)]
        public InArgument<EmailRetrieveModeEnum> RetrieveMode { get; set; } = EmailRetrieveModeEnum.AllEmails;


        [DisplayName("Mark as Read")]
        [Description("If true, marks retrieved emails as read.")]
        public InArgument<bool> MarkAsRead { get; set; } = false;


        [DisplayName("From Field Contains")]
        [Description("Filters emails where the 'From' field contains this text.")]
        public InArgument<string> FromContains { get; set; }


        [DisplayName("To Field Contains")]
        [Description("Filters emails where the 'To' field contains this text.")]
        public InArgument<string> ToContains { get; set; }


        [DisplayName("Subject Contains")]
        [Description("Filters emails where the subject contains this text.")]
        public InArgument<string> SubjectContains { get; set; }


        [DisplayName("Body Contains")]
        [Description("Filters emails where the body contains this text.")]
        public InArgument<string> BodyContains { get; set; }


        [DisplayName("Save Attachments")]
        [Description("Specifies whether to save attachments.")]
        [DefaultValue(EmailSaveAttachmentsEnum.DoNotSaveAttachments)]
        public InArgument<EmailSaveAttachmentsEnum> SaveAttachments { get; set; } =
            EmailSaveAttachmentsEnum.DoNotSaveAttachments;


        [DisplayName("Save Attachments Into")]
        [Description("The directory where attachments will be saved (required if 'Save Attachments' is enabled).")]
        public InArgument<string> SaveDirectory { get; set; }

        [DisplayName("Retrieved Emails")]
        [Description("Returns the retrieved email messages.")]
        public OutArgument<IEnumerable<MailMessage>> RetrievedEmails { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var retrievedEmails = new List<MailMessage>();

            try
            {
                var imapServer = ImapServer.Get(context);
                var username = Username.Get(context);
                var password = ConvertSecureStringToString(Password.Get(context));
                var port = Port.Get(context);
                var enableSsl = EnableSSL.Get(context);
                var acceptUntrustedCertificates = AcceptUntrustedCertificates.Get(context);
                var mailFolder = MailFolder.Get(context);
                var retrieveMode = RetrieveMode.Get(context);
                var markAsRead = MarkAsRead.Get(context);
                var fromContains = FromContains.Get(context);
                var toContains = ToContains.Get(context);
                var subjectContains = SubjectContains.Get(context);
                var bodyContains = BodyContains.Get(context);
                var saveAttachments = SaveAttachments.Get(context);
                var saveDirectory = SaveDirectory.Get(context);

                if (string.IsNullOrWhiteSpace(imapServer))
                    throw new ArgumentException("IMAP server cannot be empty.");

                if (string.IsNullOrWhiteSpace(username))
                    throw new ArgumentException("Username cannot be empty.");

                if (string.IsNullOrWhiteSpace(password))
                    throw new ArgumentException("Password cannot be empty.");

                if (saveAttachments == EmailSaveAttachmentsEnum.SaveAttachments &&
                    string.IsNullOrWhiteSpace(saveDirectory))
                    throw new ArgumentException("Save directory is required when saving attachments.");

                using (var client = new ImapClient())
                {
                    // Configure SSL certificate validation
                    if (acceptUntrustedCertificates) client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                    // Connect to the IMAP server
                    client.Connect(imapServer, port,
                        enableSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.None);

                    // Authenticate
                    client.Authenticate(username, password);

                    // Open the specified folder
                    var folder = client.GetFolder(mailFolder);
                    folder.Open(FolderAccess.ReadWrite);

                    // Build search query based on input parameters
                    var searchQuery = BuildSearchQuery(retrieveMode, fromContains, toContains, subjectContains,
                        bodyContains);

                    // Get the message summaries
                    var messages = folder.Search(searchQuery);

                    foreach (var uid in messages)
                    {
                        var message = folder.GetMessage(uid);

                        // Convert MimeMessage to System.Net.Mail.MailMessage
                        var mailMessage = ConvertToMailMessage(message);

                        // Save attachments if requested
                        if (saveAttachments == EmailSaveAttachmentsEnum.SaveAttachments)
                            SaveAttachmentsInDirectory(message, saveDirectory);

                        // Mark as read if requested
                        if (markAsRead) folder.AddFlags(uid, MessageFlags.Seen, true);

                        retrievedEmails.Add(mailMessage);
                    }

                    // Disconnect
                    client.Disconnect(true);
                }
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                status = $"Error retrieving emails: {ex.Message}";
            }
            RetrievedEmails.Set(context, retrievedEmails);
            StatusMessage.Set(context, status);
        }

        private static SearchQuery BuildSearchQuery(
            EmailRetrieveModeEnum emailRetrieveMode,
            string fromContains,
            string toContains,
            string subjectContains,
            string bodyContains)
        {
            var query = SearchQuery.All;

            // Apply retrieve mode filter
            switch (emailRetrieveMode)
            {
                case EmailRetrieveModeEnum.UnreadOnly:
                    query = query.And(SearchQuery.NotSeen);
                    break;
                case EmailRetrieveModeEnum.ReadOnly:
                    query = query.And(SearchQuery.Seen);
                    break;
                case EmailRetrieveModeEnum.AllEmails:
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(emailRetrieveMode), emailRetrieveMode, null);
            }

            // Apply from filter
            if (!string.IsNullOrWhiteSpace(fromContains)) query = query.And(SearchQuery.FromContains(fromContains));

            // Apply to filter
            if (!string.IsNullOrWhiteSpace(toContains)) query = query.And(SearchQuery.ToContains(toContains));

            // Apply subject filter
            if (!string.IsNullOrWhiteSpace(subjectContains))
                query = query.And(SearchQuery.SubjectContains(subjectContains));

            // Apply body filter
            if (!string.IsNullOrWhiteSpace(bodyContains)) query = query.And(SearchQuery.BodyContains(bodyContains));

            return query;
        }

        private static MailMessage ConvertToMailMessage(MimeMessage mimeMessage)
        {
            var mailMessage = new MailMessage
            {
                From = new MailAddress(mimeMessage.From.Mailboxes.FirstOrDefault()?.Address ?? string.Empty),
                Subject = mimeMessage.Subject,
                Body = mimeMessage.TextBody,
                IsBodyHtml = !string.IsNullOrEmpty(mimeMessage.HtmlBody)
            };

            // Add recipients
            foreach (var to in mimeMessage.To.Mailboxes) mailMessage.To.Add(new MailAddress(to.Address, to.Name));

            foreach (var cc in mimeMessage.Cc.Mailboxes) mailMessage.CC.Add(new MailAddress(cc.Address, cc.Name));

            foreach (var bcc in mimeMessage.Bcc.Mailboxes) mailMessage.Bcc.Add(new MailAddress(bcc.Address, bcc.Name));

            // Handle HTML body if present
            if (!string.IsNullOrEmpty(mimeMessage.HtmlBody)) mailMessage.Body = mimeMessage.HtmlBody;

            // Add headers
            foreach (var header in mimeMessage.Headers) mailMessage.Headers.Add(header.Field, header.Value);

            return mailMessage;
        }

        private static void SaveAttachmentsInDirectory(MimeMessage message, string saveDirectory)
        {
            if (!Directory.Exists(saveDirectory)) Directory.CreateDirectory(saveDirectory);

            foreach (var attachment in message.Attachments)
            {
                if (!(attachment is MimePart part)) continue;
                var fileName = part.FileName;
                var filePath = Path.Combine(saveDirectory, fileName);

                using (var stream = File.Create(filePath))
                {
                    if (part.Content is MimeContent content) content.Stream.CopyTo(stream);
                }
            }
        }
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

    public enum EmailSaveAttachmentsEnum
    {
        [Display(Name = "Do not save attachments", Description = "Does not save any attachments.")]
        DoNotSaveAttachments,

        [Display(Name = "Save attachments", Description = "Saves all attachments.")]
        SaveAttachments
    }
}