using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Get windows environment variable")]
    [Description("Retrieves the value of an environment variable.")]
    public class GetWindowsEnvironmentVariableActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The name of the environment variable to retrieve.")]
        public InArgument<string> VariableName { get; set; }


        [Description("Returns the value of the environment variable.")]
        public OutArgument<string> Value { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var variableName = VariableName.Get(context);
            string value = null;
            var status = "";

            try
            {
                value = Environment.GetEnvironmentVariable(variableName, EnvironmentVariableTarget.Machine);
                StatusMessage.Set(context, "Environment variable retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving environment variable: {ex.Message}";
            }

            Value.Set(context, value);
            StatusMessage.Set(context, status);
        }
    }
}