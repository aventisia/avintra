using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Decrease Variable")]
    [Description("Decreases a numeric variable by a specified value.")]
    public class DecreaseVariableActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Variable Name")]
        [Description("A numeric variable to decrease.")]
        public InArgument<string> VariableName { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Decrease By")]
        [Description(
            "The amount to subtract from the variable. Can be a number or another variable containing a number.")]
        public InArgument<string> DecreaseBy { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var variableName = VariableName.Get(context);
                var decreaseByValue = DecreaseBy.Get(context);

                if (string.IsNullOrWhiteSpace(variableName))
                    throw new ArgumentException("Variable name cannot be null or empty.");

                if (!double.TryParse(variableName, out var variableValue))
                    throw new ArgumentException($"'{variableName}' is not a valid numeric value.");

                if (!double.TryParse(decreaseByValue, out var decreaseValue))
                    throw new ArgumentException($"'{decreaseByValue}' is not a valid numeric value.");

                // Perform the subtraction
                var result = variableValue - decreaseValue;

                // Simulate setting the decreased value back to the variable container
                status += $" Decreased '{variableName}' by '{decreaseByValue}'. Result: {result}.";
            }
            catch (Exception ex)
            {
                status = $"Error decreasing variable: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}