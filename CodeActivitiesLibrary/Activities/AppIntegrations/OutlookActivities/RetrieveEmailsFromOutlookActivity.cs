using Microsoft.Office.Interop.Outlook;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using Exception = System.Exception;

namespace CodeActivitiesLibrary.AppIntegrations.OutlookActivities
{
    [DisplayName("Retrieve Emails from Outlook")]
    [Description(
        "Retrieves email messages from a specified Outlook folder. Optionally filters by unread status or subject.")]
    public class RetrieveEmailsFromOutlookActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object used to retrieve emails.")]
        public InArgument<Application> OutlookApplication { get; set; }

        [RequiredArgument]
        [DefaultValue("Inbox")]

        [DisplayName("Folder Name")]
        [Description("The name of the folder to retrieve emails from. Example: 'Inbox', 'Sent', 'Junk'")]
        public InArgument<string> FolderName { get; set; }


        [DefaultValue(null)]
        [DisplayName("Filter Subject")]
        [Description("Optional: Filter emails containing this text in the subject.")]
        public InArgument<string> FilterSubject { get; set; }


        [DefaultValue(false)]
        [DisplayName("Only Unread")]
        [Description("If true, only unread emails are retrieved.")]
        public InArgument<bool> OnlyUnread { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Email Messages")]
        [Description("Returns the list of retrieved email messages as MailItem objects.")]
        public OutArgument<List<MailItem>> EmailMessages { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            var mailItems = new List<MailItem>();

            try
            {
                var outlookApp = OutlookApplication.Get(context);
                var folderName = FolderName.Get(context);
                var filterSubject = FilterSubject.Get(context);
                var onlyUnread = OnlyUnread.Get(context);

                if (outlookApp == null)
                    throw new InvalidOperationException("Outlook application is not available.");

                // Get namespace
                var ns = outlookApp.GetNamespace("MAPI");

                // Get target folder
                var targetFolder = GetMAPIFolder(ns, folderName);

                if (targetFolder == null)
                    throw new InvalidOperationException($"Folder '{folderName}' not found.");

                // Get items in the folder
                var folderItems = targetFolder.Items;

                // Apply unread filter
                if (onlyUnread)
                {
                    folderItems = folderItems.Restrict("[UnRead] = true");
                }

                // Loop through items and collect MailItems
                for (var i = 1; i <= folderItems.Count; i++)
                {
                    var item = folderItems[i];

                    if (!(item is MailItem mailItem) || string.IsNullOrEmpty(mailItem.Subject)) continue;
                    // Apply subject filter if provided
                    if (!string.IsNullOrWhiteSpace(filterSubject) &&
                        !mailItem.Subject.Equals(filterSubject, StringComparison.OrdinalIgnoreCase))
                        continue;

                    mailItems.Add(mailItem);
                }
            }
            catch (Exception ex)
            {
                status = $"Error retrieving emails: {ex.Message}";
            }

            EmailMessages.Set(context, mailItems);
            StatusMessage.Set(context, status);
        }

        // Helper: Gets MAPIFolder by name
        private MAPIFolder GetMAPIFolder(NameSpace ns, string folderName)
        {
            switch (folderName.ToLower())
            {
                case "inbox":
                    return ns.GetDefaultFolder(OlDefaultFolders.olFolderInbox);
                case "sent":
                    return ns.GetDefaultFolder(OlDefaultFolders.olFolderSentMail);
                case "junk":
                    return ns.GetDefaultFolder(OlDefaultFolders.olFolderJunk);
                case "outbox":
                    return ns.GetDefaultFolder(OlDefaultFolders.olFolderOutbox);
                default:
                    throw new ArgumentException($"Unsupported folder: {folderName}");
            }
        }
    }
}