using CredentialManagement;

namespace NodeLibrary.CredentialManagerNodes;

[DisplayName("Update Account Password in Credential Manager"), Description("Updates the password for an existing credential in Windows Credential Manager.")]
[NodeMetadata(icon: "/assets/CredentialManager.svg")]
public class UpdateAccountPasswordNode : BaseNode
{
    [DisplayName("Target Name"), Description("The name of the credential target whose password needs to be updated.")]
    public required InArgument<string> TargetName { get; set; }

    [DisplayName("New Password"), Description("The new password value to be assigned to the credential.")]
    public required InArgument<SecureString> NewPassword { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var target = TargetName.Get(context);
            var newPassword = SecureStringHelper.ConvertSecureStringToString(NewPassword.Get(context) ?? new SecureString());

            var credential = new Credential
            {
                Target = target
            };

            if (!credential.Load())
                throw new InvalidOperationException($"No matching credential found for target '{target}'. Cannot update.");

            credential.Password = newPassword;
            var saveSuccess = credential.Save();

            if (!saveSuccess)
                throw new InvalidOperationException($"Failed to save updated password for target '{target}'.");

            status = $"Successfully updated password for target '{target}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error updating password: {ex.Message}");
        }
    }
}
