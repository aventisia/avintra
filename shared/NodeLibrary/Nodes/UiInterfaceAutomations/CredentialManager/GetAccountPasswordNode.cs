using CredentialManagement;

namespace NodeLibrary.CredentialManagerNodes;

[DisplayName("Get Account Password from Credential Manager"), Description("Retrieves the password for a stored credential from Windows Credential Manager.")]
[NodeMetadata(icon: "/assets/CredentialManager.svg")]
public class GetAccountPasswordNode : BaseNode
{
    [DisplayName("Target Name"), Description("The name of the credential target used to retrieve the password.")]
    public required InArgument<string> TargetName { get; set; }

    [DisplayName("Password"), Description("The retrieved password for the specified credential target.")]
    public OutArgument<string> Password { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var target = TargetName.Get(context);
        var retrievedPassword = string.Empty;

        try
        {
            var credential = new Credential
            {
                Target = target
            };

            if (!credential.Load())
            {
                retrievedPassword = "Password not found";
                throw new InvalidOperationException($"No matching credential found for target '{target}'.");
            }

            retrievedPassword = credential.Password;
            status = $"Successfully retrieved password for target '{target}'.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            if (string.IsNullOrEmpty(retrievedPassword))
            {
                retrievedPassword = "Error occurred";
            }

            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving password: {ex.Message}");
        }

        Password.Set(context, retrievedPassword);
    }
}
