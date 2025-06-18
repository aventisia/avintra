using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    // [DisplayName("If Window Contains")]
    // [Description("Marks the beginning of a conditional block of actions depending on whether a specific piece of text or UI element exists in a window.")]
    public class IfWindowContainsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Description("The text or UI element to search for in the window.")]
        public InArgument<string> SearchTerm { get; set; }


        [Description("Returns true if the search term is found, false otherwise.")]
        public OutArgument<bool> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var searchTerm = SearchTerm.Get(context);
            var result = false;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(searchTerm))
                {
                    throw new ArgumentException("Search term cannot be null or empty.");
                }

                // Simulate checking if window contains using a hypothetical API
                result = true; // Replace with actual logic
                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Search completed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error searching window: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}