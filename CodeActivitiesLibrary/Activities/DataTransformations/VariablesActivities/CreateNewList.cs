using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Create New List")]
    [Description("Creates a new empty list to be used in other activities.")]
    public class CreateNewList : BaseCodeActivity
    {
        [DisplayName("New List")]
        [Description("The newly created empty list.")]
        public OutArgument<List<object>> NewList { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Create a new empty list
                var newList = new List<object>();

                // Set the output
                NewList.Set(context, newList);

                // Set success flags
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "List created successfully.");
            }
            catch (Exception ex)
            {
                // In case of error, return empty list
                NewList.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating list: {ex.Message}");
            }
        }
    }
}