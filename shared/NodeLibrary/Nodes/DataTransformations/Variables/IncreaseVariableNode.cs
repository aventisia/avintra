namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Increase Variable"), Description("Increases a numeric variable by a specified value.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class IncreaseVariableNode : BaseNode
{
    [DisplayName("Variable To Increase"), Description("The numeric variable to increase.")]
    public required InArgument<double> VariableToIncrease { get; set; }

    [DisplayName("Value To Add"), Description("The amount to add to the variable. Can be a number or another variable containing a number.")]
    public required InArgument<double> ValueToAdd { get; set; }

    [DisplayName("Result"), Description("Returns the resulting value after increasing the variable.")]
    public OutArgument<double> Result { get; set; } = new OutArgument<double>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var variable = VariableToIncrease.Get(context);
            var addValue = ValueToAdd.Get(context);

            var result = variable + addValue;
            Result.Set(context, result);

            status = $"Successfully increased variable. Original value: {variable}, Added: {addValue}, Result: {result}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error increasing variable: {ex.Message}");
        }
    }
}
