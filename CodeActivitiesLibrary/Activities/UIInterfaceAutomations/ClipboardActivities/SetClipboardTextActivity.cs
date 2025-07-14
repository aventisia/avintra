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
    public class SetClipboardTextActivity : BaseCodeActivity
    {
        [DisplayName("Clipboard Text")]
        [Description("The text to set to the clipboard.")]
        public InArgument<string> ClipboardText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string text = ClipboardText.Get(context);

            Thread staThread = new Thread(() =>
            {
                try
                {
                    Clipboard.SetText(text);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Successfully set clipboard text");
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Failed to set clipboard text: {ex.Message}");
                }
            });

            staThread.SetApartmentState(ApartmentState.STA);
            staThread.Start();
            staThread.Join(); // Wait for thread to complete

           
            IsSuccess.Set(context, "Clipboard text set successfully");
            StatusMessage.Set(context, $"Failed to set clipboard text");
        }
    }
}