namespace NodeLibrary.Models;

public class ResolvedConditionModel
{
    public object? FirstValue { get; set; }
    public ComparisonOperatorEnum ComparisonOperator { get; set; }
    public object? SecondValue { get; set; }
}