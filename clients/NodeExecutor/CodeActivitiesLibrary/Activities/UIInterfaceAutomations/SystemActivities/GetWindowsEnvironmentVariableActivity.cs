using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities
{
    [DisplayName("Get windows environment variable")]
    [Description("Retrieves the value of an environment variable.")]
    [ActivityMetaData(nodeImg: "/assets/System.svg")]
    public class GetWindowsEnvironmentVariableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Environment variable name")]
        [Description("The name of the environment variable to retrieve.")]
        [DefaultValue(EnvVarNameEnum.USERNAME)]
        public InArgument<EnvVarNameEnum> EnvironmentVariableName { get; set; }

        // TODO: Remove this - This is an extra property which is not required since scope already has default value of User 
        [DisplayName("Search for variable only in scope")]
        [Description("Indicates whether to search for the variable only within the specified scope.")]
        public InArgument<bool> SearchForVariableOnlyInScope { get; set; }


        [DisplayName("Scope")]
        [Description("Specifies the scope (User or System) to search for the environment variable.")]
        [RenderIfCondition(nameof(SearchForVariableOnlyInScope), true)]
        [DefaultValue(ScopeEnum.User)]
        public InArgument<ScopeEnum> Scope { get; set; }

        [DisplayName("Environment Variable Value")]
        [Description("The retrieved value of the environment variable.")]
        public OutArgument<string> EnvironmentVariableValue { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var envVarName = EnvironmentVariableName.Get(context);
                var searchInScope = SearchForVariableOnlyInScope.Get(context);
                var scope = Scope.Get(context);

                // Convert enum to actual environment variable name
                var envVarNameString = GetEnvVarName(envVarName);

                // Retrieve the environment variable value
                string value = null;

                if (searchInScope)
                {
                    switch (scope)
                    {
                        case ScopeEnum.User:
                            value = Environment.GetEnvironmentVariable(envVarNameString, EnvironmentVariableTarget.User);
                            break;
                        case ScopeEnum.System:
                            value = Environment.GetEnvironmentVariable(envVarNameString, EnvironmentVariableTarget.Machine);
                            break;
                        default:
                            throw new NotSupportedException($"Unsupported scope: {scope}");
                    }
                }
                else
                {
                    value = Environment.GetEnvironmentVariable(envVarNameString); // Search all scopes
                }

                EnvironmentVariableValue.Set(context, value);
                StatusMessage.Set(context, "Environment variable retrieved successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error retrieving environment variable: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        // Helper method to convert EnvVarNameEnum to string
        private static string GetEnvVarName(EnvVarNameEnum envVarName)
        {
            switch (envVarName)
            {
                case EnvVarNameEnum.NUMBER_OF_PROCESSORS:
                    return "NUMBER_OF_PROCESSORS";
                case EnvVarNameEnum.OS:
                    return "OS";
                case EnvVarNameEnum.PATH:
                    return "Path";
                case EnvVarNameEnum.PATHEXT:
                    return "PATHEXT";
                case EnvVarNameEnum.PROCESSOR_ARCHITECTURE:
                    return "PROCESSOR_ARCHITECTURE";
                case EnvVarNameEnum.PROCESSOR_IDENTIFIER:
                    return "PROCESSOR_IDENTIFIER";
                case EnvVarNameEnum.PROCESSOR_LEVEL:
                    return "PROCESSOR_LEVEL";
                case EnvVarNameEnum.PROCESSOR_REVISION:
                    return "PROCESSOR_REVISION";
                case EnvVarNameEnum.PSMODULEPATH:
                    return "PSModulePath";
                case EnvVarNameEnum.TEMP:
                    return "TEMP";
                case EnvVarNameEnum.TMP:
                    return "TMP";
                case EnvVarNameEnum.USERNAME:
                    return "USERNAME";
                case EnvVarNameEnum.WINDIR:
                    return "windir";
                case EnvVarNameEnum.ZES_ENABLE_SYSMAN:
                    return "ZES_ENABLE_SYSMAN";
                case EnvVarNameEnum.None:
                    return "None";
                case EnvVarNameEnum.OneDrive:
                    return "OneDrive";
                case EnvVarNameEnum.OneDriveConsumer:
                    return "OneDriveConsumer";
                case EnvVarNameEnum.OneDriveCommercial:
                    return "OneDriveCommercial";
                default:
                    throw new ArgumentException("Invalid environment variable name.");
            }
        }
    }
}