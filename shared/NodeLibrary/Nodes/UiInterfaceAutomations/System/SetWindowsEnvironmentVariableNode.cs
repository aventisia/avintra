using NodeLibrary.SystemNodes.Enums;
using System.Security.Principal;

namespace NodeLibrary.SystemNodes;

[DisplayName("Set windows environment variable"), Description("Sets an environment variable to a given value.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class SetWindowsEnvironmentVariableNode : BaseNode
{
    [DisplayName("Environment variable name"), Description("The name of the environment variable to set.")]
    public required InArgument<EnvVarNameEnum> EnvironmentVariableName { get; set; }

    [DisplayName("New environment variable value"), Description("The new value to set for the environment variable.")]
    public required InArgument<string> NewEnvironmentVariableValue { get; set; }

    [DisplayName("Type"), Description("Specifies whether to set the environment variable at the User or System level.")]
    public InArgument<ScopeEnum> Type { get; set; } = new InArgument<ScopeEnum>(ScopeEnum.User);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var envVarName = EnvironmentVariableName.Get(context);
            var newValue = NewEnvironmentVariableValue.Get(context);
            var envVarType = Type.Get(context);

            if (envVarName == EnvVarNameEnum.None)
                throw new ArgumentException("Environment variable name cannot be empty.");

            if (string.IsNullOrWhiteSpace(newValue))
                throw new ArgumentException("New environment variable value cannot be empty.");

            var envVarNameString = GetEnvVarName(envVarName);

            if (envVarType == ScopeEnum.System && !IsProcessElevated())
            {
                throw new UnauthorizedAccessException(
                    "Insufficient privileges to modify system-level environment variables. Please run the application with administrative privileges.");
            }

            switch (envVarType)
            {
                case ScopeEnum.User:
                    Environment.SetEnvironmentVariable(envVarNameString, newValue, EnvironmentVariableTarget.User);
                    break;
                case ScopeEnum.System:
                    Environment.SetEnvironmentVariable(envVarNameString, newValue, EnvironmentVariableTarget.Machine);
                    break;
                default:
                    throw new NotSupportedException($"Unsupported environment variable type: {envVarType}");
            }

            status = $"Environment variable '{envVarNameString}' set successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting environment variable: {ex.Message}");
        }
    }

    private static string GetEnvVarName(EnvVarNameEnum envVarName)
    {
        return envVarName switch
        {
            EnvVarNameEnum.OneDrive => "OneDrive",
            EnvVarNameEnum.OneDriveConsumer => "OneDriveConsumer",
            EnvVarNameEnum.OneDriveCommercial => "OneDriveCommercial",
            EnvVarNameEnum.TEMP => "TEMP",
            EnvVarNameEnum.TMP => "TMP",
            EnvVarNameEnum.USERNAME => "USERNAME",
            EnvVarNameEnum.PATH => "Path",
            _ => throw new ArgumentException("Invalid environment variable name.")
        };
    }

    private static bool IsProcessElevated()
    {
        using var identity = WindowsIdentity.GetCurrent();
        var principal = new WindowsPrincipal(identity);
        return principal.IsInRole(WindowsBuiltInRole.Administrator);
    }
}
