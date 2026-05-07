using System.IO;
using System.Runtime.InteropServices;
using Word = Microsoft.Office.Interop.Word;

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
        Word.Application wordApp = null;
        Word.Document document = null;

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

            wordApp = new Word.Application
            {
                Visible = false,
                ScreenUpdating = false
            };

            document = wordApp.Documents.Open(
                inputPath,
                ReadOnly: true,
                Visible: false);

            document.ExportAsFixedFormat(
                outputPath,
                Word.WdExportFormat.wdExportFormatPDF,
                OpenAfterExport: false,
                OptimizeFor: Word.WdExportOptimizeFor.wdExportOptimizeForPrint,
                Range: Word.WdExportRange.wdExportAllDocument,
                Item: Word.WdExportItem.wdExportDocumentContent,
                IncludeDocProps: true,
                KeepIRM: true,
                CreateBookmarks: Word.WdExportCreateBookmarks.wdExportCreateHeadingBookmarks,
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
            if (document != null)
            {
                document.Close(false);
                Marshal.ReleaseComObject(document);
            }

            if (wordApp != null)
            {
                wordApp.Quit();
                Marshal.ReleaseComObject(wordApp);
            }

            document = null;
            wordApp = null;

            GC.Collect();
            GC.WaitForPendingFinalizers();
        }
    }
}
