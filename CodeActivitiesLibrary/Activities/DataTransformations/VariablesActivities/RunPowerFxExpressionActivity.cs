using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Run Power Fx Expression")]
    [Description("Runs a Power Fx expression and returns the result.")]
    public class RunPowerFxExpressionActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Run Power Fx Expression")]
        [Description("The Power Fx expression to evaluate.")]
        public InArgument<string> RunPowerFxExpression { get; set; }

        [Category("Output")]
        [DisplayName("Result")]
        [Description("The result of the evaluated Power Fx expression.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var powerFxExpression = RunPowerFxExpression.Get(context);

                if (string.IsNullOrWhiteSpace(powerFxExpression))
                    throw new ArgumentException("Power Fx expression cannot be empty.");

                // Simulate evaluation of the Power Fx expression
                var result = EvaluatePowerFxExpression(powerFxExpression);

                Result.Set(context, result);
                status += $" Expression '{powerFxExpression}' evaluated successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error evaluating Power Fx expression: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private string EvaluatePowerFxExpression(string expr)
        {
            // Placeholder: Replace with real Power Fx parser or integration
            return $"Simulated result of: {expr}";
        }
    }
}