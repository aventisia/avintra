using System.IO;
using NodeLibrary.Office;

namespace NodeLibrary.WordNodes;

[DisplayName("Convert Word To PDF"), Description("Converts a Word document (.doc/.docx) into a PDF file.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class ConvertWordToPdfNode : BaseNode
{
    [DisplayName("Input File Path"), Description("Full path of the Word document (.doc or .docx).")]
    public required InArgument<string> InputFilePath { get; set; }

    [DisplayName("Output File Path"), Description("Full path where the PDF should be saved. If empty, PDF will be saved in same folder.")]
    public InArgument<string> OutputFilePath { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        dynamic? wordApp = null;
        dynamic? document = null;

        try
        {
            string inputPath = InputFilePath.Get(context);
            string outputPath = OutputFilePath.Get(context);

            if (string.IsNullOrWhiteSpace(inputPath))
                throw new ArgumentException("Input file path cannot be empty.");

            if (!File.Exists(inputPath))
                throw new FileNotFoundException("Word file not found.", inputPath);

            if (string.IsNullOrWhiteSpace(outputPath))
                outputPath = Path.ChangeExtension(inputPath, ".pdf");

            try
            {
                wordApp = OfficeAutomationHelper.CreateApplication(OfficeApplication.Word);
            }
            catch (Exception activationEx)
            {
                throw new OfficeAutomationException(
                    OfficeApplication.Word,
                    "convert Word document to PDF",
                    activationEx);
            }

            wordApp.Visible = false;
            wordApp.ScreenUpdating = false;

            document = wordApp.Documents.Open(
                inputPath,
                ReadOnly: true,
                Visible: false);

            document.ExportAsFixedFormat(
                outputPath,
                OfficeConstants.WdExportFormatPDF,
                OpenAfterExport: false,
                OptimizeFor: OfficeConstants.WdExportOptimizeForPrint,
                Range: OfficeConstants.WdExportAllDocument,
                Item: OfficeConstants.WdExportDocumentContent,
                IncludeDocProps: true,
                KeepIRM: true,
                CreateBookmarks: OfficeConstants.WdExportCreateHeadingBookmarks,
                DocStructureTags: true,
                BitmapMissingFonts: true,
                UseISO19005_1: false);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Word document successfully converted to PDF.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Conversion failed: {ex.Message}");
        }
        finally
        {
            OfficeAutomationHelper.Release(document);

            if (wordApp != null)
            {
                try
                {
                    wordApp.Quit();
                }
                catch (Exception)
                {
                    // Best-effort quit; ignore errors during cleanup.
                }
            }

            OfficeAutomationHelper.Release(wordApp);
        }
    }
}
