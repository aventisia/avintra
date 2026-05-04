namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Merge Lists"), Description("Merges two lists into a new list. The original lists remain unchanged.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class MergeListsNode : BaseNode
{
    [DisplayName("First List"), Description("The first list of items to merge.")]
    public required InArgument<List<object>> FirstList { get; set; }

    [DisplayName("Second List"), Description("The second list of items to merge.")]
    public required InArgument<List<object>> SecondList { get; set; }

    [DisplayName("Merged List"), Description("Returns a new list containing all items from both input lists.")]
    public OutArgument<List<object>> MergedList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var firstList = FirstList.Get(context);
            var secondList = SecondList.Get(context);

            if (firstList == null || secondList == null)
                throw new ArgumentException("Both lists must be initialized.");

            var result = new List<object>(firstList);
            result.AddRange(secondList);

            MergedList.Set(context, result);
            status = $"Successfully merged {firstList.Count()} + {secondList.Count()} items.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            MergedList.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error merging lists: {ex.Message}");
        }
    }
}
