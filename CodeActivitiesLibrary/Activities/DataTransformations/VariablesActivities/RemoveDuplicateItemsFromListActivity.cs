using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Remove Duplicate Items From List")]
    [Description("Removes duplicate items from a list using case-sensitive or case-insensitive comparison.")]
    public class RemoveDuplicateItemsFromListActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List to Deduplicate")]
        [Description("The list variable to remove duplicate values from.")]
        public InArgument<List<object>> ListToDeduplicate { get; set; }

        [Category("Input")]
        [DisplayName("Ignore Case")]
        [Description("If true, performs case-insensitive comparison when checking for duplicates.")]
        [DefaultValue(false)]
        public InArgument<bool> IgnoreCase { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Deduplicated List")]
        [Description("Returns the list after removing duplicate items.")]
        public OutArgument<List<object>> DeduplicatedList { get; set; }

        [Category("Output")] 

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
                {
                    result = inputList
                        .OfType<string>()
                        .Select(s => s?.ToLower())
                        .Distinct()
                        .Cast<object>();
                }
                else
                {
                    result = inputList.Distinct();
                }

                DeduplicatedList.Set(context, result.ToList());
            }
            catch (Exception ex)
            {
                status = $"Error removing duplicates: {ex.Message}";
                DeduplicatedList.Set(context, new List<object>());
            }

            StatusMessage.Set(context, status);
        }
    }
}