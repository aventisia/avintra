using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Clear List")]
    [Description("Removes all elements from the specified list.")]
    public class ClearListActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("List to Clear")]
        [Description("The list variable whose elements will be removed.")]
        public InArgument<IList<object>> ListToClear { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var list = ListToClear.Get(context);

                if (list == null)
                    throw new ArgumentException("List cannot be null.");

                // Clear the list
                list.Clear();
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"List cleared successfully. Count is now {list.Count}.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error clearing the list: {ex.Message}");
            }

            StatusMessage.Set(context, status);
        }
    }
}