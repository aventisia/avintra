using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Subtract Lists")]
    [Description("Removes items from the first list that exist in the second list.")]
    public class SubtractListsActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("First List")]
        [Description("The variable that holds the first list to compare.")]
        public InArgument<List<object>> FirstList { get; set; }

        [RequiredArgument]

        [DisplayName("Second List")]
        [Description("The variable that contains the second list used to subtract items from the first list.")]
        public InArgument<List<object>> SecondList { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("List Difference Output")]
        [Description("The resulting list after subtracting items from the second list.")]
        public OutArgument<List<object>> ListDifferenceOutput { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var firstList = FirstList.Get(context);
                var secondList = SecondList.Get(context);

                if (firstList == null || secondList == null)
                    throw new ArgumentException("Both lists must be initialized.");

                // Simulate subtraction: remove items in first list that are present in second list
                var result = firstList.Except(secondList).ToList();

                // Set outputs conditionally
                ListDifferenceOutput.Set(context, result);

                status += $" Subtracted {secondList.Count() - result.Count()} item(s) from the list.";
            }
            catch (Exception ex)
            {
                status = $"Error subtracting lists: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}