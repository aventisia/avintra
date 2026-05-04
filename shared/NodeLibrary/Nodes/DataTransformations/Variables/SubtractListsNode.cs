namespace NodeLibrary.VariablesNodes;

[DisplayName("Subtract Lists"), Description("Removes items from the first list that exist in the second list.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class SubtractListsNode : BaseNode
{
    [DisplayName("First List"), Description("The variable that holds the first list to compare.")]
    public required InArgument<List<object>> FirstList { get; set; }

    [DisplayName("Second List"), Description("The variable that contains the second list used to subtract items from the first list.")]
    public required InArgument<List<object>> SecondList { get; set; }

    [DisplayName("List Difference Output"), Description("The resulting list after subtracting items from the second list.")]
    public OutArgument<List<object>> ListDifferenceOutput { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var firstList = FirstList.Get(context);
            var secondList = SecondList.Get(context);

            if (firstList == null || secondList == null)
                throw new ArgumentException("Both lists must be initialized.");

            var result = firstList.Except(secondList).ToList();

            ListDifferenceOutput.Set(context, result);
            status += $" Subtracted {secondList.Count() - result.Count()} item(s) from the list.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error For the subtracting lists: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error subtracting lists: {ex.Message}");
        }
    }
}
