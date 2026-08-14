using NodeLibrary.Office;

namespace NodeLibrary.WordNodes;

[DisplayName("Attach to Running Word"), Description("Attaches to a Word document that's already open, or opens it if needed.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class AttachToRunningWordNode : BaseNode
{
    [DisplayName("Document Path"), Description("The full path or file name of the Word document to attach to.")]
    public required InArgument<string> DocumentPath { get; set; }

    [DisplayName("Word Instance"), Description("The Word instance for later Word activities.")]
    public OutArgument<object> WordInstance { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        var documentPath = DocumentPath.Get(context);
        dynamic? wordApp = null;
        dynamic? targetDocument = null;

        try
        {
            if (string.IsNullOrWhiteSpace(documentPath))
                throw new ArgumentException("Document Path cannot be null or empty.");

            // Normalize to full path
            string fullPath = documentPath;
            if (!Path.IsPathRooted(documentPath) && File.Exists(documentPath))
                fullPath = Path.GetFullPath(documentPath);

            wordApp = OfficeAutomationHelper.GetActiveApplication(OfficeApplication.Word, createIfMissing: true);
            bool isNewInstance = false;

            // Check if document is already open
            foreach (var doc in wordApp.Documents)
            {
                if (string.Equals((string)doc.FullName, fullPath, StringComparison.OrdinalIgnoreCase))
                {
                    targetDocument = doc;
                    break;
                }
            }

            if (targetDocument == null)
            {
                if (File.Exists(fullPath))
                {
                    targetDocument = wordApp.Documents.Open(fullPath);
                }
                else
                {
                    if (!IsWordVisible(wordApp))
                        wordApp.Quit();

                    throw new FileNotFoundException($"Document does not exist at path: {fullPath}");
                }
            }

            targetDocument.Activate();

            WordInstance.Set(context, wordApp);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully attached to document: {fullPath}");
        }
        catch (Exception ex)
        {
            if (wordApp != null && !IsWordVisible(wordApp))
                wordApp.Quit();

            WordInstance.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error attaching to Word document: {ex.Message}");
        }
    }

    private static bool IsWordVisible(dynamic wordApp)
    {
        try
        {
            return wordApp.Visible;
        }
        catch
        {
            return false;
        }
    }
}
