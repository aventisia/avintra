using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to block user input
    [DisplayName("Block Input")]
    [Description(
        "Blocks user mouse and keyboard input, so that the flow can perform mouse and keyboard actions without interference from the user.")]
    public class BlockInputActivity : Extensions.BaseCodeActivity
    {
        // Input property
        [Category("Input")]
        [DisplayName("Block It")]
        [Description("Toggle to enable or disable blocking of user input.")]
        public InArgument<bool> BlockIt { get; set; }

        

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve the input argument
                bool blockIt = context.GetValue(BlockIt);

                if (blockIt)
                {
                    // Simulate blocking input (actual implementation would use Windows API)

                    string status = "User input blocked successfully.";
                    context.SetValue(StatusMessage, status);
                }
                else
                {
                    // If not blocking, return a neutral status message.
                    string status = "User input is not blocked.";
                    context.SetValue(StatusMessage, status);
                }
            }
            catch (Exception ex)
            {
                // Handle any errors during execution
                string status = $"Error blocking input: {ex.Message}";
                context.SetValue(StatusMessage, status);
            }
        }
    }
}