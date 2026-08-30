namespace NodeLibrary.VariablesNodes;

[DisplayName("Clear List"), Description("Removes all elements from the specified list.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class ClearListNode : BaseNode
{
    [DisplayName("List to Clear"), Description("The list variable whose elements will be removed.")]
    public required InArgument<IList<object>> ListToClear { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var list = ListToClear.Get(context);

            if (list == null)
                throw new ArgumentException("List cannot be null.");

            list.Clear();
            status = $"List cleared successfully. Count is now {list.Count}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error clearing the list: {ex.Message}");
        }
    }
}
