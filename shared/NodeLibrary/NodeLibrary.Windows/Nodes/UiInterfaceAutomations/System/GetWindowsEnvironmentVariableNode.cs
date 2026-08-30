using NodeLibrary.SystemNodes.Enums;

namespace NodeLibrary.SystemNodes;

[DisplayName("Get windows environment variable"), Description("Retrieves the value of an environment variable.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class GetWindowsEnvironmentVariableNode : BaseNode
{
    [DisplayName("Environment variable name"), Description("The name of the environment variable to retrieve.")]
    public required InArgument<EnvVarNameEnum> EnvironmentVariableName { get; set; } = new InArgument<EnvVarNameEnum>(EnvVarNameEnum.USERNAME);

    [DisplayName("Search for variable only in scope"), Description("Indicates whether to search for the variable only within the specified scope.")]
    public InArgument<bool> SearchForVariableOnlyInScope { get; set; } = new InArgument<bool>(false);

    [DisplayName("Scope"), Description("Specifies the scope (User or System) to search for the environment variable.")]
    [RenderIfCondition(nameof(SearchForVariableOnlyInScope), true)]
    public InArgument<ScopeEnum> Scope { get; set; } = new InArgument<ScopeEnum>(ScopeEnum.User);

    [DisplayName("Environment Variable Value"), Description("The retrieved value of the environment variable.")]
    public OutArgument<string> EnvironmentVariableValue { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Environment variable retrieved successfully.";

        try
        {
            var envVarName = EnvironmentVariableName.Get(context);
            var searchInScope = SearchForVariableOnlyInScope.Get(context);
            var scope = Scope.Get(context);

            var envVarNameString = GetEnvVarName(envVarName);

            string? value;
            if (searchInScope)
            {
                value = scope switch
                {
                    ScopeEnum.User => Environment.GetEnvironmentVariable(envVarNameString, EnvironmentVariableTarget.User),
                    ScopeEnum.System => Environment.GetEnvironmentVariable(envVarNameString, EnvironmentVariableTarget.Machine),
                    _ => throw new NotSupportedException($"Unsupported scope: {scope}")
                };
            }
            else
            {
                value = Environment.GetEnvironmentVariable(envVarNameString);
            }

            EnvironmentVariableValue.Set(context, value ?? string.Empty);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving environment variable: {ex.Message}");
        }
    }

    private static string GetEnvVarName(EnvVarNameEnum envVarName)
    {
        return envVarName switch
        {
            EnvVarNameEnum.NUMBER_OF_PROCESSORS => "NUMBER_OF_PROCESSORS",
            EnvVarNameEnum.OS => "OS",
            EnvVarNameEnum.PATH => "Path",
            EnvVarNameEnum.PATHEXT => "PATHEXT",
            EnvVarNameEnum.PROCESSOR_ARCHITECTURE => "PROCESSOR_ARCHITECTURE",
            EnvVarNameEnum.PROCESSOR_IDENTIFIER => "PROCESSOR_IDENTIFIER",
            EnvVarNameEnum.PROCESSOR_LEVEL => "PROCESSOR_LEVEL",
            EnvVarNameEnum.PROCESSOR_REVISION => "PROCESSOR_REVISION",
            EnvVarNameEnum.PSMODULEPATH => "PSModulePath",
            EnvVarNameEnum.TEMP => "TEMP",
            EnvVarNameEnum.TMP => "TMP",
            EnvVarNameEnum.USERNAME => "USERNAME",
            EnvVarNameEnum.WINDIR => "windir",
            EnvVarNameEnum.ZES_ENABLE_SYSMAN => "ZES_ENABLE_SYSMAN",
            EnvVarNameEnum.OneDrive => "OneDrive",
            EnvVarNameEnum.OneDriveConsumer => "OneDriveConsumer",
            EnvVarNameEnum.OneDriveCommercial => "OneDriveCommercial",
            _ => throw new ArgumentException("Invalid environment variable name.")
        };
    }
}
