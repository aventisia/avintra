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
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"List reversed successfully. Result: [{string.Join(", ", result)}]");
            }
            catch (Exception ex)
            {
                ReversedList.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reversing list: {ex.Message}");
            }

            StatusMessage.Set(context, status);
        }
    }
}