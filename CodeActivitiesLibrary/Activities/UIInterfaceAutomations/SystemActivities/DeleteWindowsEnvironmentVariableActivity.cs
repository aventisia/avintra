using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Delete windows environment variable")]
    [Description("Deletes an environment variable from a given scope.")]
    public class DeleteWindowsEnvironmentVariableActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [Description("The name of the environment variable to delete.")]
        public InArgument<string> VariableName { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var variableName = VariableName.Get(context);
            var status = "";

            try
            {
                Environment.SetEnvironmentVariable(variableName, null, EnvironmentVariableTarget.Machine);
                StatusMessage.Set(context, "Environment variable deleted successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error deleting environment variable: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}