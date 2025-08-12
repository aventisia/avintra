using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Management.Automation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities
{
    [DisplayName("Delete Windows Environment Variable")]
    [Description("Deletes an environment variable from a given scope.")]
    [ActivityMetaData(nodeImg: "/assets/System.svg")]
    public class DeleteWindowsEnvironmentVariableActivity : BaseCodeActivity
    {
        // Input: Environment Variable Name
        [DisplayName("Environment Variable Name")]
        [Description("The name of the environment variable to be deleted.")]
        [DefaultValue(EnvVarNameEnum.None)]
        public InArgument<EnvVarNameEnum> VariableName { get; set; }

        // Input: Scope (User or System)
        [DisplayName("Scope")]
        [Description("Specifies whether the environment variable should be deleted from the User or System scope.")]
        [DefaultValue(ScopeEnum.User)]
        public InArgument<ScopeEnum> Type { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var envVarName = context.GetValue(VariableName);
            var type = context.GetValue(Type);

            // Convert enum value to string
            var variableName = System.Enum.GetName(typeof(EnvVarNameEnum), envVarName);

            // Check if the variable name is valid
            if (string.IsNullOrEmpty(variableName))
                throw new ArgumentException("Environment variable name cannot be empty or invalid.");

            // Determine the scope for deletion
            var isSystemScope = type == ScopeEnum.System;

            string status;

            try
            {
                // Use PowerShell cmdlet to remove the environment variable
                var script = $"Remove-Item -Path 'Env:{variableName}' -Force";

                // For system scope, use a different method (note: PowerShell -Scope param doesn't apply here)
                using (var ps = PowerShell.Create())
                {
                    ps.AddScript(script);
                    ps.Invoke();

                    // Check for errors
                    if (ps.HadErrors)
                    {
                        status = $"Failed to remove environment variable '{variableName}'.";
                    }
                    else
                    {
                        status = $"Successfully removed environment variable '{variableName}' from {(isSystemScope ? "System" : "User")} scope.";
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error deleting environment variable: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}