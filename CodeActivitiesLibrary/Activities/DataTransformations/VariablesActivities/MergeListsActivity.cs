using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Merge Lists")]
    [Description("Merges two lists into a new list. The original lists remain unchanged.")]
    public class MergeListsActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("First List")]
        [Description("The first list of items to merge.")]
        public InArgument<List<string>> FirstList { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Second List")]
        [Description("The second list of items to merge.")]
        public InArgument<List<string>> SecondList { get; set; }


        [Category("Output")]
        [DisplayName("Output List")]
        [Description("The merged result from both input lists.")]
        public OutArgument<List<string>> OutputListOutput { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var firstList = FirstList.Get(context);
                var secondList = SecondList.Get(context);

                if (firstList == null || secondList == null)
                    throw new ArgumentException("Both lists must be initialized.");

                // Merge the lists without modifying the originals
                var mergedList = new List<string>(firstList);
                mergedList.AddRange(secondList);

                OutputListOutput.Set(context, mergedList);

                status += $" Merged {firstList.Count} + {secondList.Count} items into a new list.";
            }
            catch (Exception ex)
            {
                status = $"Error merging lists: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}