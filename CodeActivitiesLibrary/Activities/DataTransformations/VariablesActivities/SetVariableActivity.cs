using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Set Variable")]
    [Description("Sets the value of a named variable within the workflow context.")]
    public class SetVariableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Variable Name")]
        [Description("The name of the variable to set.")]
        public InArgument<string> VariableName { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Set")]
        [Description("The value (text, number, list, or object) to assign to the variable.")]
        public InArgument<object> ValueToSet { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var variableName = VariableName.Get(context);
                var value = ValueToSet.Get(context);

                if (string.IsNullOrWhiteSpace(variableName))
                    throw new ArgumentException("Variable name cannot be empty.");

                // Set the variable using the underlying ActivityContext
                //TODO: Implement the actual variable setting logic.
                // context.DataContext.SetValue(new Variable<object>(variableName), value);
                var propertyToSet = context.DataContext.GetProperties().Find(variableName, true);
                if (propertyToSet == null)
                    throw new ArgumentException($"Variable '{variableName}' does not exist in the current context.");

                propertyToSet.SetValue(context.DataContext, value);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Variable '{variableName}' set successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error setting variable: {ex.Message}");
            }
        }
    }
}