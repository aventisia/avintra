namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Reverse List"), Description("Reverses the order of items in a list.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class ReverseListNode : BaseNode
{
    [DisplayName("List to Reverse"), Description("The list whose item order will be reversed.")]
    public required InArgument<List<object>> ListToReverse { get; set; }

    [DisplayName("Reversed List"), Description("Returns the list after reversing the order of its items.")]
    public OutArgument<List<object>> ReversedList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var inputList = ListToReverse.Get(context);

            if (inputList == null)
                throw new ArgumentException("Input list cannot be null.");

            var result = new List<object>(inputList);
            result.Reverse();

            ReversedList.Set(context, result);
            status = $"List reversed successfully. Result: [{string.Join(", ", result)}]";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ReversedList.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reversing list: {ex.Message}");
        }
    }
}
