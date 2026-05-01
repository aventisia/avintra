namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Create New List"), Description("Creates a new empty list to be used in other activities.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class CreateNewListNode : BaseNode
{
    [DisplayName("Item To Add"), Description("A single item or comma-separated values to add to the list.")]
    public InArgument<string> ItemToAdd { get; set; } = new InArgument<string>("");

    [DisplayName("New List"), Description("The newly created empty list.")]
    public OutArgument<List<object>> NewList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var newList = new List<object>();

            var itemToAdd = ItemToAdd.Get(context);
            if (!string.IsNullOrEmpty(itemToAdd))
            {
                var items = itemToAdd.Split(',');
                foreach (var item in items)
                {
                    newList.Add(item.Trim());
                }
            }

            NewList.Set(context, newList);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "List created successfully.");
        }
        catch (Exception ex)
        {
            NewList.Set(context, new List<object>());
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error creating list: {ex.Message}");
        }
    }
}
