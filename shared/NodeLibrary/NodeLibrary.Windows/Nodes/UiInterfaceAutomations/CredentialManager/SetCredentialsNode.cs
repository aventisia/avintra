using CredentialManagement;

namespace NodeLibrary.CredentialManagerNodes;

[DisplayName("Save Credential Manager Credentials"), Description("Saves credentials to Windows Credential Manager for a specified target.")]
[NodeMetadata(icon: "/assets/CredentialManager.svg")]
public class SetCredentialsNode : BaseNode
{
    [DisplayName("Target Name"), Description("The name of the credential target used to store in Credential Manager.")]
    public required InArgument<string> TargetName { get; set; }

    [DisplayName("Account Name"), Description("The username to be saved in the Credential Manager.")]
    public required InArgument<string> AccountName { get; set; }

    [DisplayName("Password"), Description("The password associated with the account to be stored securely.")]
    public required InArgument<SecureString> Password { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var target = TargetName.Get(context);
            var accountName = AccountName.Get(context);
            var password = SecureStringHelper.ConvertSecureStringToString(Password.Get(context) ?? new SecureString());

            var credential = new Credential
            {
                Target = target,
                Username = accountName,
                Password = password,
                PersistanceType = PersistanceType.LocalComputer
            };

            var success = credential.Save();
            if (!success)
                throw new InvalidOperationException($"Failed to save credentials for target '{target}'.");

            status = $"Successfully saved credentials for target '{target}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error saving credentials: {ex.Message}");
        }
    }
}
