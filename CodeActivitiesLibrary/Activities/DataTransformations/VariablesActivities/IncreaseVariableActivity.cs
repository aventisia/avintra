using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Increase Variable")]
    [Description("Increases a numeric variable by a specified value.")]
    public class IncreaseVariableActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Variable To Increase")]
        [Description("The numeric variable to increase.")]
        public InArgument<double> VariableToIncrease { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Value To Add")]
        [Description("The amount to add to the variable. Can be a number or another variable containing a number.")]
        public InArgument<double> ValueToAdd { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Result")]
        [Description("Returns the resulting value after increasing the variable.")]
        public OutArgument<double> Result { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var variable = VariableToIncrease.Get(context);
                var addValue = ValueToAdd.Get(context);

                var result = variable + addValue;
                Result.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error increasing variable: {ex.Message}";
                Result.Set(context, 0);
            }

            StatusMessage.Set(context, status);
        }
    }
}