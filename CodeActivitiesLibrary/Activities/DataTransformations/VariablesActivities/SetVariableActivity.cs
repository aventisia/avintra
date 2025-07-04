using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    // IMPORTANT NOTE: DO NOT CHANGE THE NAME OF THIS CLASS AND InArgument/OutArgument NAMES
    // THESE NAMES ARE BEING USED IN AGENT BUILDER REACT APP

    [DisplayName("Set Variable")]
    [Description("Sets the value of a named variable within the workflow context.")]
    public class SetVariableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Variable Name")]
        [Description("The name of the variable to set.")]
        public InArgument<string> VariableName { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Set")]
        [Description("The value (text, number, list, or object) to assign to the variable.")]
        public InArgument<object> ValueToSet { get; set; }

        // Hidden output argument to return the value of the variable. It should not be displayed in the config form
        public OutArgument<object> OutVariableValue { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var variableName = VariableName.Get(context);
            var valueToSet = ValueToSet.Get(context);
            var isSuccess = true;
            var statusMessage = "Success";

            try
            {
                // Step 1: Check if variable name is correct or not
                if (!IsValidVariableName(variableName))
                {
                    statusMessage = "Variable name is not valid.";
                    isSuccess = false;
                }

                // Step 2: Check if the value to set is valid or not
                if (valueToSet == null)
                {
                    statusMessage = "Value to set cannot be null or empty.";
                    isSuccess = false;
                }

                // Step 3: Set the variable in the context
                if (isSuccess)
                {
                    OutVariableValue.Set(context, valueToSet);
                    statusMessage = $"Variable '{variableName}' set successfully.";
                }

                IsSuccess.Set(context, isSuccess);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error setting variable: {ex.Message}");
            }
        }

        static bool IsValidVariableName(string name)
        {
            if (string.IsNullOrEmpty(name))
                return false;

            // If variable name contains spaces, it is not valid
            if (name.Contains(" "))
                return false;

            return true;
        }
    }
}