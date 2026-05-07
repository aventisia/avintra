using System.IO;
using NodeLibrary.WordNodes.Enums;
using Word = Microsoft.Office.Interop.Word;

namespace NodeLibrary.WordNodes;

[DisplayName("Launch Word"), Description("Launches a new Word instance or opens a Word document.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class LaunchWordNode : BaseNode
{
    [DisplayName("Launch Mode"), Description("Select how to launch Word: 'Blank Document' or 'Open Existing Document'.")]
    public InArgument<LaunchWordModeEnum> LaunchMode { get; set; } = new InArgument<LaunchWordModeEnum>(LaunchWordModeEnum.BlankDocument);

    [DisplayName("Document Path"), Description("The file path of the document to open. Required if 'Launch Mode' is 'Open Existing Document'.")]
    [RenderIfCondition(nameof(LaunchMode), LaunchWordModeEnum.OpenExistingDocument)]
    public InArgument<string> DocumentPath { get; set; } = new InArgument<string>("");

    [DisplayName("Make Instance Visible"), Description("Specifies whether the Word application window should be visible.")]
    public InArgument<bool> MakeInstanceVisible { get; set; } = new InArgument<bool>(true);

    [DisplayName("Word Instance"), Description("The specific Word instance for use with later Word actions. This allows the user to specify which of possibly several Word documents to access.")]
    public OutArgument<Word.Application> WordInstance { get; set; } = new OutArgument<Word.Application>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var launchMode = LaunchMode.Get(context);
            var documentPath = DocumentPath.Get(context);
            var makeInstanceVisible = MakeInstanceVisible.Get(context);

            var wordApp = new Word.Application();
            wordApp.Visible = makeInstanceVisible;

            switch (launchMode)
            {
                case LaunchWordModeEnum.BlankDocument:
                    Word._Document _ = wordApp.Documents.Add();
                    break;

                case LaunchWordModeEnum.OpenExistingDocument:
                    if (!string.IsNullOrEmpty(documentPath))
                    {
                        wordApp.Documents.Open(documentPath);
                    }
                    else
                    {
                        throw new ArgumentException("Document Path is required when launching with 'Open Existing Document'.");
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid Launch Mode. Supported values are 'Blank Document' and 'Open Existing Document'.");
            }

            WordInstance.Set(context, wordApp);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Word launched successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error launching Word: {ex.Message}");
        }
    }
}
