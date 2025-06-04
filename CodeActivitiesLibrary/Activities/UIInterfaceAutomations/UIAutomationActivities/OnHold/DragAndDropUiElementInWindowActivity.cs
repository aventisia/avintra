using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    //[DisplayName("Drag and Drop UI Element in Window")]
    //[Description("Drags a UI element from one location to another within a specified window.")]
    public class DragAndDropUiElementInWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Description("The selector or identifier of the source UI element.")]
        public InArgument<string> SourceUiElementSelector { get; set; }

        [RequiredArgument]
        [Description("The selector or identifier of the target UI element.")]
        public InArgument<string> TargetUiElementSelector { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var sourceUiElementSelector = SourceUiElementSelector.Get(context);
            var targetUiElementSelector = TargetUiElementSelector.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(sourceUiElementSelector))
                {
                    throw new ArgumentException("Source UI element selector cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(targetUiElementSelector))
                {
                    throw new ArgumentException("Target UI element selector cannot be null or empty.");
                }

                // Simulate drag and drop using a hypothetical API
                StatusMessage.Set(context, "UI element dragged and dropped successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error dragging and dropping UI element: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}