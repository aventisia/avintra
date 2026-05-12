using CredentialManagement;

namespace NodeLibrary.CredentialManagerNodes;

[DisplayName("Get Account Password from Credential Manager"), Description("Retrieves the password for a stored credential from Windows Credential Manager.")]
[NodeMetadata(icon: "/assets/CredentialManager.svg")]
public class GetAccountPasswordNode : BaseNode
{
    [DisplayName("Target Name"), Description("The name of the credential target used to retrieve the password.")]
    public required InArgument<string> TargetName { get; set; }

    [DisplayName("Password"), Description("The retrieved password for the specified credential target.")]
    public OutArgument<SecureString> Password { get; set; } = new OutArgument<SecureString>();

    protected override void Execute(INodeContext context)
    {
        var target = TargetName.Get(context);

        try
        {
            var credential = new Credential
            {
                Target = target
            };

            if (credential.Load())
            {
                var securePassword = SecureStringHelper.ConvertStringToSecureString(credential.Password ?? string.Empty);
                Password.Set(context, securePassword);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully retrieved password for target '{target}'.");
            }
            else
            {
                Password.Set(context, null!);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"No matching credential found for target '{target}'.");
            }
        }
        catch (Exception ex)
        {
            Password.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving password: {ex.Message}");
        }
    }
}
