using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    // Activity to display a message box
    [DisplayName("Display Message"), Description("Displays a message box.")]
    public class DisplayMessageActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The message to display.")]
        public InArgument<string> Message { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var message = Message.Get(context);
            var status = "";

            try
            {
                MessageBox.Show(message);
                status = "Message displayed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error displaying message: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}