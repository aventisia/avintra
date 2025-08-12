using CodeActivitiesLibrary.Extensions;
using Microsoft.Win32;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Get Keyboard Identifier")]
    [Description("Retrieves the active keyboard identifier from the machine's registry.")]
    [ActivityMetaData(nodeImg: "/assets/MouseAndKeyboard.svg")]
    public class GetKeyboardIdentifierActivity : BaseCodeActivity
    {
        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Keyboard Layout ID")]
        [Description("The registry key of the active keyboard identifier.")]
        public OutArgument<string> KeyboardLayoutId { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                // Get the active keyboard layout identifier using the Windows API
                IntPtr hkl = GetKeyboardLayout(0); // 0 means the foreground thread

                if (hkl == IntPtr.Zero)
                    throw new InvalidOperationException("Failed to retrieve the active keyboard layout.");

                // Convert the handle to a hexadecimal string (e.g., 00000409 for English US)
                string layoutId = hkl.ToInt64().ToString("X8");

                // Set the output argument
                KeyboardLayoutId.Set(context, layoutId);
                status = $"Successfully retrieved keyboard layout ID: {layoutId}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving keyboard layout ID: {ex.Message}";
                IsSuccess.Set(context, false);
                KeyboardLayoutId.Set(context, null);
                StatusMessage.Set(context, status);
            }
        }

        // ----------------------
        // Windows API Interop
        // ----------------------

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern IntPtr GetKeyboardLayout(uint idThread);

        // Helper method to convert the layout handle to a readable format
        private static string GetLayoutName(IntPtr hkl)
        {
            const int LOCALE_NAME_MAX_LENGTH = 85;
            StringBuilder localeName = new StringBuilder(LOCALE_NAME_MAX_LENGTH);
            if (GetKeyboardLayoutName(hkl, localeName))
            {
                return localeName.ToString();
            }
            return null;
        }

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern bool GetKeyboardLayoutName(IntPtr hkl, StringBuilder lpBuffer);
    }
}
