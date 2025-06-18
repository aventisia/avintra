using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Remove Duplicate Items From List")]
    [Description("Removes duplicate items from a list using case-sensitive or case-insensitive comparison.")]
    public class RemoveDuplicateItemsFromListActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("List to Deduplicate")]
        [Description("The list variable to remove duplicate values from.")]
        public InArgument<List<object>> ListToDeduplicate { get; set; }


        [DisplayName("Ignore Case")]
        [Description("If true, performs case-insensitive comparison when checking for duplicates.")]
        [DefaultValue(false)]
        public InArgument<bool> IgnoreCase { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Deduplicated List")]
        [Description("Returns the list after removing duplicate items.")]
        public OutArgument<List<object>> DeduplicatedList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var inputList = ListToDeduplicate.Get(context);
                var ignoreCase = IgnoreCase.Get(context);

                if (inputList == null)
                    throw new ArgumentException("Input list cannot be null.");

                IEnumerable<object> result;

                if (ignoreCase)
                    result = inputList
                        .OfType<string>()
                        .Select(s => s?.ToLower())
                        .Distinct()
                        .Cast<object>();
                else
                    result = inputList.Distinct();

                DeduplicatedList.Set(context, result.ToList());
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully removed duplicates.");
            }
            catch (Exception ex)
            {
                DeduplicatedList.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error removing duplicates from list: {ex.Message}");
            }
            StatusMessage.Set(context, status);
        }
    }
}