using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace CodeActivitiesLibrary.AppIntegrations.TwilioActivities
{
    [DisplayName("Send WhatsApp Message via Messaging Service")]
    [Description("Sends a WhatsApp message using Twilio Messaging Service.")]
    public class SendWhatsAppMessageViaMessagingServiceActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Account SID")]
        [Description("Your Twilio Account SID.")]
        public InArgument<string> AccountSid { get; set; }

        [RequiredArgument]
        [DisplayName("Auth Token")]
        [Description("Your Twilio Auth Token.")]
        public InArgument<string> AuthToken { get; set; }

        [RequiredArgument]
        [DisplayName("From WhatsApp Number")]
        [Description("The WhatsApp-enabled Twilio number to send from. Format: whatsapp:+14155238886")]
        public InArgument<string> FromNumber { get; set; }

        [RequiredArgument]
        [DisplayName("To WhatsApp Number")]
        [Description("The recipient's WhatsApp number. Format: whatsapp:+91xxxxxxxxxx")]
        public InArgument<string> ToNumber { get; set; }

        [RequiredArgument]
        [DisplayName("Messaging Service SID")]
        [Description("The SID of the Twilio Messaging Service to use.")]
        public InArgument<string> MessagingServiceSid { get; set; }

        [RequiredArgument]
        [DisplayName("Message Body")]
        [Description("The content of the WhatsApp message to send.")]
        public InArgument<string> MessageBody { get; set; }

        [Description("Output result: Success or Error message")]
        [DisplayName("Result Output")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve inputs
            string accountSid = AccountSid.Get(context);
            string authToken = AuthToken.Get(context);
            string fromNumber = FromNumber.Get(context);
            string toNumber = ToNumber.Get(context);
            string messagingServiceSid = MessagingServiceSid.Get(context);
            string messageBody = MessageBody.Get(context);

            // Initialize Twilio client
            TwilioClient.Init(accountSid, authToken);

            try
            {
                var message = MessageResource.Create(
                    from: new PhoneNumber(fromNumber),
                    to: new PhoneNumber(toNumber),
                    body: messageBody,
                    messagingServiceSid: messagingServiceSid
                );

                // Set output arguments
                Result.Set(context, message.Sid);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Message sent successfully");
            }
            catch (Exception ex)
            {
                Result.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to send WhatsApp message: {ex.Message}");
            }
        }
    }
}