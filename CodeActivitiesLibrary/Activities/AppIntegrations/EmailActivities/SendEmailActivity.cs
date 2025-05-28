using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Mail;

namespace CodeActivitiesLibrary.AppIntegrations.EmailActivities
{
    // Activity to send an email message
    [DisplayName("Send Email"), Description("Creates and sends a new email message.")]
    public class SendEmailActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The SMTP server URL.")]
        public InArgument<string> SmtpServer { get; set; }

        [RequiredArgument, Category("Input"), Description("The sender's email address.")]
        public InArgument<string> From { get; set; }

        [RequiredArgument, Category("Input"), Description("The recipient's email address.")]
        public InArgument<string> To { get; set; }

        [RequiredArgument, Category("Input"), Description("The subject of the email.")]
        public InArgument<string> Subject { get; set; }

        [RequiredArgument, Category("Input"), Description("The body of the email.")]
        public InArgument<string> Body { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var smtpServer = SmtpServer.Get(context);
            var from = From.Get(context);
            var to = To.Get(context);
            var subject = Subject.Get(context);
            var body = Body.Get(context);
            var status = "";

            try
            {
                // Simulate sending an email message (actual implementation would use SmtpClient or similar)
                using (var client = new SmtpClient(smtpServer))
                {
                    var message = new MailMessage(from, to, subject, body);
                    client.Send(message);
                }

                status = $"Email sent successfully to '{to}' with subject '{subject}'.";
            }
            catch (Exception ex)
            {
                status = $"Error sending email: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}