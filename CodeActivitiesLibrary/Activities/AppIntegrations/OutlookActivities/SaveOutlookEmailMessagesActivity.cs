using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Outlook;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using Exception = System.Exception;

namespace CodeActivitiesLibrary.AppIntegrations.OutlookActivities
{
    [DisplayName("Save Outlook Email Messages")]
    [Description("Saves selected Outlook email messages (.msg files) to a specified location.")]
    public class SaveOutlookEmailMessagesActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object used to access mail items.")]
        public InArgument<Application> OutlookApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Email Messages")]
        [Description("A list of MailItem objects representing the emails to save.")]
        public InArgument<List<MailItem>> EmailMessages { get; set; }

        [RequiredArgument]
        [DisplayName("Save Location")]
        [Description("The folder path where the .msg files should be saved.")]
        public InArgument<string> SaveLocation { get; set; }

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
                var savePath = SaveLocation.Get(context);

                if (outlookApp == null)
                    throw new InvalidOperationException("Outlook application is not available.");

                if (mailItems == null || mailItems.Count == 0)
                    throw new InvalidOperationException("No email messages provided to save.");

                if (string.IsNullOrEmpty(savePath))
                    throw new ArgumentException("Save location is required to store email messages.");

                // Save each email as .msg file
                var count = 0;
                foreach (var mailItem in mailItems)
                {
                    if (mailItem == null) continue;
                    var safeSubject =
                        string.Concat(mailItem.Subject.Split(System.IO.Path.GetInvalidFileNameChars()));
                    var filePath = System.IO.Path.Combine(savePath, $"{safeSubject}.msg");
                    mailItem.SaveAs(filePath, OlSaveAsType.olMSG);
                    count++;
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully saved {count} email(s) to '{savePath}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error saving emails: {ex.Message}");
            }


        }
    }
}