using CodeActivitiesLibrary.Extensions;
using Microsoft.Win32;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Get Keyboard Identifier")]
    [Description("Retrieves the active keyboard identifier from the machine's registry.")]
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
                // Open the Windows Registry to retrieve the active keyboard layout
                using (var key = Registry.CurrentUser.OpenSubKey(@"HKEY_CURRENT_USER\Keyboard Layout"))
                {
                    if (key == null)
                        throw new InvalidOperationException("Unable to access the keyboard layout registry key.");

                    // Retrieve the active keyboard layout identifier
                    var subKeys = key.GetSubKeyNames();
                    foreach (var subKey in subKeys)
                    {
                        if (!subKey.StartsWith("00000409")) continue; // Example: English (US) layout
                        var layoutKey = key.OpenSubKey(subKey);
                        var layoutValue = layoutKey?.GetValue("Layout Text");
                        if (layoutValue == null) continue;
                        KeyboardLayoutId.Set(context, layoutValue.ToString());
                        status = $"Successfully retrieved keyboard layout ID: {layoutValue}";
                        break;
                    }
                }
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
    }
}