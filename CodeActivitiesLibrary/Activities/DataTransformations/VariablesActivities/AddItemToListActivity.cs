using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Add Item to List")]
    [Description("Adds one or more items to a list. Converts types if necessary.")]
    public class AddItemToListActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List To Modify")]
        [Description("The list variable to which new elements will be added.")]
        public InArgument<List<object>> TargetList { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Item To Add")]
        [Description("A single item or comma-separated values to add to the list.")]
        public InArgument<string> ItemToAdd { get; set; }


        [Category("Input")]
        [DisplayName("Custom Separator")]
        [Description(
            "Optional. If provided, splits the input using this separator instead of default ones (',', ';', '|').")]
        public InArgument<string> CustomSeparator { get; set; }

        [Category("Input")]
        [DisplayName("Trim Values")]
        [Description("If true, trims whitespace from each value before adding it to the list.")]
        [DefaultValue(false)]
        public InArgument<bool> TrimValues { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Modified List")]
        [Description("Returns the updated list after items have been added.")]
        public OutArgument<List<object>> ModifiedList { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var targetList = TargetList.Get(context);
                var itemToAdd = ItemToAdd.Get(context);
                var separator = CustomSeparator.Get(context);
                var trimValues = TrimValues.Get(context);

                if (targetList == null)
                    throw new ArgumentException("Target list cannot be null.");

                if (string.IsNullOrWhiteSpace(itemToAdd))
                    throw new ArgumentException("Item To Add cannot be empty.");


                // Default separators
                var items =
                    itemToAdd.Split(string.IsNullOrEmpty(separator) ? new[] { ',', ';', '|' } : new[] { separator[0] },
                        StringSplitOptions.RemoveEmptyEntries);

                targetList.AddRange(items.Select(item => trimValues ? item.Trim() : item).Cast<object>());

                ModifiedList.Set(context, targetList);
            }
            catch (Exception ex)
            {
                status = $"Error adding item(s) to list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}