using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net;
using System.Security;
using CredentialManagement;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CredentialManagerActivities
{
    [DisplayName("Get Credential Manager Credentials")]
    [Description("Retrieves stored credentials from Windows Credential Manager for a specified target.")]
    [ActivityMetaData(nodeImg: "/assets/CredentialManager.svg")]
    public class GetCredentialsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Target Name")]
        [Description("The name of the credential target to retrieve from Credential Manager.")]
        public InArgument<string> TargetName { get; set; }

        [DisplayName("Account Name")]
        [Description("The username associated with the retrieved credential.")]
        public OutArgument<string> AccountName { get; set; }

        [DisplayName("Secure Password")]
        [Description("The password associated with the retrieved credential, returned as a SecureString.")]
        public OutArgument<SecureString> Password { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string target = TargetName.Get(context);

                using (var credential = new Credential())
                {
                    credential.Target = target;

                    if (credential.Load())
                    {
                        AccountName.Set(context, credential.Username);
                        Password.Set(context, ToSecureString(credential.Password));
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Successfully retrieved credentials.");
                    }
                    else
                    {
                        AccountName.Set(context, "Account not found");
                        Password.Set(context, new SecureString());
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"No matching credential found for target: '{target}'.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving credentials: {ex.Message}");
                AccountName.Set(context, "Error occurred");
                Password.Set(context, new SecureString());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving credentials: {ex.Message}");
            }
        }

        // Helper Methods

        private static SecureString ToSecureString(string password)
        {
            if (string.IsNullOrEmpty(password))
                return new SecureString();

            var secure = new SecureString();
            foreach (char c in password)
            {
                secure.AppendChar(c);
            }
            secure.MakeReadOnly();
            return secure;
        }
    }
}