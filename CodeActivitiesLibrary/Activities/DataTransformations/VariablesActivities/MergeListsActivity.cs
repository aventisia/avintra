using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Merge Lists")]
    [Description("Merges two lists into a new list. The original lists remain unchanged.")]
    public class MergeListsActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("First List")]
        [Description("The first list of items to merge.")]
        public InArgument<List<object>> FirstList { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Second List")]
        [Description("The second list of items to merge.")]
        public InArgument<List<object>> SecondList { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Merged List")]
        [Description("Returns a new list containing all items from both input lists.")]
        public OutArgument<List<object>> MergedList { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var firstList = FirstList.Get(context);
                var secondList = SecondList.Get(context);

                if (firstList == null || secondList == null)
                    throw new ArgumentException("Both lists must be initialized.");

                // Merge the lists
                var result = new List<object>(firstList);
                result.AddRange(secondList);

                MergedList.Set(context, result);
                status = $"Successfully merged {firstList.Count()} + {secondList.Count()} items.";
            }
            catch (Exception ex)
            {
                status = $"Error merging lists: {ex.Message}";
                MergedList.Set(context, new List<object>());
            }

            StatusMessage.Set(context, status);
        }
    }
}