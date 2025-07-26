using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace CodeActivitiesLibrary.AppIntegrations.TwilioActivities
{
    [DisplayName("Send WhatsApp Template Message")]
    [Description("Sends a WhatsApp template message using Twilio and predefined placeholders.")]
    public class SendWhatsAppTemplateMessageActivity : BaseCodeActivity
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
        [DisplayName("Template SID")]
        [Description("The SID of the approved WhatsApp template you want to send.")]
        public InArgument<string> TemplateSid { get; set; }

        [DisplayName("Language Code")]
        [Description("The language code for the template (default is 'en' for English).")]
        [DefaultValue("en")]
        public InArgument<string> LanguageCode { get; set; } = new InArgument<string>("en");

        [DisplayName("Body Parameter 1")]
        [Description("Optional: First body parameter to replace placeholders in the template.")]
        public InArgument<string> BodyParameter1 { get; set; }

        [DisplayName("Body Parameter 2")]
        [Description("Optional: Second body parameter to replace placeholders in the template.")]
        public InArgument<string> BodyParameter2 { get; set; }

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
            string templateSid = TemplateSid.Get(context);
            string languageCode = LanguageCode.Get(context);

            string bodyParam1 = BodyParameter1.Get(context);
            string bodyParam1Encoded = Uri.EscapeDataString(bodyParam1 ?? "");

            string bodyParam2 = BodyParameter2.Get(context);
            string bodyParam2Encoded = Uri.EscapeDataString(bodyParam2 ?? "");

            // Initialize Twilio client
            TwilioClient.Init(accountSid, authToken);

            try
            {
                var message = MessageResource.Create(
                    from: new PhoneNumber(fromNumber),
                    to: new PhoneNumber(toNumber),
                    body: $"{{\"body\":{{\"text\":[\"{bodyParam1Encoded}\",\"{bodyParam2Encoded}\"]}},\"language\":\"{languageCode}\",\"preview_url\":false}}",
                    messagingServiceSid: templateSid
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