using System.IO;
using NodeLibrary.Office;
using NodeLibrary.WordNodes.Enums;

namespace NodeLibrary.WordNodes;

[DisplayName("Save Word"), Description("Saves a previously launched Word instance.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class SaveWordNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to save.")]
    public required InArgument<object> WordInstance { get; set; }

    [DisplayName("Save Mode"), Description("Specifies how to save the document.")]
    public InArgument<SaveModeEnum> SaveMode { get; set; } = new InArgument<SaveModeEnum>(SaveModeEnum.SaveDocument);

    [DisplayName("Save Path"), Description("The file path to save the document when 'Save Document As' is selected.")]
    [RenderIfCondition(nameof(SaveMode), SaveModeEnum.SaveDocumentAs)]
    public InArgument<string> SavePath { get; set; } = new InArgument<string>();

    [DisplayName("Save Format"), Description("Specifies the format to save the document (.docx or .pdf).")]
    [RenderIfCondition(nameof(SaveMode), SaveModeEnum.SaveDocumentAs)]
    public InArgument<SaveFormatEnum> SaveFormat { get; set; } = new InArgument<SaveFormatEnum>(SaveFormatEnum.Docx);

    protected override void Execute(INodeContext context)
    {
        try
        {
            var wordAppArg = WordInstance.Get(context);
            var saveMode = SaveMode.Get(context);
            var savePath = SavePath.Get(context);
            var saveFormat = SaveFormat.Get(context);

            if (wordAppArg == null)
                throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");

            dynamic wordApp = wordAppArg;

            if (wordApp.Documents.Count == 0)
                throw new InvalidOperationException("No active documents are open in the Word instance.");

            dynamic activeDoc = wordApp.ActiveDocument;
            var status = string.Empty;

            switch (saveMode)
            {
                case SaveModeEnum.SaveDocument:
                    activeDoc.Save();
                    status = "Document saved successfully with existing name and location.";
                    break;

                case SaveModeEnum.SaveDocumentAs:
                    if (string.IsNullOrWhiteSpace(savePath))
                        throw new ArgumentException("SavePath must be provided when using 'Save Document As'.");

                    int format;
                    string finalPath = savePath;

                    switch (saveFormat)
                    {
                        case SaveFormatEnum.Docx:
                            format = OfficeConstants.WdFormatDocumentDefault;
                            if (!finalPath.EndsWith(".docx", StringComparison.OrdinalIgnoreCase))
                                finalPath = Path.ChangeExtension(finalPath, ".docx");
                            break;

                        case SaveFormatEnum.Pdf:
                            format = OfficeConstants.WdFormatPDF;
                            if (!finalPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                                finalPath = Path.ChangeExtension(finalPath, ".pdf");
                            break;

                        default:
                            throw new ArgumentOutOfRangeException(nameof(SaveFormat), "Invalid save format selected.");
                    }

                    activeDoc.SaveAs2(FileName: finalPath, FileFormat: format);
                    status = $"Document saved successfully as {Path.GetFileName(finalPath)}.";
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(SaveMode), "Invalid save mode selected.");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error saving Word document: {ex.Message}");
        }
    }
}
