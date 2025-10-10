using CodeActivitiesLibrary.Extensions;
using Microsoft.Exchange.WebServices.Data;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.ExchangeServerActivities
{
    [DisplayName("Retrieve Exchange Email Messages")]
    [Description("Retrieves email messages from the specified Exchange server.")]
    [ActivityMetaData(nodeImg:"/assets/ExchangeServer.svg")]
    public class RetrieveExchangeEmailMessagesActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Exchange Connection")]
        [Description("The Exchange service object representing the connection to the Exchange server.")]
        public InArgument<ExchangeService> ExchangeConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Mailbox Type")]
        [Description("Specifies whether the mailbox is personal or shared.")]
        public InArgument<MailboxTypeEnum> MailboxType { get; set; }

        [DisplayName("Shared Mailbox Address")]
        [Description("The email address of the shared mailbox (required if 'Mailbox Type' is 'Shared').")]
        [RenderIfCondition(nameof(MailboxType), MailboxTypeEnum.Shared)]
        public InArgument<string> SharedMailboxAddress { get; set; }

        [DisplayName("Retrieve Email Messages from Custom Folder")]
        [Description("If true, retrieves emails from a custom folder instead of predefined folders.")]
        public InArgument<bool> RetrieveFromCustomFolder { get; set; }

        [DisplayName("Exchange Folder")]
        [Description("The folder to retrieve emails from (e.g., Inbox, Sent Items).")]
        [RenderIfCondition(nameof(RetrieveFromCustomFolder), false)]
        public InArgument<WellKnownFolderName> ExchangeFolder { get; set; }

        [DisplayName("Mail Folder")]
        [Description(
            "The name of the custom folder to retrieve emails from (if 'Retrieve Email Messages from Custom Folder' is enabled).")]
        [RenderIfCondition(nameof(RetrieveFromCustomFolder), true)]
        public InArgument<string> CustomFolderName { get; set; }

        [DisplayName("Retrieve")]
        [Description("Specifies which emails to retrieve (e.g., All email messages, Unread email messages only).")]
        public InArgument<RetrieveModeEnum> RetrieveMode { get; set; }

        [DisplayName("Mark as Read")]
        [Description("If true, marks retrieved emails as read.")]
        public InArgument<bool> MarkAsRead { get; set; }

        [DisplayName("From Contains")]
        [Description("Filters emails where the sender's address contains this text.")]
        public InArgument<string> FromContains { get; set; }

        [DisplayName("To Contains")]
        [Description("Filters emails where the recipient's address contains this text.")]
        public InArgument<string> ToContains { get; set; }

        [DisplayName("Subject Contains")]
        [Description("Filters emails where the subject contains this text.")]
        public InArgument<string> SubjectContains { get; set; }

        [DisplayName("Body Contains")]
        [Description("Filters emails where the body contains this text.")]
        public InArgument<string> BodyContains { get; set; }

        [DisplayName("Attachments")]
        [Description("Specifies how to handle attachments.")]
        public InArgument<AttachmentHandlingEnum> AttachmentHandling { get; set; }

        [DisplayName("Save Attachments Into")]
        [Description("The directory to save attachments (required if 'Attachments' is 'Save Attachments').")]
        [RenderIfCondition(nameof(AttachmentHandling), AttachmentHandlingEnum.SaveAttachments)]
        public InArgument<string> SaveAttachmentsDirectory { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Retrieved Emails")]
        [Description("The list of retrieved email messages.")]
        public OutArgument<IEnumerable<EmailMessage>> RetrievedEmails { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            IEnumerable<EmailMessage> emails = null;

            try
            {
                var exchangeService = ExchangeConnection.Get(context);
                var mailboxType = MailboxType.Get(context);
                var sharedMailboxAddress = SharedMailboxAddress.Get(context);
                var retrieveFromCustomFolder = RetrieveFromCustomFolder.Get(context);
                var exchangeFolder = ExchangeFolder.Get(context);
                var customFolderName = CustomFolderName.Get(context);
                var retrieveMode = RetrieveMode.Get(context);
                var markAsRead = MarkAsRead.Get(context);
                var fromContains = FromContains.Get(context);
                var toContains = ToContains.Get(context);
                var subjectContains = SubjectContains.Get(context);
                var bodyContains = BodyContains.Get(context);
                var attachmentHandling = AttachmentHandling.Get(context);
                var saveAttachmentsDir = SaveAttachmentsDirectory.Get(context);

                // Validate inputs
                if (exchangeService == null)
                    throw new ArgumentException("Exchange connection cannot be null.");

                switch (mailboxType)
                {
                    case MailboxTypeEnum.Personal:
                        break;

                    case MailboxTypeEnum.Shared:
                        if (string.IsNullOrWhiteSpace(sharedMailboxAddress))
                            throw new ArgumentException("Shared mailbox address cannot be empty.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(mailboxType));
                }

                // Configure folder
                FolderId folderId;
                if (retrieveFromCustomFolder)
                {
                    if (string.IsNullOrWhiteSpace(customFolderName))
                        throw new ArgumentException("Custom folder name cannot be empty.");

                    folderId = new FolderId(WellKnownFolderName.Inbox, sharedMailboxAddress);
                }
                else
                {
                    folderId = new FolderId(exchangeFolder);
                }

                // Create search filter
                SearchFilter searchFilter = null;
                switch (retrieveMode)
                {
                    case RetrieveModeEnum.AllEmails:
                        searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.IsRead, false);
                        break;

                    case RetrieveModeEnum.UnreadEmailsOnly:
                        searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.IsRead, false);
                        break;

                    case RetrieveModeEnum.ReadEmailsOnly:
                        searchFilter = new SearchFilter.IsEqualTo(EmailMessageSchema.IsRead, true);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(retrieveMode));
                }

                // Apply additional filters
                if (!string.IsNullOrWhiteSpace(fromContains))
                {
                    searchFilter = new SearchFilter.ContainsSubstring(EmailMessageSchema.From, fromContains);
                }

                if (!string.IsNullOrWhiteSpace(toContains))
                {
                    searchFilter = new SearchFilter.ContainsSubstring(EmailMessageSchema.ToRecipients, toContains);
                }

                if (!string.IsNullOrWhiteSpace(subjectContains))
                {
                    searchFilter = new SearchFilter.ContainsSubstring(EmailMessageSchema.Subject, subjectContains);
                }

                if (!string.IsNullOrWhiteSpace(bodyContains))
                {
                    searchFilter = new SearchFilter.ContainsSubstring(EmailMessageSchema.Body, bodyContains);
                }

                // Find emails
                var folder = Folder.Bind(exchangeService, folderId);
                var view = new ItemView(100) { PropertySet = BasePropertySet.FirstClassProperties };
                var results = folder.FindItems(searchFilter, view);

                // Handle attachments
                foreach (var item in results.Items)
                {
                    if (attachmentHandling == AttachmentHandlingEnum.SaveAttachments)
                    {
                        if (string.IsNullOrWhiteSpace(saveAttachmentsDir))
                            throw new ArgumentException("Save attachments directory cannot be empty.");

                        foreach (var attachment in ((EmailMessage)item).Attachments)
                        {
                            if (!(attachment is FileAttachment fileAttachment)) continue;
                            fileAttachment.Load();
                            File.WriteAllBytes(Path.Combine(saveAttachmentsDir, fileAttachment.Name),
                                fileAttachment.Content);
                        }
                    }
                }

                // Mark emails as read
                if (markAsRead)
                {
                    foreach (var item in results.Items)
                    {
                        ((EmailMessage)item).IsRead = true;
                        ((EmailMessage)item).Update(ConflictResolutionMode.AlwaysOverwrite);
                    }
                }

                emails = results.Items.Cast<EmailMessage>();
                RetrievedEmails.Set(context, emails);
                status = $"Successfully retrieved {emails.Count()} emails.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {

                RetrievedEmails.Set(context, emails);
                IsSuccess.Set(context, false);
                status = $"Error retrieving emails: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }

    public enum RetrieveModeEnum
    {
        [Display(Name = "All email messages", Description = "Retrieves all email messages.")]
        AllEmails,

        [Display(Name = "Unread email messages only", Description = "Retrieves only unread email messages.")]
        UnreadEmailsOnly,

        [Display(Name = "Read email messages only", Description = "Retrieves only read email messages.")]
        ReadEmailsOnly
    }

    public enum AttachmentHandlingEnum
    {
        [Display(Name = "Do not save attachments", Description = "Does not save any attachments.")]
        DoNotSaveAttachments,

        [Display(Name = "Save attachments", Description = "Saves attachments to the specified directory.")]
        SaveAttachments
    }
}