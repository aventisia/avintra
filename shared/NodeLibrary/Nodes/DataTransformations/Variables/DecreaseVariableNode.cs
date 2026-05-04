namespace NodeLibrary.VariablesNodes;

[DisplayName("Decrease Variable"), Description("Decreases a numeric variable by a specified value.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class DecreaseVariableNode : BaseNode
{
    [DisplayName("Variable To Decrease"), Description("The numeric variable that will be decreased.")]
    public required InArgument<double> VariableToDecrease { get; set; }

    [DisplayName("Value To Subtract"), Description("The amount to subtract from the variable. Can be a number or another variable containing a number.")]
    public required InArgument<double> ValueToSubtract { get; set; }

    [DisplayName("Decreased Variable"), Description("Returns the resulting value after decreasing the variable.")]
    public OutArgument<double> DecreasedVariable { get; set; } = new OutArgument<double>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var variable = VariableToDecrease.Get(context);
            var subtract = ValueToSubtract.Get(context);

            var decreasedVariable = variable - subtract;
            DecreasedVariable.Set(context, decreasedVariable);

            status = $"Successfully decreased the variable from {variable} by {subtract}. Result: {decreasedVariable}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            DecreasedVariable.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error decreasing variable: {ex.Message}");
        }
    }
}
