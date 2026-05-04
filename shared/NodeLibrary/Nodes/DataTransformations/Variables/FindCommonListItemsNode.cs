namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Find Common List Items"), Description("Finds common items between two lists and returns them as a new list.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class FindCommonListItemsNode : BaseNode
{
    [DisplayName("First List"), Description("The first list to compare.")]
    public required InArgument<IEnumerable<object>> FirstList { get; set; }

    [DisplayName("Second List"), Description("The second list to compare.")]
    public required InArgument<IEnumerable<object>> SecondList { get; set; }

    [DisplayName("Intersection List"), Description("Returns a list containing the common items from both input lists.")]
    public OutArgument<List<object>> IntersectionList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var firstList = FirstList.Get(context);
            var secondList = SecondList.Get(context);

            if (firstList == null || secondList == null)
                throw new ArgumentException("Both lists must be initialized.");

            var commonItems = firstList.Intersect(secondList).ToList();

            IntersectionList.Set(context, commonItems);
            status = $"Successfully found {commonItems.Count} common item(s) between the two lists.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IntersectionList.Set(context, new List<object>());
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error finding common list items: {ex.Message}");
        }
    }
}
