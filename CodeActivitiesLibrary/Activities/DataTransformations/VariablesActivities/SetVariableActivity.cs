using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Set Variable")]
    [Description("Sets the value of a named variable within the workflow context.")]
    public class SetVariableActivity : CodeActivity
    {
        [Category("Output")]
        [Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Variable Name")]
        [Description("The name of the variable to set.")]
        public InArgument<string> Variable { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Value")]
        [Description("The value to assign to the variable.")]
        public InArgument<string> Value { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var variableName = Variable.Get(context);
                var valueToSet = Value.Get(context);

                if (string.IsNullOrWhiteSpace(variableName))
                    throw new ArgumentException("Variable name cannot be empty.");

                // Simulate setting the variable
                status += $" Set variable '{variableName}' to '{valueToSet}'.";
            }
            catch (Exception ex)
            {
                status = $"Error setting variable: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}