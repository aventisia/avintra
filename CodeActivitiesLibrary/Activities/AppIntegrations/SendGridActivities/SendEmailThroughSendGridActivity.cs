using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using CodeActivitiesLibrary.Extensions;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace CodeActivitiesLibrary.AppIntegrations.EmailActivities
{
    [DisplayName("Send Email with SendGrid")]
    [Description("Sends an email using SendGrid's API.")]
    public class SendEmailThroughSendGridActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("From")]
        [Description("The sender's email address.")]
        public InArgument<string> From { get; set; }

        [RequiredArgument]
        [DisplayName("To")]
        [Description("The recipient's email address(es) (comma-separated).")]
        public InArgument<string> To { get; set; }

        [DisplayName("CC")]
        [Description("The CC recipients' email addresses (comma-separated).")]
        public InArgument<string> Cc { get; set; }

        // The BCC recipient(s) email address(es), comma-separated (optional)
        [DisplayName("BCC")]
        [Description("The BCC recipients' email addresses (comma-separated).")]
        public InArgument<string> Bcc { get; set; }

        [RequiredArgument]
        [DisplayName("Subject")]
        [Description("The subject of the email.")]
        public InArgument<string> Subject { get; set; }

        [RequiredArgument]
        [DisplayName("Body")]
        [Description("The body of the email.")]
        public InArgument<string> Body { get; set; }

        [DisplayName("Body Format")]
        [Description("The format of the email body (Text or Html).")]
        [DefaultValue(EmailBodyFormatEnum.Text)]
        public InArgument<EmailBodyFormatEnum> BodyFormat { get; set; }

        [DisplayName("Attachments")]
        [Description("Paths to files to attach to the email (comma-separated).")]
        public InArgument<string> Attachments { get; set; }

        [RequiredArgument]
        [DisplayName("SendGrid API Key")]
        [Description("The SendGrid API Key.")]
        public InArgument<string> SendGridApiKey { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var from = From.Get(context);
                var to = To.Get(context);
                var subject = Subject.Get(context);
                var body = Body.Get(context);
                var apiKey = SendGridApiKey.Get(context);

                // Validate required fields
                if (string.IsNullOrEmpty(from))
                    throw new ArgumentException("From address is required.");

                if (string.IsNullOrEmpty(to))
                    throw new ArgumentException("To address is required.");

                if (string.IsNullOrEmpty(subject))
                    throw new ArgumentException("Subject is required.");

                if (string.IsNullOrEmpty(body))
                    throw new ArgumentException("Body is required.");

                if (string.IsNullOrEmpty(apiKey))
                    throw new ArgumentException("SendGrid API Key is required.");

                // Retrieve optional arguments
                var cc = Cc.Get(context);
                var bcc = Bcc.Get(context);
                var bodyFormat = BodyFormat.Get(context);
                var attachments = Attachments.Get(context);

                // Initialize SendGrid client and message
                var client = new SendGridClient(apiKey);
                var fromAddress = new EmailAddress(from);

                var msg = new SendGridMessage
                {
                    From = fromAddress,
                    Subject = subject
                };

                // Set email body format
                if (bodyFormat == EmailBodyFormatEnum.Html)
                    msg.HtmlContent = body;
                else
                    msg.PlainTextContent = body;

                // Add "To" recipients
                var toAddresses = SplitEmails(to);
                if (toAddresses.Length == 0)
                    throw new ArgumentException("At least one valid 'To' address is required.");
                msg.AddTos(toAddresses.ToList());

                // Add "CC" recipients if provided
                if (!string.IsNullOrWhiteSpace(cc))
                {
                    var ccAddresses = SplitEmails(cc);
                    if (ccAddresses.Length > 0)
                        msg.AddCcs(ccAddresses.ToList());
                }

                // Add "BCC" recipients if provided
                if (!string.IsNullOrWhiteSpace(bcc))
                {
                    var bccAddresses = SplitEmails(bcc);
                    if (bccAddresses.Length > 0)
                        msg.AddBccs(bccAddresses.ToList());
                }

                // Add attachments if provided
                if (!string.IsNullOrWhiteSpace(attachments))
                {
                    foreach (var filePath in attachments.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        var path = filePath.Trim();
                        try
                        {
                            if (!System.IO.File.Exists(path))
                            {
                                // Throw if attachment file does not exist
                                throw new System.IO.FileNotFoundException($"Attachment file not found: {path}");
                            }
                            var bytes = System.IO.File.ReadAllBytes(path);
                            var base64 = Convert.ToBase64String(bytes);
                            var fileName = System.IO.Path.GetFileName(path);
                            msg.AddAttachment(fileName, base64);
                        }
                        catch (Exception ex)
                        {
                            // Rethrow with additional context if attachment processing fails
                            throw new Exception($"Error processing attachment '{path}': {ex.Message}", ex);
                        }
                    }
                }

                // Send the email synchronously and get the response
                var response = client.SendEmailAsync(msg).GetAwaiter().GetResult();

                // Set output arguments based on SendGrid response
                if ((int)response.StatusCode >= 200 && (int)response.StatusCode < 300)
                {
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Email sent successfully to {to}.");
                }
                else
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"SendGrid returned {response.StatusCode}.");
                }
            }
            // Handle input validation errors
            catch (ArgumentException ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Input error: {ex.Message}");
            }
            // Handle missing attachment errors
            catch (System.IO.FileNotFoundException ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Attachment error: {ex.Message}");
            }
            // Handle all other errors
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error sending email: {ex.Message}");
            }
        }

        /// <summary>
        /// Splits a comma-separated string of email addresses into an array of EmailAddress objects.
        /// Ignores empty or whitespace entries.
        /// </summary>
        /// <param name="emails">Comma-separated email addresses.</param>
        /// <returns>Array of EmailAddress objects.</returns>
        private static EmailAddress[] SplitEmails(string emails)
        {
            if (string.IsNullOrWhiteSpace(emails))
                return new EmailAddress[0];

            return emails
                .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim())
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Select(e => new EmailAddress(e))
                .ToArray();
        }
    }
}