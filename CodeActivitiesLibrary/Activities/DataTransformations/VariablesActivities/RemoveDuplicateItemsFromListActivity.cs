using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Remove Duplicate Items From List")]
    [Description("Removes duplicate items from a list. Optionally performs case-insensitive comparison.")]
    public class RemoveDuplicateItemsFromListActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List to Remove Duplicates From")]
        [Description("The list variable to remove duplicate items from.")]
        public InArgument<List<string>> ListToRemoveDuplicate { get; set; }

        [Category("Input")]
        [DisplayName("Ignore Text Case")]
        [Description("Specifies whether to perform case-insensitive comparison while searching for duplicates.")]
        [DefaultValue(false)]
        public InArgument<bool> IgnoreTextCase { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        [Category("Output")]
        [DisplayName("Deduplicated List")]
        [Description("The list after removing duplicate items.")]
        public OutArgument<List<string>> DuplicatedList { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var inputList = ListToRemoveDuplicate.Get(context);
                var ignoreCase = IgnoreTextCase.Get(context);

                if (inputList == null || inputList.Count == 0)
                    throw new ArgumentException("The input list must contain at least one item.");

                // Remove duplicates using LINQ
                IEnumerable<string> dedupedList;

                dedupedList = ignoreCase ? inputList.Distinct(StringComparer.OrdinalIgnoreCase) : inputList.Distinct();

                var result = dedupedList.ToList();

                DuplicatedList.Set(context, result);
                status += $" Removed {inputList.Count - result.Count} duplicate item(s).";
            }
            catch (Exception ex)
            {
                status = $"Error removing duplicates: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}