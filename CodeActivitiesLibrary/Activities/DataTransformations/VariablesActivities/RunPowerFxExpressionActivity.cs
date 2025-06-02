using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Run Power Fx Expression")]
    [Description("Runs a simulated Power Fx expression and returns the result as text.")]
    public class RunPowerFxExpressionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Power Fx Expression")]
        [Description("The Power Fx-like expression to evaluate (e.g., '1 + 2', 'Text(Now(), \"yyyy-mm-dd\")'.")]
        public InArgument<string> PowerFxExpression { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Expression Result")]
        [Description("Returns the evaluated result of the Power Fx expression (simulated).")]
        public OutArgument<string> ExpressionResult { get; set; }

        [Category("Output")]

        

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var expr = PowerFxExpression.Get(context);

                if (string.IsNullOrWhiteSpace(expr))
                    throw new ArgumentException("Power Fx Expression cannot be empty.");

                var result = EvaluatePowerFxExpression(expr);
                ExpressionResult.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error evaluating Power Fx expression: {ex.Message}";
                ExpressionResult.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }

        private string EvaluatePowerFxExpression(string expr)
        {
            // Simulate parsing basic expressions
            return $"Simulated result of: {expr}";
        }
    }
}