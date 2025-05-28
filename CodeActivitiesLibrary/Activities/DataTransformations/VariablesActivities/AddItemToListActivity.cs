using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Add Item to List")]
    [Description("Adds one or more items to a list. Converts types if necessary.")]
    public class AddItemToListActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Add Item")]
        [Description("A value or variable to add to the list. Can be a single item or comma-separated list of items.")]
        public InArgument<string> AddItem { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Into List")]
        [Description("The list variable to append new elements to.")]
        public InArgument<List<string>> IntoList { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var itemToAdd = AddItem.Get(context);
                var targetList = IntoList.Get(context);

                if (targetList == null)
                    throw new ArgumentException("Target list cannot be null.");

                // Add single item or multiple items
                if (!string.IsNullOrWhiteSpace(itemToAdd))
                {
                    var items = itemToAdd.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries);

                    foreach (var item in items) targetList.Add(item.Trim());

                    status = $"Added {items.Length} item(s) to the list.";
                }
                else
                {
                    status = "No item provided to add to the list.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error adding item to list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}