using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CredentialManagement;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CredentialManagerActivities
{
    [DisplayName("Remove Credential Manager Credentials")]
    [Description("Removes stored credentials from Windows Credential Manager for a specified target.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/CredentialManager.svg")]
    public class RemoveCredentialsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Target Name")]
        [Description("The name of the credential target to remove from Credential Manager.")]
        public InArgument<string> TargetName { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            string target = TargetName.Get(context);

            try
            {
                var credential = new Credential
                {
                    Target = target
                };

                bool success = credential.Delete();

                if (success)
                {
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully removed credentials for target '{target}'.");
                }
                else
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"No matching credential found for target '{target}'. Nothing was deleted.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing credentials: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error removing credentials: {ex.Message}");
            }
        }
    }
}
