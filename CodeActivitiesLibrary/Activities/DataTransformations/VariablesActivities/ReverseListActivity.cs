using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Reverse List")]
    [Description("Reverses the order of items in a list.")]
    public class ReverseListActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List to Reverse")]
        [Description("The list whose items' order will be reversed.")]
        public InArgument<List<string>> ListToReverse { get; set; }

        [Category("Output")]
        [DisplayName("Reversed List")]
        [Description("The list after reversing the order of its items.")]
        public OutArgument<List<string>> ReversedList { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var inputList = ListToReverse.Get(context);

                if (inputList == null)
                    throw new ArgumentException("Input list cannot be null.");

                // Reverse the list
                var reversedList = new List<string>(inputList);
                reversedList.Reverse();

                // Set output
                ReversedList.Set(context, reversedList);

                status += $" Reversed list with {inputList.Count} items.";
            }
            catch (Exception ex)
            {
                status = $"Error reversing list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}