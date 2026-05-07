using NodeLibrary.WordNodes.Enums;
using Word = Microsoft.Office.Interop.Word;

namespace NodeLibrary.WordNodes;

[DisplayName("Read From Word Document"), Description("Reads the text content from a document of a Word instance.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class ReadFromWordDocumentNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to read from.")]
    public required InArgument<Word.Application> WordInstance { get; set; }

    [DisplayName("Retrieve"), Description("Specifies the portion of the document to retrieve.")]
    public InArgument<RetrieveOptionEnum> Retrieve { get; set; } = new InArgument<RetrieveOptionEnum>(RetrieveOptionEnum.WholeDocument);

    [DisplayName("Word Data"), Description("The value of the retrieved content.")]
    public OutArgument<string> WordData { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var wordApp = WordInstance.Get(context);
            var retrieveOption = Retrieve.Get(context);

            if (wordApp == null)
                throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");

            Word._Document activeDocument = wordApp.ActiveDocument;
            if (activeDocument == null)
                throw new InvalidOperationException("No active document found in Word.");

            string content = string.Empty;

            switch (retrieveOption)
            {
                case RetrieveOptionEnum.WholeDocument:
                    content = activeDocument.Content.Text;
                    break;

                case RetrieveOptionEnum.Pages:
                    throw new NotImplementedException("Page retrieval is not implemented.");

                case RetrieveOptionEnum.Bookmark:
                    throw new NotImplementedException("Bookmark retrieval is not implemented.");

                default:
                    throw new ArgumentException("Invalid Retrieve option.");
            }

            WordData.Set(context, content);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Read from word document successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading from Word document: {ex.Message}");
        }
    }
}
