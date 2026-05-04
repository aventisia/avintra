namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Remove Duplicate Items From List"), Description("Removes duplicate items from a list using case-sensitive or case-insensitive comparison.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class RemoveDuplicateItemsFromListNode : BaseNode
{
    [DisplayName("List to Deduplicate"), Description("The list variable to remove duplicate values from.")]
    public required InArgument<List<object>> ListToDeduplicate { get; set; }

    [DisplayName("Ignore Case"), Description("If true, performs case-insensitive comparison when checking for duplicates.")]
    public InArgument<bool> IgnoreCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Deduplicated List"), Description("Returns the list after removing duplicate items.")]
    public OutArgument<List<object>> DeduplicatedList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var inputList = ListToDeduplicate.Get(context);
            var ignoreCase = IgnoreCase.Get(context);

            if (inputList == null)
                throw new ArgumentException("Input list cannot be null.");

            IEnumerable<object> result;

            if (ignoreCase)
                result = inputList
                    .OfType<string>()
                    .Select(s => s?.ToLower())
                    .Distinct()
                    .Cast<object>();
            else
                result = inputList.Distinct();

            DeduplicatedList.Set(context, result.ToList());
            status = "Successfully removed duplicates.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            DeduplicatedList.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing duplicates from list: {ex.Message}");
        }
    }
}
