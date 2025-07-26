using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
namespace CodeActivitiesLibrary.AppIntegrations.TwilioActivities
{

    [Description("Sends a WhatsApp message using Twilio service.")]
    [DisplayName("Send WhatsApp Message (Twilio)")]
    public class SendWhatsappMessageActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("Twilio Account SID")]
        [DisplayName("Account SID")]
        public InArgument<string> AccountSid { get; set; }

        [RequiredArgument]
        [Description("Twilio Auth Token")]
        [DisplayName("Auth Token")]
        public InArgument<string> AuthToken { get; set; }

        [RequiredArgument]
        [Description("The WhatsApp-enabled Twilio number (in E.164 format, e.g. +15551234567)")]
        [DisplayName("From WhatsApp Number")]
        public InArgument<string> FromNumber { get; set; }

        [RequiredArgument]
        [Description("The recipient's WhatsApp number (in E.164 format, e.g. +15551234567)")]
        [DisplayName("To WhatsApp Number")]
        public InArgument<string> ToNumber { get; set; }

        [RequiredArgument]
        [Description("The body/content of the WhatsApp message")]
        [DisplayName("Message Body")]
        public InArgument<string> MessageBody { get; set; }

        [Description("Output result: Success or Error message")]
        [DisplayName("Result Output")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string accountSid = AccountSid.Get(context);
                string authToken = AuthToken.Get(context);
                string fromNumber = FromNumber.Get(context);
                string toNumber = ToNumber.Get(context);
                string messageBody = MessageBody.Get(context);

                TwilioClient.Init(accountSid, authToken);

                var from = new PhoneNumber("whatsapp:" + NormalizeNumber(fromNumber));
                var to = new PhoneNumber("whatsapp:" + NormalizeNumber(toNumber));

                var message = MessageResource.Create(
                    body: messageBody,
                    from: from,
                    to: to
                );

                Result.Set(context, $"WhatsApp message sent successfully. SID: {message.Sid}");
                StatusMessage.Set(context, "WhatsApp message sent successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                Result.Set(context, "Error sending WhatsApp message");
                StatusMessage.Set(context, $"Error sending WhatsApp message: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private string NormalizeNumber(string number)
        {
            number = number.Trim();
            return number.StartsWith("+")
                ? "+" + new string(number.Skip(1).Where(char.IsDigit).ToArray())
                : new string(number.Where(char.IsDigit).ToArray());
        }
    }
}
