namespace NodeLibrary.Models;

public class UnresolvedConditionModel
{
    public required string Id { get; set; }
    public required string FirstValue { get; set; }
    public required ComparisonOperatorEnum ComparisonOperator { get; set; }
    public required string SecondValue { get; set; }
}