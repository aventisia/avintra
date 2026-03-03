using CodeActivitiesLibrary.Extensions;
using CredentialManagement;
using System;
using System.Activities;
using System.ComponentModel;
using System.Security;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CredentialManagerActivities
{
    [DisplayName("Save Credential Manager Credentials")]
    [Description("Saves credentials to Windows Credential Manager for a specified target.")]
    [ActivityMetaData(nodeImg: "/assets/CredentialManager.svg")]
    public class SetCredentialsActivity : BaseCodeActivity
    {
        // Input Arguments

        [RequiredArgument]
        [DisplayName("Target Name")]
        [Description("The name of the credential target used to store in Credential Manager.")]
        public InArgument<string> TargetName { get; set; }

        [RequiredArgument]
        [DisplayName("Account Name")]
        [Description("The username to be saved in the Credential Manager.")]
        public InArgument<string> AccountName { get; set; }

        [RequiredArgument]
        [DisplayName("Password")]
        [Description("The password associated with the account to be stored securely.")]
        public InArgument<SecureString> Password { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            string target = TargetName.Get(context);
            string accountName = AccountName.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));

            try
            {
                var credential = new Credential
                {
                    Target = target,
                    Username = accountName,
                    Password = password,
                    PersistanceType = PersistanceType.LocalComputer
                };

                bool success = credential.Save();

                if (success)
                {
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully saved credentials for target '{target}'.");
                }
                else
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Failed to save credentials for target '{target}'.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving credentials: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error saving credentials: {ex.Message}");
            }
        }
    }
}