using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace CodeActivitiesLibrary.AppIntegrations.TwilioActivities
{

    [Description("Sends an SMS using Twilio service.")]
    [DisplayName("Send SMS (Twilio)")]
    public class SendTextSmsActivity : BaseCodeActivity
    {

        [RequiredArgument]
        [DisplayName("Account SID")]
        [Description("Twilio Account SID")]
        public InArgument<string> AccountSid { get; set; }

        [RequiredArgument]
        [DisplayName("Auth Token")]
        [Description("Twilio Auth Token")]
        public InArgument<string> AuthToken { get; set; }

        [RequiredArgument]
        [DisplayName("Sender Type")]
        [Description("Choose whether to send from a Phone Number or Messaging Service.")]
        public InArgument<SenderTypeEnum> SenderType { get; set; }

        // Conditional arguments based on SenderType
        [DisplayName("From Phone Number")]
        [Description("The phone number to send the message from (Twilio number).")]
        [RenderIfCondition("SenderType", SenderTypeEnum.PhoneNumber)]
        public InArgument<string> FromPhoneNumber { get; set; }

        [DisplayName("Messaging Service SID")]
        [Description("Select a Messaging Service to send the message from.")]
        [RenderIfCondition("SenderType", SenderTypeEnum.MessagingService)]
        public InArgument<string> MessagingServiceSid { get; set; }

        [RequiredArgument]
        [DisplayName("To Number")]
        [Description("The phone number to send the message to")]
        public InArgument<string> ToNumber { get; set; }

        [RequiredArgument]
        [DisplayName("Message Body")]
        [Description("The body/content of the SMS message")]
        public InArgument<string> MessageBody { get; set; }

        [DisplayName("Result Output")]
        [Description("Output result: Success or Error message")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                var accountSid = AccountSid.Get(context);
                var authToken = AuthToken.Get(context);
                var senderType = SenderType.Get(context);
                var toNumber = ToNumber.Get(context);
                var messageBody = MessageBody.Get(context);

                // Initialize Twilio client
                TwilioClient.Init(accountSid, authToken);

                // Determine the sender based on SenderType
                if (senderType == SenderTypeEnum.PhoneNumber)
                {
                    var fromPhoneNumber = FromPhoneNumber.Get(context);
                    if (string.IsNullOrEmpty(fromPhoneNumber))
                        throw new ArgumentException("From Phone Number is required when Sender Type is Phone Number.");

                    var message = MessageResource.Create(
                        body: messageBody,
                        from: new PhoneNumber(fromPhoneNumber),
                        to: new PhoneNumber(toNumber)
                    );

                    Result.Set(context, $"SMS sent successfully. SID: {message.Sid}");
                    StatusMessage.Set(context, "SMS sent successfully");
                    IsSuccess.Set(context, true);
                }
                else if (senderType == SenderTypeEnum.MessagingService)
                {
                    var messagingServiceSid = MessagingServiceSid.Get(context);
                    if (string.IsNullOrEmpty(messagingServiceSid))
                        throw new ArgumentException("Messaging Service SID is required when Sender Type is Messaging Service.");

                    var message = MessageResource.Create(
                        body: messageBody,
                        messagingServiceSid: messagingServiceSid,
                        to: new PhoneNumber(toNumber)
                    );

                    Result.Set(context, $"SMS sent successfully. SID: {message.Sid}");
                    StatusMessage.Set(context, "SMS sent successfully");
                    IsSuccess.Set(context, true);
                }
                else
                {
                    throw new ArgumentException("Invalid SenderType. Must be 'Phone Number' or 'Messaging Service'.");
                }
            }
            catch (Exception ex)
            {
                Result.Set(context, $"Error sending SMS: {ex.Message}");
                StatusMessage.Set(context, $"Error sending SMS: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
        public enum SenderTypeEnum
        {
            [Display(Name = "Phone Number", Description = "Send SMS using a specific phone number.")]
            PhoneNumber,

            [Display(Name = "Messaging Service", Description = "Send SMS using a Twilio Messaging Service.")]
            MessagingService

        }
    }
}