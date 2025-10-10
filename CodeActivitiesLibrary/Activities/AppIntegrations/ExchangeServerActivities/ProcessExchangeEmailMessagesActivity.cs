using CodeActivitiesLibrary.Extensions;
using Microsoft.Exchange.WebServices.Data;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.ExchangeServerActivities
{
    [DisplayName("Process Exchange Email Messages")]
    [Description("Move, delete, or mark as unread an email message (or a list of email messages).")]
    [ActivityMetaData(nodeImg:"/assets/ExchangeServer.svg")]
    public class ProcessExchangeEmailMessagesActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Exchange Connection")]
        [Description("The Exchange service object representing the connection to the Exchange server.")]
        public InArgument<ExchangeService> ExchangeConnection { get; set; }

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("The action to perform (e.g., Move, Delete, MarkAsUnread).")]
        public InArgument<OperationEnum> Operation { get; set; }

        [RequiredArgument]
        [DisplayName("Email Message(s) to Process")]
        [Description("The IDs of the email messages to process.")]
        public InArgument<List<string>> EmailMessageIds { get; set; }


        [DisplayName("Mailbox Type")]
        [Description("Specifies whether the mailbox is personal or shared.")]
        public InArgument<MailboxTypeEnum> MailboxType { get; set; }


        [DisplayName("Shared Mailbox Address")]
        [Description("The email address of the shared mailbox (required if 'Mailbox Type' is 'Shared').")]
        [RenderIfCondition(nameof(MailboxType), MailboxTypeEnum.Shared)]
        public InArgument<string> SharedMailboxAddress { get; set; }


        [DisplayName("Move to Custom Folder")]
        [Description("If true, moves emails to a custom folder instead of predefined folders.")]
        public InArgument<bool> MoveToCustomFolder { get; set; }


        [DisplayName("Exchange Folder")]
        [Description("The folder to move emails to (if not using custom folder).")]
        [RenderIfCondition(nameof(MoveToCustomFolder), false)]
        public InArgument<WellKnownFolderName> ExchangeFolder { get; set; }


        [DisplayName("Custom Folder Name")]
        [Description("The name of the custom folder to move emails to (if 'Move to Custom Folder' is enabled).")]
        [RenderIfCondition(nameof(MoveToCustomFolder), true)]
        public InArgument<string> CustomFolderName { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var exchangeService = ExchangeConnection.Get(context);
                var operation = Operation.Get(context);
                var messageIds = EmailMessageIds.Get(context);
                var mailboxType = MailboxType.Get(context);
                var sharedMailboxAddress = SharedMailboxAddress.Get(context);
                var moveToCustomFolder = MoveToCustomFolder.Get(context);
                var exchangeFolder = ExchangeFolder.Get(context);
                var customFolderName = CustomFolderName.Get(context);

                // Validate inputs
                if (exchangeService == null)
                    throw new ArgumentException("Exchange connection cannot be null.");

                if (messageIds == null || !messageIds.Any())
                    throw new ArgumentException("Email message IDs cannot be empty.");

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

                // Process email messages
                foreach (var emailMessage in messageIds.Select(messageId => new ItemId(messageId))
                             .Select(itemId => EmailMessage.Bind(exchangeService, itemId)))
                {
                    switch (operation)
                    {
                        case OperationEnum.Delete:
                            emailMessage.Delete(DeleteMode.HardDelete);
                            break;

                        case OperationEnum.MarkAsUnread:
                            emailMessage.IsRead = false;
                            emailMessage.Update(ConflictResolutionMode.AlwaysOverwrite);
                            break;

                        case OperationEnum.MoveToFolder:
                            if (moveToCustomFolder)
                            {
                                // Move to custom folder
                                var folderId = new FolderId(WellKnownFolderName.Inbox, sharedMailboxAddress);
                                var targetFolder = Folder.Bind(exchangeService, folderId);
                                emailMessage.Move(targetFolder.Id);
                            }
                            else
                            {
                                // Move to predefined folder
                                emailMessage.Move(exchangeFolder);
                            }

                            break;

                        default:
                            throw new ArgumentOutOfRangeException(nameof(operation));
                    }
                }
                status = $"Processed {messageIds.Count} email messages with action '{operation}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);

            }
            catch (Exception ex)
            {
                status = $"Error processing email messages: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }

    public enum OperationEnum
    {
        [Display(Name = "Delete", Description = "Deletes email messages from the server.")]
        Delete,

        [Display(Name = "Mark as Unread", Description = "Marks email messages as unread.")]
        MarkAsUnread,

        [Display(Name = "Move to Mail Folder", Description = "Moves messages to a specified mail folder.")]
        MoveToFolder
    }

    public enum MailboxTypeEnum
    {
        [Display(Name = "Personal", Description = "Processes emails from the current user's mailbox.")]
        Personal,

        [Display(Name = "Shared", Description = "Processes emails from a shared mailbox.")]
        Shared
    }
}