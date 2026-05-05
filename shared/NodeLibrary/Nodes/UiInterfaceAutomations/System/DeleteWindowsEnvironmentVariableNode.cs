using NodeLibrary.SystemNodes.Enums;
using System.Security.Principal;

namespace NodeLibrary.SystemNodes;

[DisplayName("Delete Windows Environment Variable"), Description("Deletes an environment variable from a given scope.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class DeleteWindowsEnvironmentVariableNode : BaseNode
{
    [DisplayName("Environment Variable Name"), Description("The name of the environment variable to be deleted.")]
    public InArgument<EnvVarNameEnum> VariableName { get; set; } = new InArgument<EnvVarNameEnum>(EnvVarNameEnum.None);

    [DisplayName("Scope"), Description("Specifies whether the environment variable should be deleted from the User or System scope.")]
    public InArgument<ScopeEnum> Type { get; set; } = new InArgument<ScopeEnum>(ScopeEnum.User);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var envVarName = VariableName.Get(context);
            var type = Type.Get(context);

            if (envVarName == EnvVarNameEnum.None)
                throw new ArgumentException("Environment variable name cannot be empty or invalid.");

            if (type == ScopeEnum.System && !IsProcessElevated())
                throw new UnauthorizedAccessException(
                    "Insufficient privileges to delete system-level environment variables. Please run the application with administrative privileges.");

            var variableName = GetEnvVarName(envVarName);
            var target = type == ScopeEnum.System
                ? EnvironmentVariableTarget.Machine
                : EnvironmentVariableTarget.User;

            // Setting value to null deletes the variable in .NET
            Environment.SetEnvironmentVariable(variableName, null, target);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully deleted environment variable '{variableName}' from {type} scope.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting environment variable: {ex.Message}");
        }
    }

    private static string GetEnvVarName(EnvVarNameEnum envVarName) => envVarName switch
    {
        EnvVarNameEnum.OneDrive => "OneDrive",
        EnvVarNameEnum.OneDriveConsumer => "OneDriveConsumer",
        EnvVarNameEnum.OneDriveCommercial => "OneDriveCommercial",
        EnvVarNameEnum.TEMP => "TEMP",
        EnvVarNameEnum.TMP => "TMP",
        EnvVarNameEnum.USERNAME => "USERNAME",
        EnvVarNameEnum.PATH => "Path",
        _ => throw new ArgumentException($"Invalid environment variable name: {envVarName}.")
    };

    private static bool IsProcessElevated()
    {
        using var identity = WindowsIdentity.GetCurrent();
        var principal = new WindowsPrincipal(identity);
        return principal.IsInRole(WindowsBuiltInRole.Administrator);
    }
}
