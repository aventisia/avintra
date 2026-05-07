using System.IO;
using NodeLibrary.WordNodes.Enums;
using Word = Microsoft.Office.Interop.Word;

namespace NodeLibrary.WordNodes;

[DisplayName("Close Word"), Description("Closes a Word instance.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class CloseWordNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to close.")]
    public required InArgument<Word.Application> WordInstance { get; set; }

    [DisplayName("Before Closing Word"), Description("Specifies whether to save the document before closing Word.")]
    public InArgument<CloseOptionEnum> BeforeClosingWord { get; set; } = new InArgument<CloseOptionEnum>(CloseOptionEnum.DoNotSaveDocument);

    [DisplayName("Save Path"), Description("The file path to save the document when 'Save Document As' is selected.")]
    [RenderIfCondition(nameof(BeforeClosingWord), CloseOptionEnum.SaveDocumentAs)]
    public InArgument<string> SavePath { get; set; } = new InArgument<string>();

    [DisplayName("Save Format"), Description("The file format to use when saving the document (.docx or .pdf).")]
    [RenderIfCondition(nameof(BeforeClosingWord), CloseOptionEnum.SaveDocumentAs)]
    public InArgument<SaveFormatEnum> SaveFormat { get; set; } = new InArgument<SaveFormatEnum>(SaveFormatEnum.Docx);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var wordApp = WordInstance.Get(context);
            var closeOption = BeforeClosingWord.Get(context);
            var savePath = SavePath.Get(context);
            var saveFormat = SaveFormat.Get(context);

            if (wordApp == null)
                throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");

            if (wordApp.Documents.Count == 0)
                throw new InvalidOperationException("No active documents are open in the Word instance.");

            var activeDoc = wordApp.ActiveDocument;

            switch (closeOption)
            {
                case CloseOptionEnum.DoNotSaveDocument:
                    wordApp.Quit(Word.WdSaveOptions.wdDoNotSaveChanges);
                    break;

                case CloseOptionEnum.SaveDocument:
                    activeDoc.Save();
                    wordApp.Quit(Word.WdSaveOptions.wdSaveChanges);
                    break;

                case CloseOptionEnum.SaveDocumentAs:
                    if (string.IsNullOrWhiteSpace(savePath))
                        throw new ArgumentException("SavePath must be provided when using 'Save Document As'.");

                    Word.WdSaveFormat wordFormat;
                    string finalPath = savePath;

                    switch (saveFormat)
                    {
                        case SaveFormatEnum.Docx:
                            wordFormat = Word.WdSaveFormat.wdFormatDocumentDefault;
                            if (!finalPath.EndsWith(".docx", StringComparison.OrdinalIgnoreCase))
                                finalPath = Path.ChangeExtension(finalPath, ".docx");
                            break;

                        case SaveFormatEnum.Pdf:
                            wordFormat = Word.WdSaveFormat.wdFormatPDF;
                            if (!finalPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                                finalPath = Path.ChangeExtension(finalPath, ".pdf");
                            break;

                        default:
                            throw new ArgumentOutOfRangeException(nameof(SaveFormat), "Invalid save format selected.");
                    }

                    activeDoc.SaveAs2(FileName: finalPath, FileFormat: wordFormat);
                    wordApp.Quit(Word.WdSaveOptions.wdDoNotSaveChanges);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(BeforeClosingWord), "Invalid close option selected.");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Word closed successfully. {(closeOption == CloseOptionEnum.SaveDocumentAs ? $"Saved as {Path.GetFileName(savePath)}" : string.Empty)}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error closing Word: {ex.Message}");
        }
    }
}
