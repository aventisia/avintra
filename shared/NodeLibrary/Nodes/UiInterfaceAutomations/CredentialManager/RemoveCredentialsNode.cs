using CredentialManagement;

namespace NodeLibrary.CredentialManagerNodes;

[DisplayName("Remove Credential Manager Credentials"), Description("Removes stored credentials from Windows Credential Manager for a specified target.")]
[NodeMetadata(icon: "/assets/CredentialManager.svg")]
public class RemoveCredentialsNode : BaseNode
{
    [DisplayName("Target Name"), Description("The name of the credential target to remove from Credential Manager.")]
    public required InArgument<string> TargetName { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var target = TargetName.Get(context);

            var credential = new Credential
            {
                Target = target
            };

            var success = credential.Delete();
            if (!success)
                throw new InvalidOperationException($"No matching credential found for target '{target}'. Nothing was deleted.");

            status = $"Successfully removed credentials for target '{target}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing credentials: {ex.Message}");
        }
    }
}
