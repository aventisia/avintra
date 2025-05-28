using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Clear List")]
    [Description("Removes all elements from the specified list.")]
    public class ClearListActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List to Clear")]
        [Description("A list variable to remove its elements.")]
        public InArgument<List<string>> ListToClear { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var list = ListToClear.Get(context);

                if (list == null)
                    throw new ArgumentException("The list cannot be null.");

                // Clear the list
                list.Clear();
                status = $"Successfully cleared the list. Count is now {list.Count}.";
            }
            catch (Exception ex)
            {
                status = $"Error clearing list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}