using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Set windows environment variable")]
    [Description("Sets an environment variable to a given value.")]
    public class SetWindowsEnvironmentVariableActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The name of the environment variable.")]
        public InArgument<string> VariableName { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The value to set for the environment variable.")]
        public InArgument<string> Value { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var variableName = VariableName.Get(context);
            var value = Value.Get(context);
            var status = "";

            try
            {
                Environment.SetEnvironmentVariable(variableName, value, EnvironmentVariableTarget.Machine);
                StatusMessage.Set(context, "Environment variable set successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error setting environment variable: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}