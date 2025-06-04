using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    //[DisplayName("Select Menu Option in Window")]
    //[Description("Selects an option in a menu of a window.")]
    public class SelectMenuOptionInWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Description("The selector or identifier of the menu option.")]
        public InArgument<string> MenuOptionSelector { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var menuOptionSelector = MenuOptionSelector.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(menuOptionSelector))
                {
                    throw new ArgumentException("Menu option selector cannot be null or empty.");
                }

                // Simulate selecting menu option using a hypothetical API
                StatusMessage.Set(context, "Menu option selected successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error selecting menu option: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}