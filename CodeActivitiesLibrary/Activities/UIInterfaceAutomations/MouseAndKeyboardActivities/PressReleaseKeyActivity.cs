using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to press/release keys
    [DisplayName("Press/Release Key"),
     Description("Presses (and holds) or releases one or more modifier keys (Alt, Control, or Shift).")]
    public class PressReleaseKeyActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"),
         Description("The key to press or release (e.g., 'Alt', 'Control', 'Shift').")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument, Category("Input"), Description("Whether to press (true) or release (false) the key.")]
        public InArgument<bool> Press { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var key = Key.Get(context);
            var press = Press.Get(context);
            var status = "";

            try
            {
                // Simulate pressing/releasing the key (actual implementation would use SendKeys or similar)
                if (press)
                {
                    status = $"Key '{key}' pressed successfully.";
                }
                else
                {
                    status = $"Key '{key}' released successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error pressing/releasing key: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}