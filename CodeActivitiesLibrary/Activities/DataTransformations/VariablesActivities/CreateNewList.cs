using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Create New List")]
    [Description("Creates a new empty list to be used in other activities.")]
    [ActivityMetaData(nodeImg: "/assets/Variables.svg")]
    public class CreateNewList : BaseCodeActivity
    {
        [DisplayName("Item To Add")]
        [Description("A single item or comma-separated values to add to the list.")]
        public InArgument<string> ItemToAdd { get; set; }

        [DisplayName("New List")]
        [Description("The newly created empty list.")]
        public OutArgument<List<object>> NewList { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Create a new empty list
                var newList = new List<object>();

                // Get the item to add
                var itemToAdd = ItemToAdd.Get(context);
                if (!string.IsNullOrEmpty(itemToAdd))
                {
                    var items = itemToAdd.Split(',');
                    foreach (var item in items)
                    {
                        newList.Add(item.Trim());
                    }
                }

                // Set the output
                NewList.Set(context, newList);

                // Set success flags
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "List created successfully.");
            }
            catch (Exception ex)
            {
                // In case of error, return empty list
                NewList.Set(context, new List<object>());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating list: {ex.Message}");
            }
        }
    }
}