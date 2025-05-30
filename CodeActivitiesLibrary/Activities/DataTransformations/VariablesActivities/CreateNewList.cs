using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Create New List")]
    [Description("Creates a new empty list to be used in other activities.")]
    public class CreateNewList : CodeActivity
    {
        // Output: The new list created
        [Category("Output")]
        [RequiredArgument]
        [DisplayName("List")]
        [Description("The newly created empty list.")]
        public OutArgument<List<object>> List { get; set; }

        // Output argument to return the newly created list
        [Category("Output")]
        [Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Create a new empty list
            var newList = new List<object>();

            // Optionally, set the status message
            context.SetValue(StatusMessage, "List created successfully.");

        }
    }

}