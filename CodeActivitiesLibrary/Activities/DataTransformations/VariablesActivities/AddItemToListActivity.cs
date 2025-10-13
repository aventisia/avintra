using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Add Item to List")]
    [Description("Adds one or more items to a list. Converts types if necessary.")]
    [ActivityMetaData(nodeImg:"/assets/Variables.svg")]
       public class AddItemToListActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("List To Modify")]
        [Description("The list variable to which new elements will be added.")]
        public InArgument<List<object>> TargetList { get; set; }

        [RequiredArgument]
        [DisplayName("Item To Add")]
        [Description("A single item or comma-separated values to add to the list.")]
        public InArgument<string> ItemToAdd { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Modified List")]
        [Description("Returns the updated list after items have been added.")]
        public OutArgument<List<object>> ModifiedList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var targetList = TargetList.Get(context);
                var itemToAdd = ItemToAdd.Get(context);

                if (targetList == null)
                    throw new ArgumentException("Target list cannot be null.");

                if (string.IsNullOrWhiteSpace(itemToAdd))
                    throw new ArgumentException("Item To Add cannot be empty.");

                // Split by default separators: comma, semicolon, pipe
                var items = itemToAdd.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries);

                // Add each item as object to the list
                targetList.AddRange(items.Cast<object>());

                ModifiedList.Set(context, targetList);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Item(s) added to the list successfully.");
            }
            catch (Exception ex)
            {
                ModifiedList.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error adding item(s) to list: {ex.Message}");
            }
        }
    }
}