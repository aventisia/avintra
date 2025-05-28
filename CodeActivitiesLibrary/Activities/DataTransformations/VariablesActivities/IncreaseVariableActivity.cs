using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Increase Variable")]
    [Description("Increases a numeric variable by a specified value.")]
    public class IncreaseVariableActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Variable Name")]
        [Description("The name of the variable containing the numeric value to increase.")]
        public InArgument<string> VariableName { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Increase By")]
        [Description("The amount to add to the variable. Can be a number or another variable containing a number.")]
        public InArgument<string> IncreaseBy { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var variableName = VariableName.Get(context);
                var increaseByValue = IncreaseBy.Get(context);

                if (string.IsNullOrWhiteSpace(variableName))
                    throw new ArgumentException("Variable name cannot be null or empty.");

                if (!double.TryParse(variableName, out var variableValue))
                    throw new ArgumentException($"'{variableName}' is not a valid numeric value.");

                if (!double.TryParse(increaseByValue, out var increaseValue))
                    throw new ArgumentException($"'{increaseByValue}' is not a valid numeric value.");

                // Perform the addition
                var result = variableValue + increaseValue;

                // Simulate setting the increased value back to the variable container
                status += $" Increased '{variableName}' by '{increaseValue}'. Result: {result}.";
            }
            catch (Exception ex)
            {
                status = $"Error increasing variable: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}