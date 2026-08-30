using NodeLibrary.ClipboardNodes.Helpers;

namespace NodeLibrary.ClipboardNodes;

[DisplayName("Clear Clipboard Contents"), Description("Clears all contents from the system clipboard.")]
[NodeMetadata(icon: "/assets/Clipboard.svg")]
public class ClearClipboardContentsNode : BaseNode
{
    protected override void Execute(INodeContext context)
    {
        try
        {
            var staThread = new Thread(() =>
            {
                try
                {
                    bool success = ClipboardInteropHelpers.ClearClipboard();
                    IsSuccess.Set(context, success);
                    StatusMessage.Set(context, success
                        ? "Clipboard cleared successfully."
                        : "Failed to clear clipboard after multiple attempts.");
                }
                catch (Exception ex)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"Error clearing clipboard: {ex.Message}");
                }
            });

            staThread.SetApartmentState(ApartmentState.STA);
            staThread.IsBackground = true;
            staThread.Start();
            staThread.Join();
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Unexpected error: {ex.Message}");
        }
    }
}
