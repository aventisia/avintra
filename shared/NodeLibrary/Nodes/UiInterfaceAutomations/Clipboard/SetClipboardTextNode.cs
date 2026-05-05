using NodeLibrary.ClipboardNodes.Helpers;

namespace NodeLibrary.ClipboardNodes;

[DisplayName("Set Clipboard Text"), Description("Sets the specified text to the system clipboard.")]
[NodeMetadata(icon: "/assets/Clipboard.svg")]
public class SetClipboardTextNode : BaseNode
{
    [DisplayName("Clipboard Text"), Description("The text to set to the clipboard.")]
    public InArgument<string> ClipboardText { get; set; } = new InArgument<string>(string.Empty);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var text = ClipboardText.Get(context);
            var success = false;

            var staThread = new Thread(() =>
            {
                try
                {
                    success = ClipboardInteropHelpers.SetText(text);
                }
                catch (Exception ex)
                {
                    success = false;
                    StatusMessage.Set(context, $"Error setting clipboard text: {ex.Message}");
                }
            });

            staThread.SetApartmentState(ApartmentState.STA);
            staThread.IsBackground = true;
            staThread.Start();
            staThread.Join();

            IsSuccess.Set(context, success);
            StatusMessage.Set(context, success
                ? "Successfully set clipboard text."
                : "Failed to set clipboard text after multiple attempts.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting clipboard text: {ex.Message}");
        }
    }
}
