using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Reverse List")]
    [Description("Reverses the order of items in a list.")]
    public class ReverseListActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("List to Reverse")]
        [Description("The list whose item order will be reversed.")]
        public InArgument<List<object>> ListToReverse { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Reversed List")]
        [Description("Returns the list after reversing the order of its items.")]
        public OutArgument<List<object>> ReversedList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var inputList = ListToReverse.Get(context);

                if (inputList == null)
                    throw new ArgumentException("Input list cannot be null.");

                // Reverse the list
                var result = new List<object>(inputList);
                result.Reverse();

                ReversedList.Set(context, result);
                status = $"Successfully reversed list containing {result.Count} items.";
            }
            catch (Exception ex)
            {
                status = $"Error reversing list: {ex.Message}";
                ReversedList.Set(context, new List<object>());
            }

            StatusMessage.Set(context, status);
        }
    }
}