using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security.Principal;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities
{
    [DisplayName("Set windows environment variable")]
    [Description("Sets an environment variable to a given value.")]
    [ActivityMetaData(nodeImg: "/assets/System.svg")]
    public class SetWindowsEnvironmentVariableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Environment variable name")]
        [Description("The name of the environment variable to set.")]
        public InArgument<EnvVarNameEnum> EnvironmentVariableName { get; set; }

        [RequiredArgument]
        [DisplayName("New environment variable value")]
        [Description("The new value to set for the environment variable.")]
        public InArgument<string> NewEnvironmentVariableValue { get; set; }

        [DisplayName("Type")]
        [Description("Specifies whether to set the environment variable at the User or System level.")]
        [DefaultValue(ScopeEnum.User)]
        public InArgument<ScopeEnum> Type { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var envVarName = EnvironmentVariableName.Get(context);
                var newValue = NewEnvironmentVariableValue.Get(context);
                var envVarType = Type.Get(context);

                // Validate inputs
                if (envVarName == EnvVarNameEnum.None)
                    throw new ArgumentException("Environment variable name cannot be empty.");

                if (string.IsNullOrWhiteSpace(newValue))
                    throw new ArgumentException("New environment variable value cannot be empty.");

                // Convert enum to actual environment variable name
                var envVarNameString = GetEnvVarName(envVarName);

                // Check if the process has elevated privileges for system-level changes
                if (envVarType == ScopeEnum.System && !IsProcessElevated())
                {
                    throw new UnauthorizedAccessException(
                        "Insufficient privileges to modify system-level environment variables. " +
                        "Please run the application with administrative privileges."
                    );
                }

                // Set the environment variable based on the type
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

                // Set output arguments
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Environment variable '{envVarNameString}' set successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error setting environment variable: {ex.Message}");
            }
        }

        // Helper method to convert EnvVarNameEnum to string
        private static string GetEnvVarName(EnvVarNameEnum envVarName)
        {
            switch (envVarName)
            {          
                case EnvVarNameEnum.OneDrive:
                    return "OneDrive";
                case EnvVarNameEnum.OneDriveConsumer:
                    return "OneDriveConsumer";
                case EnvVarNameEnum.OneDriveCommercial:
                    return "OneDriveCommercial";
                case EnvVarNameEnum.TEMP:
                    return "TEMP";
                case EnvVarNameEnum.TMP:
                    return "TMP";
                case EnvVarNameEnum.USERNAME:
                    return "USERNAME";
                case EnvVarNameEnum.PATH:
                    return "Path";
               // case EnvVarNameEnum.
                default:
                    throw new ArgumentException("Invalid environment variable name.");
            }
        }

        // Helper method to check if the process is elevated
        private static bool IsProcessElevated()
        {
            bool result;
            using (var identity = WindowsIdentity.GetCurrent())
            {
                var principal = new WindowsPrincipal(identity);
                result = principal.IsInRole(WindowsBuiltInRole.Administrator);
            }
            return result;
        }
    }
}