using CodeActivitiesLibrary.Extensions;
using CredentialManagement;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CredentialManagerActivities
{
    [DisplayName("Update Account Password in Credential Manager")]
    [Description("Updates the password for an existing credential in Windows Credential Manager.")]
    [ActivityMetaData(nodeImg: "/assets/CredentialManager.svg")]
    public class UpdateAccountPasswordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Target Name")]
        [Description("The name of the credential target whose password needs to be updated.")]
        public InArgument<string> TargetName { get; set; }

        [RequiredArgument]
        [DisplayName("New Password")]
        [Description("The new password value to be assigned to the credential.")]
        public InArgument<SecureString> NewPassword { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string target = TargetName.Get(context);
            var newPassword = ConvertSecureStringToString(NewPassword.Get(context));

            try
            {
                var credential = new Credential
                {
                    Target = target
                };

                if (credential.Load())
                {
                    // Update password and save
                    credential.Password = newPassword;
                    bool saveSuccess = credential.Save();

                    if (saveSuccess)
                    {
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Successfully updated password for target '{target}'.");
                    }
                    else
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to save updated password for target '{target}'.");
                    }
                }
                else
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"No matching credential found for target '{target}'. Cannot update.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating password: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating password: {ex.Message}");
            }
        }
    }
}
