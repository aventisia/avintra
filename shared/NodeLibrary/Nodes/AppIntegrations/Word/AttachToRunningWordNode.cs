using System.IO;
using System.Runtime.InteropServices;
using Word = Microsoft.Office.Interop.Word;

namespace NodeLibrary.WordNodes;

[DisplayName("Attach to Running Word"), Description("Attaches to a Word document that's already open, or opens it if needed.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class AttachToRunningWordNode : BaseNode
{
    [DisplayName("Document Path"), Description("The full path or file name of the Word document to attach to.")]
    public required InArgument<string> DocumentPath { get; set; }

    [DisplayName("Word Instance"), Description("The Word instance for later Word activities.")]
    public OutArgument<Word.Application> WordInstance { get; set; } = new OutArgument<Word.Application>();

    protected override void Execute(INodeContext context)
    {
        var documentPath = DocumentPath.Get(context);
        Word.Application wordApp = null;
        Word._Document targetDocument = null;

        try
        {
            if (string.IsNullOrWhiteSpace(documentPath))
                throw new ArgumentException("Document Path cannot be null or empty.");

            // Normalize to full path
            string fullPath = documentPath;
            if (!Path.IsPathRooted(documentPath) && File.Exists(documentPath))
                fullPath = Path.GetFullPath(documentPath);

            // Get running Word
            try
            {
                CLSIDFromProgID("Word.Application", out Guid clsid);
                int hr = GetActiveObject(ref clsid, IntPtr.Zero, out object obj);
                if (hr >= 0)
                    wordApp = obj as Word.Application;
            }
            catch
            {
                // No running Word found, will create one
            }

            bool isNewInstance = false;
            if (wordApp == null)
            {
                wordApp = new Word.Application();
                isNewInstance = true;
            }

            // Check if document is already open
            targetDocument = wordApp.Documents
                .Cast<Word._Document>()
                .FirstOrDefault(doc =>
                    doc.FullName.Equals(fullPath, StringComparison.OrdinalIgnoreCase));

            if (targetDocument == null)
            {
                if (File.Exists(fullPath))
                {
                    targetDocument = wordApp.Documents.Open(fullPath);
                }
                else
                {
                    if (isNewInstance)
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

    private static bool IsWordVisible(Word.Application wordApp)
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

    [DllImport("ole32.dll")]
    private static extern int CLSIDFromProgID([MarshalAs(UnmanagedType.LPWStr)] string lpszProgID, out Guid pclsid);

    [DllImport("oleaut32.dll")]
    private static extern int GetActiveObject(ref Guid rclsid, IntPtr pvReserved, [MarshalAs(UnmanagedType.IUnknown)] out object ppunk);
}
