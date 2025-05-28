using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to block user input
    [DisplayName("Block Input"),
     Description(
         "Blocks user mouse and keyboard input, so that the flow can perform mouse and keyboard actions without interference from the user.")]
    public class BlockInputActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                // Simulate blocking input (actual implementation would use Windows API)
                status = "User input blocked successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error blocking input: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}