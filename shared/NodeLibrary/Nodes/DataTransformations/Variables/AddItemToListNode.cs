namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Add Item to List"), Description("Adds one or more items to a list. Converts types if necessary.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class AddItemToListNode : BaseNode
{
    [DisplayName("List To Modify"), Description("The list variable to which new elements will be added.")]
    public required InArgument<List<object>> TargetList { get; set; }

    [DisplayName("Item To Add"), Description("A single item or comma-separated values to add to the list.")]
    public required InArgument<string> ItemToAdd { get; set; }

    [DisplayName("Modified List"), Description("Returns the updated list after items have been added.")]
    public OutArgument<List<object>> ModifiedList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var targetList = TargetList.Get(context);
            var itemToAdd = ItemToAdd.Get(context);

            if (targetList == null)
                throw new ArgumentException("Target list cannot be null.");

            if (string.IsNullOrWhiteSpace(itemToAdd))
                throw new ArgumentException("Item To Add cannot be empty.");

            var items = itemToAdd.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries);
            targetList.AddRange(items.Cast<object>());

            ModifiedList.Set(context, targetList);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Item(s) added to the list successfully.");
        }
        catch (Exception ex)
        {
            ModifiedList.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding item(s) to list: {ex.Message}");
        }
    }
}
