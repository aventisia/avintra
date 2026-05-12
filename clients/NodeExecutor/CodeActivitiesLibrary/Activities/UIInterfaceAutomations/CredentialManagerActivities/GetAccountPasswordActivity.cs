using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CredentialManagement;
using System.Security;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CredentialManagerActivities
{
    [DisplayName("Get Account Password from Credential Manager")]
    [Description("Retrieves the password for a stored credential from Windows Credential Manager.")]
    [ActivityMetaData(nodeImg: "/assets/CredentialManager.svg")]
    public class GetAccountPasswordActivity : BaseCodeActivity
    {
        //Input Arguments

        [RequiredArgument]
        [DisplayName("Target Name")]
        [Description("The name of the credential target used to retrieve the password.")]
        public InArgument<string> TargetName { get; set; }

        // Output Arguments
        [DisplayName("Password")]
        [Description("The retrieved password for the specified credential target.")]
        public OutArgument<SecureString> Password { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string target = TargetName.Get(context);

            try
            {
                var credential = new Credential
                {
                    Target = target
                };

                if (credential.Load())
                {
                    var securePassword = new SecureString();
                    foreach (char c in credential.Password ?? string.Empty)
                        securePassword.AppendChar(c);
                    securePassword.MakeReadOnly();
                    Password.Set(context, securePassword);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully retrieved password for target '{target}'.");
                }
                else
                {
                    Password.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"No matching credential found for target '{target}'.");
                }
            }
            catch (Exception ex)
            {
                Password.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving password: {ex.Message}");
            }
        }
    }
}
