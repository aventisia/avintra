using CodeActivitiesLibrary.Extensions;
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

        // Output argument to return the newly created list



        protected override void Execute(CodeActivityContext context)
        {
            // Create a new empty list
            var newList = new List<object>();

            context.SetValue(NewList, newList);
            // Optionally, set the status message
            context.SetValue(StatusMessage, "List created successfully.");
        }
    }
}