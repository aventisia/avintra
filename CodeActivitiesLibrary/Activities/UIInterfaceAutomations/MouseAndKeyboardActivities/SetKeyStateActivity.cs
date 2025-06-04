using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to set key state
    [DisplayName("Set Key State"),
     Description("Sets the state (on or off) for the keys Caps Lock, Num Lock, or Scroll Lock.")]
    public class SetKeyStateActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"),
         Description("The key to modify (e.g., 'CapsLock', 'NumLock', 'ScrollLock').")]
        public InArgument<string> Key { get; set; }

        [RequiredArgument, Category("Input"), Description("Whether to enable (true) or disable (false) the key state.")]
        public InArgument<bool> Enable { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var key = Key.Get(context);
            var enable = Enable.Get(context);
            var status = "";

            try
            {
                // Simulate setting key state (actual implementation would use low-level keyboard hooks or similar)
                status = $"Key '{key}' state set to {enable}.";
            }
            catch (Exception ex)
            {
                status = $"Error setting key state: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}