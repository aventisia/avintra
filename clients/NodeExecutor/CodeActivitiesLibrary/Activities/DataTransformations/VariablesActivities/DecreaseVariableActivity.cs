using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Decrease Variable")]
    [Description("Decreases a numeric variable by a specified value.")]
    [ActivityMetaData(nodeImg: "/assets/Variables.svg")]
    public class DecreaseVariableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Variable To Decrease")]
        [Description("The numeric variable that will be decreased.")]
        public InArgument<double> VariableToDecrease { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Subtract")]
        [Description(
            "The amount to subtract from the variable. Can be a number or another variable containing a number.")]
        public InArgument<double> ValueToSubtract { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Decreased Variable")]
        [Description("Returns the resulting value after decreasing the variable.")]
        public OutArgument<double> DecreasedVariable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var variable = VariableToDecrease.Get(context);
                var subtract = ValueToSubtract.Get(context);

                var decreasedVariable = variable - subtract;
                DecreasedVariable.Set(context, decreasedVariable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully decreased the variable from {variable} by {subtract}. Result: {decreasedVariable}");
            }
            catch (Exception ex)
            {
                DecreasedVariable.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error decreasing variable: {ex.Message}");
            }
            StatusMessage.Set(context, status);
        }
    }
}