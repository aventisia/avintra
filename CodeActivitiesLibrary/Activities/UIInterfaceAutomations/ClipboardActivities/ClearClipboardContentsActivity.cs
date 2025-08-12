using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.ClipboardActivities
{
    // Activity to clear clipboard contents
    [DisplayName("Clear Clipboard Contents")]
    [Description("Clears all contents from the system clipboard.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Clipboard.svg")]
    public class ClearClipboardContentsActivity : BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                bool success = false;
                string message = "Clipboard operation failed.";

                // Run clipboard operation on an STA thread
                var staThread = new Thread(() =>
                {
                    try
                    {
                        // Optional: Retry up to 3 times if clipboard is busy
                        int attempts = 0;
                        const int maxAttempts = 3;
                        bool cleared = false;

                        while (!cleared && attempts < maxAttempts)
                        {
                            try
                            {
                                Clipboard.Clear();
                                cleared = true;
                                message = "Clipboard cleared successfully.";
                            }
                            catch (System.Runtime.InteropServices.COMException)
                            {
                                attempts++;
                                Thread.Sleep(100); // Wait before retrying
                            }
                        }

                        if (!cleared)
                        {
                            message = "Failed to clear clipboard after multiple attempts.";
                        }

                        success = cleared;
                    }
                    catch (Exception ex)
                    {
                        message = $"Error clearing clipboard: {ex.Message}";
                        success = false;
                    }
                });

                staThread.SetApartmentState(ApartmentState.STA);
                staThread.IsBackground = true;
                staThread.Start();
                staThread.Join(); // Wait until done

                IsSuccess.Set(context, success);
                StatusMessage.Set(context, message);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Unexpected error: {ex.Message}");
            }
        }
    }
}