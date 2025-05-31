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
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List to Clear")]
        [Description("The list variable whose elements will be removed.")]
        public InArgument<IList<object>> ListToClear { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
 
        public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Success";

            try
            {
                var list = ListToClear.Get(context);

                if (list == null)
                    throw new ArgumentException("List cannot be null.");

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