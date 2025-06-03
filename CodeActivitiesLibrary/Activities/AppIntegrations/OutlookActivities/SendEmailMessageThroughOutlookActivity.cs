using Microsoft.Office.Interop.Outlook;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using Exception = System.Exception;

namespace CodeActivitiesLibrary.Activities.AppIntegrations.OutlookActivities
{
    [DisplayName("Send Email Message Through Outlook")]
    [Description("Sends an email message through Microsoft Outlook using real COM interop.")]
    public class SendEmailMessageThroughOutlookActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object used to send the email.")]
        public InArgument<Application> OutlookApplication { get; set; }

        [RequiredArgument]

        [DisplayName("Recipient(s)")]
        [Description("The email address(es) of the recipient(s). Separate multiple addresses by semicolons (;).")]
        public InArgument<string> To { get; set; }


        [DisplayName("CC Recipient(s)")]
        [Description("Optional: The CC email address(es), separated by semicolons (;).")]
        public InArgument<string> CC { get; set; }


        [DisplayName("BCC Recipient(s)")]
        [Description("Optional: The BCC email address(es), separated by semicolons (;).")]
        public InArgument<string> BCC { get; set; }

        [RequiredArgument]

        [DisplayName("Subject")]
        [Description("The subject line of the email message.")]
        public InArgument<string> Subject { get; set; }

        [RequiredArgument]

        [DisplayName("Body")]
        [Description("The body content of the email message.")]
        public InArgument<string> Body { get; set; }


        [DefaultValue(false)]
        [DisplayName("Is Body HTML")]
        [Description("Determines whether the body should be interpreted as HTML.")]
        public InArgument<bool> BodyIsHtml { get; set; }


        [DefaultValue(false)]
        [DisplayName("Save As Draft")]
        [Description("If true, the email is saved as a draft instead of being sent immediately.")]
        public InArgument<bool> SaveAsDraft { get; set; }


        [DisplayName("Attachments")]
        [Description("Full path of any attachment files. Multiple paths can be separated by spaces.")]
        public InArgument<string> Attachments { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var outlookApp = OutlookApplication.Get(context);
                var recipients = To.Get(context);
                var ccRecipients = CC.Get(context);
                var bccRecipients = BCC.Get(context);
                var subject = Subject.Get(context);
                var body = Body.Get(context);
                var isHtml = BodyIsHtml.Get(context);
                var saveDraft = SaveAsDraft.Get(context);
                var attachments = Attachments.Get(context);

                if (outlookApp == null)
                    throw new InvalidOperationException("Outlook application is not available.");

                // Create new email
                var mailItem = outlookApp.CreateItem(OlItemType.olMailItem) as MailItem;

                if (mailItem == null)
                    throw new InvalidOperationException("Failed to create a new email item.");

                // Set basic properties
                mailItem.Subject = subject;
                mailItem.To = recipients;
                mailItem.CC = ccRecipients;
                mailItem.BCC = bccRecipients;

                if (isHtml)
                {
                    mailItem.HTMLBody = body;
                    mailItem.BodyFormat = OlBodyFormat.olFormatHTML;
                }
                else
                {
                    mailItem.Body = body;
                    mailItem.BodyFormat = OlBodyFormat.olFormatPlain;
                }

                // Add attachments if provided
                if (!string.IsNullOrWhiteSpace(attachments))
                {
                    var filePaths = attachments.Split(' ', ';', ',').AsEnumerable()
                        .Select(x => x.Trim())
                        .Where(x => !string.IsNullOrEmpty(x))
                        .ToArray();

                    foreach (var file in filePaths)
                    {
                        if (!File.Exists(file))
                            throw new FileNotFoundException($"Attachment file '{file}' does not exist.");

                        mailItem.Attachments.Add(file, OlAttachmentType.olByValue);
                    }
                }

                // Send or save as draft
                if (saveDraft)
                {
                    mailItem.Save();
                    status = $"Email '{subject}' saved as draft.";
                }
                else
                {
                    mailItem.Send();
                    status = $"Email '{subject}' sent successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error sending email: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}