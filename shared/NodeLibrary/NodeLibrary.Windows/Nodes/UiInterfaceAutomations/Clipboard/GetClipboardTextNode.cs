using NodeLibrary.ClipboardNodes.Helpers;

namespace NodeLibrary.ClipboardNodes;

[DisplayName("Get Clipboard Text"), Description("Retrieves the text currently stored in the system clipboard.")]
[NodeMetadata(icon: "/assets/Clipboard.svg")]
public class GetClipboardTextNode : BaseNode
{
    [DisplayName("Clipboard Text Output"), Description("The text retrieved from the clipboard.")]
    public OutArgument<string> ClipboardTextOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var clipboardText = string.Empty;

            var staThread = new Thread(() =>
            {
                clipboardText = ClipboardInteropHelpers.GetText() ?? string.Empty;
            });

            staThread.SetApartmentState(ApartmentState.STA);
            staThread.IsBackground = true;
            staThread.Start();
            staThread.Join();

            ClipboardTextOutput.Set(context, clipboardText);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, string.IsNullOrEmpty(clipboardText)
                ? "Clipboard is empty or contains non-text data."
                : "Successfully retrieved clipboard text.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving clipboard text: {ex.Message}");
        }
    }
}
