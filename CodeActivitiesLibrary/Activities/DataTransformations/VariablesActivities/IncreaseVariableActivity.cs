using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Increase Variable")]
    [Description("Increases a numeric variable by a specified value.")]
    [ActivityMetaData(nodeImg: "/assets/Variables.svg")]
    public class IncreaseVariableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Variable To Increase")]
        [Description("The numeric variable to increase.")]
        public InArgument<double> VariableToIncrease { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Add")]
        [Description("The amount to add to the variable. Can be a number or another variable containing a number.")]
        public InArgument<double> ValueToAdd { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Result")]
        [Description("Returns the resulting value after increasing the variable.")]
        public OutArgument<double> Result { get; set; }

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

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully increased variable. Original value: {variable}, Added: {addValue}, Result: {result}.");
            }
            catch (Exception ex)
            {
                Result.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error increasing variable: {ex.Message}");
            }
            StatusMessage.Set(context, status);
        }
    }
}