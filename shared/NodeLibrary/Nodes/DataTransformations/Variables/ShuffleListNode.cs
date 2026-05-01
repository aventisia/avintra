namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Shuffle List"), Description("Randomly reorders the items in a list.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class ShuffleListNode : BaseNode
{
    [DisplayName("List to Shuffle"), Description("The list to be randomly reordered.")]
    public required InArgument<IEnumerable<object>> ListToShuffle { get; set; }

    [DisplayName("Shuffled List"), Description("The shuffled version of the input list.")]
    public OutArgument<IEnumerable<object>> ShuffledList { get; set; } = new OutArgument<IEnumerable<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var inputList = ListToShuffle.Get(context);

            if (inputList == null || !inputList.Any())
                throw new ArgumentException("The list must contain at least one item.");

            var random = new Random();
            var shuffled = inputList.OrderBy(item => random.Next()).ToList();

            ShuffledList.Set(context, shuffled);
            status += $" List with {shuffled.Count()} items has been shuffled.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error while shuffling the list: {ex.Message}");
        }
    }
}
