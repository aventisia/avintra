using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ClipboardActivities
{
    [DisplayName("Set Clipboard Text")]
    [Description("Sets the specified text to the system clipboard.")]
    [ActivityMetaData(nodeImg: "/assets/Clipboard.svg")]
    public class SetClipboardTextActivity : BaseCodeActivity
    {
        [DisplayName("Clipboard Text")]
        [Description("The text to set to the clipboard.")]
        public InArgument<string> ClipboardText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string text = ClipboardText.Get(context);

            bool success = false;
            string statusMessage = "";

            Thread staThread = new Thread(() =>
            {
                try
                {
                    Clipboard.SetText(text);
                    success = true;
                    statusMessage = "Successfully set clipboard text.";
                }
                catch (Exception ex)
                {
                    success = false;
                    statusMessage = $"Failed to set clipboard text: {ex.Message}";
                }
            });

            staThread.SetApartmentState(ApartmentState.STA);
            staThread.Start();
            staThread.Join(); // Wait for thread to complete

            IsSuccess.Set(context, success);
            StatusMessage.Set(context, statusMessage);
        }
    }
}