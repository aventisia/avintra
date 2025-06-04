using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExchangeServerActivities
{
    // Activity to send an Exchange email message
    [DisplayName("Send Exchange Email Message"), Description("Create and send a new email message.")]
    public class SendExchangeEmailMessageActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The recipient's email address.")]
        public InArgument<string> Recipient { get; set; }

        [RequiredArgument, Category("Input"), Description("The subject of the email.")]
        public InArgument<string> Subject { get; set; }

        [RequiredArgument, Category("Input"), Description("The body of the email.")]
        public InArgument<string> Body { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var recipient = Recipient.Get(context);
            var subject = Subject.Get(context);
            var body = Body.Get(context);
            var status = "";

            try
            {
                // Simulate sending an email message (actual implementation would use Exchange Web Services)
                status = $"Simulated email sent to '{recipient}' with subject '{subject}'.";
            }
            catch (Exception ex)
            {
                status = $"Error sending email: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}