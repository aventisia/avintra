using System.Linq.Dynamic.Core;
using System.Linq.Expressions;

namespace NodeLibrary.VariablesNodes;

// IMPORTANT NOTE: DO NOT CHANGE THE NAME OF THIS class AND InArgument/OutArgument NAMES
// THESE NAMES ARE BEING USED IN AGENT BUILDER REACT APP

[DisplayName("Set Variable"), Description("Sets the value of a named variable within the workflow context. Supports arithmetic expressions for ValueToSet.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class SetVariableNode : BaseNode
{
    [DisplayName("Variable Name"), Description("The name of the variable to set.")]
    public required InArgument<string> VariableName { get; set; }

    [DisplayName("Value To Set"), Description("The value (text, number, list, object, or arithmetic expression) to assign to the variable.")]
    public required InArgument<object> ValueToSet { get; set; }

    protected override void Execute(INodeContext context)
    {
        var variableName = VariableName.Get(context) ?? string.Empty;
        var valueToSet = ValueToSet.Get(context);
        var isSuccess = true;
        var statusMessage = "Success";

        try
        {
            if (!IsValidVariableName(variableName))
            {
                statusMessage = "Variable name is not valid.";
                isSuccess = false;
            }

            if (valueToSet == null)
            {
                statusMessage = "Value to set cannot be null.";
                isSuccess = false;
            }

            if (isSuccess && IsReservedVariableName(variableName))
            {
                statusMessage = $"Variable name '{variableName}' is reserved and cannot be used.";
                isSuccess = false;
            }

            object? finalValue = valueToSet;

            if (isSuccess && valueToSet is string strValue)
            {
                try
                {
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
                    finalValue = strValue;
                    statusMessage = $"Assigned as plain value (not a valid expression): '{strValue}'.";
                }
            }

            if (isSuccess)
            {
                DynamicOutputs[variableName] = finalValue;
                statusMessage = $"Variable '{variableName}' set successfully with value: {finalValue}";
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

        if (name.Contains(" "))
            return false;

        return true;
    }

    static bool IsReservedVariableName(string name)
    {
        return string.Equals(name, "IsSuccess", StringComparison.OrdinalIgnoreCase)
            || string.Equals(name, "Status", StringComparison.OrdinalIgnoreCase);
    }
}
