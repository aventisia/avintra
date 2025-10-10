using CodeActivitiesLibrary.Extensions;
using Microsoft.Exchange.WebServices.Data;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.ExchangeServerActivities
{
    [DisplayName("Send Exchange Email Message")]
    [Description("Creates and sends a new email message using an Exchange connection.")]
    [ActivityMetaData(nodeImg:"/assets/ExchangeServer.svg")]
    public class SendExchangeEmailMessageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Exchange Connection")]
        [Description("The Exchange service object representing the connection to the Exchange server.")]
        public InArgument<ExchangeService> ExchangeConnection { get; set; }

        [RequiredArgument]
        [DisplayName("From")]
        [Description("The sender's email address or display name.")]
        public InArgument<string> From { get; set; }

        [RequiredArgument]
        [DisplayName("To")]
        [Description("The recipient's email addresses (comma-separated).")]
        public InArgument<string> To { get; set; }

        [DisplayName("CC")]
        [Description("The CC recipient's email addresses (comma-separated).")]
        public InArgument<string> Cc { get; set; }

        [DisplayName("BCC")]
        [Description("The BCC recipient's email addresses (comma-separated).")]
        public InArgument<string> Bcc { get; set; }

        [RequiredArgument]
        [DisplayName("Subject")]
        [Description("The subject of the email message.")]
        public InArgument<string> Subject { get; set; }

        [RequiredArgument]
        [DisplayName("Body")]
        [Description("The body content of the email message.")]
        public InArgument<string> Body { get; set; }

        [DisplayName("Body is HTML")]
        [Description("If true, treats the body as HTML content.")]
        public InArgument<bool> IsBodyHtml { get; set; }

        [DisplayName("Attachments")]
        [Description("Paths to files to attach to the email message (comma-separated).")]
        public InArgument<string> Attachments { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var exchangeService = ExchangeConnection.Get(context);
                var from = From.Get(context);
                var to = To.Get(context);
                var cc = Cc.Get(context);
                var bcc = Bcc.Get(context);
                var subject = Subject.Get(context);
                var body = Body.Get(context);
                var isBodyHtml = IsBodyHtml.Get(context);
                var attachmentPaths = Attachments.Get(context);

                // Validate inputs
                if (exchangeService == null)
                    throw new ArgumentException("Exchange connection cannot be null.");

                if (string.IsNullOrWhiteSpace(from))
                    throw new ArgumentException("Sender's email address cannot be empty.");

                if (string.IsNullOrWhiteSpace(to))
                    throw new ArgumentException("Recipient's email address cannot be empty.");

                // Create email message
                var emailMessage = new EmailMessage(exchangeService);

                // Set sender
                emailMessage.From = new EmailAddress(from);

                // Set recipients
                foreach (var recipient in to.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                    emailMessage.ToRecipients.Add(recipient.Trim());

                if (!string.IsNullOrWhiteSpace(cc))
                {
                    foreach (var recipient in cc.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                        emailMessage.CcRecipients.Add(recipient.Trim());
                }

                if (!string.IsNullOrWhiteSpace(bcc))
                {
                    foreach (var recipient in bcc.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                        emailMessage.BccRecipients.Add(recipient.Trim());
                }

                // Set subject and body
                emailMessage.Subject = subject;
                emailMessage.Body = new MessageBody(isBodyHtml ? BodyType.HTML : BodyType.Text, body);

                // Add attachments
                if (!string.IsNullOrWhiteSpace(attachmentPaths))
                {
                    foreach (var filePath in
                             attachmentPaths.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        if (!File.Exists(filePath))
                            throw new FileNotFoundException($"Attachment file not found: {filePath}");

                        emailMessage.Attachments.AddFileAttachment(filePath);
                    }
                }

                // Send email
                emailMessage.SendAndSaveCopy();


                status = $"Successfully sent email to '{to}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error sending email: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}