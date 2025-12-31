using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Outlook;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Exception = System.Exception;

namespace CodeActivitiesLibrary.AppIntegrations.OutlookActivities
{
    [DisplayName("Process Email Messages in Outlook")]
    [Description("Moves or deletes a collection of email messages in Outlook.")]
    [ActivityMetaData(nodeImg: "/assets/Outlook.svg")]
    public class ProcessEmailMessagesInOutlookActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object used to process messages.")]
        public InArgument<Application> OutlookApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Email Messages")]
        [Description("The list of email messages to be processed (e.g., moved or deleted).")]
        public InArgument<List<MailItem>> EmailMessages { get; set; }

        [RequiredArgument]
        [DisplayName("Action Type")]
        [Description("Select whether to move or delete the selected email messages.")]
        [DefaultValue(ActionTypeEnum.Delete)]
        public InArgument<ActionTypeEnum> ActionType { get; set; }


        [DisplayName("Target Folder")]
        [Description("If action is 'Move', specify the target folder (Inbox, Sent, Junk, Outbox).")]
        [RenderIfCondition(nameof(ActionType), ActionTypeEnum.Move)]
        public InArgument<string> TargetFolder { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {

            try
            {
                var outlookApp = OutlookApplication.Get(context);
                var mailItems = EmailMessages.Get(context);
                var action = ActionType.Get(context);
                var targetFolder = TargetFolder.Get(context);

                if (outlookApp == null)
                    throw new InvalidOperationException("Outlook application is not available.");

                if (mailItems == null || mailItems.Count == 0)
                    throw new InvalidOperationException("No email messages provided to process.");

                foreach (var mailItem in mailItems.Where(mailItem => mailItem != null))
                {
                    switch (action)
                    {
                        case OutlookActivities.ActionTypeEnum.Move when string.IsNullOrWhiteSpace(targetFolder):
                            throw new InvalidOperationException("Target folder is required when moving emails.");
                        // Move the message
                        case OutlookActivities.ActionTypeEnum.Move:
                            MoveMailItem(outlookApp, mailItem, targetFolder);
                            break;
                        case ActionTypeEnum.Delete:
                            // Delete the message
                            mailItem.Delete();
                            break;
                        default:
                            throw new InvalidOperationException("Unsupported action type.");
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Processed Email Messages in Outlook succesfully");

            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error processing emails: {ex.Message}");
            }
        }

        // Helper method to move an email to a specified folder
        private static void MoveMailItem(Application outlookApp, MailItem mailItem, string folderName)
        {
            var ns = outlookApp.GetNamespace("MAPI");

            MAPIFolder destinationFolder = null;

            switch (folderName.ToLower())
            {
                case "inbox":
                    destinationFolder = ns.GetDefaultFolder(OlDefaultFolders.olFolderInbox);
                    break;

                case "sent":
                    destinationFolder = ns.GetDefaultFolder(OlDefaultFolders.olFolderSentMail);
                    break;

                case "outbox":
                    destinationFolder = ns.GetDefaultFolder(OlDefaultFolders.olFolderOutbox);
                    break;

                case "junk":
                    destinationFolder = ns.GetDefaultFolder(OlDefaultFolders.olFolderJunk);
                    break;

                default:
                    throw new ArgumentException($"Unknown folder '{folderName}'.");
            }

            if (destinationFolder != null)
            {
                mailItem.Move(destinationFolder);
            }
        }
    }

    public enum ActionTypeEnum
    {
        [Description("Deletes the selected email messages.")]
        Delete,

        [Description("Moves the selected email messages to another folder.")]
        Move
    }
}