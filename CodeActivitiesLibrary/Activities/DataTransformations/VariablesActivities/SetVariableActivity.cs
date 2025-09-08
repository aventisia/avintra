using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    // IMPORTANT NOTE: DO NOT CHANGE THE NAME OF THIS class AND InArgument/OutArgument NAMES
    // THESE NAMES ARE BEING USED IN AGENT BUILDER REACT APP

    [DisplayName("Set Variable")]
    [Description("Sets the value of a named variable within the workflow context. Supports arithmetic expressions for ValueToSet.")]
    public class SetVariableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Variable Name")]
        [Description("The name of the variable to set.")]
        public InArgument<string> VariableName { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Set")]
        [Description("The value (text, number, list, object, or arithmetic expression) to assign to the variable.")]
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
                // Step 1: Validate variable name
                if (!IsValidVariableName(variableName))
                {
                    statusMessage = "Variable name is not valid.";
                    isSuccess = false;
                }

                // Step 2: Validate input value
                if (valueToSet == null)
                {
                    statusMessage = "Value to set cannot be null.";
                    isSuccess = false;
                }

                object finalValue = valueToSet;

                // Step 3: If value is a string, try to evaluate as arithmetic expression
                if (isSuccess && valueToSet is string strValue)
                {
                    try
                    {
                        // Use DynamicExpressionParser to evaluate expression
                        var lambda = DynamicExpressionParser.ParseLambda(
                            new ParsingConfig(),
                            parameters: new ParameterExpression[] { },
                            resultType: typeof(object),
                            expression: strValue
                        );

                        finalValue = lambda.Compile().DynamicInvoke();
                        statusMessage = $"Expression '{strValue}' evaluated successfully to {finalValue}.";
                    }
                    catch
                    {
                        // If expression parsing fails, keep as plain string
                        finalValue = strValue;
                        statusMessage = $"Assigned as plain value (not a valid expression): '{strValue}'.";
                    }
                }

                // Step 4: Set variable
                if (isSuccess)
                {
                    OutVariableValue.Set(context, finalValue);
                    statusMessage = $"Variable '{variableName}' set successfully with value: {finalValue}";
                }

                // Set outputs
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