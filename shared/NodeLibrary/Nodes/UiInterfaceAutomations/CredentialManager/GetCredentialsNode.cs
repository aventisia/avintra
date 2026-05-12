using CredentialManagement;

namespace NodeLibrary.CredentialManagerNodes;

[DisplayName("Get Credential Manager Credentials"), Description("Retrieves stored credentials from Windows Credential Manager for a specified target.")]
[NodeMetadata(icon: "/assets/CredentialManager.svg")]
public class GetCredentialsNode : BaseNode
{
    [DisplayName("Target Name"), Description("The name of the credential target to retrieve from Credential Manager.")]
    public required InArgument<string> TargetName { get; set; }

    [DisplayName("Account Name"), Description("The username associated with the retrieved credential.")]
    public OutArgument<string> AccountName { get; set; } = new OutArgument<string>();

    [DisplayName("Secure Password"), Description("The password associated with the retrieved credential, returned as a SecureString.")]
    public OutArgument<SecureString> Password { get; set; } = new OutArgument<SecureString>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var target = TargetName.Get(context);

            using var credential = new Credential
            {
                Target = target
            };

            if (!credential.Load())
            {
                AccountName.Set(context, "Account not found");
                Password.Set(context, null!);
                throw new InvalidOperationException($"No matching credential found for target: '{target}'.");
            }

            AccountName.Set(context, credential.Username);
            Password.Set(context, SecureStringHelper.ConvertStringToSecureString(credential.Password));
            status = "Successfully retrieved credentials.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            AccountName.Set(context, "Error occurred");
            Password.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving credentials: {ex.Message}");
        }
    }
}
