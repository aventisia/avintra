using System.Diagnostics;
using System.Drawing;
using System.Drawing.Printing;
using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Print Document"), Description("Prints documents with advanced options including printer selection and print settings.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class PrintDocumentNode : BaseNode
{
    [DisplayName("Document Path"), Description("Full path to the document to print")]
    public required InArgument<string> DocumentPath { get; set; }

    [DisplayName("Printer Name"), Description("Name of specific printer to use (blank for default)")]
    public InArgument<string> PrinterName { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Print Method"), Description("Method to use for printing")]
    public InArgument<PrintMethodEnum> Method { get; set; } = new InArgument<PrintMethodEnum>(PrintMethodEnum.Default);

    [DisplayName("Copies"), Description("Number of copies to print")]
    public InArgument<int> Copies { get; set; } = new InArgument<int>(1);

    [DisplayName("Success"), Description("Indicates whether printing was successful")]
    public OutArgument<bool> Success { get; set; } = new OutArgument<bool>();

    [DisplayName("Job ID"), Description("Returns the print job ID if available")]
    public OutArgument<int?> JobId { get; set; } = new OutArgument<int?>();

    protected override void Execute(INodeContext context)
    {
        var documentPath = DocumentPath.Get(context);
        var printerName = PrinterName.Get(context);
        var method = Method.Get(context);
        var copies = Copies.Get(context);
        var status = string.Empty;
        var success = false;
        int? jobId = null;

        try
        {
            if (string.IsNullOrWhiteSpace(documentPath))
            {
                throw new ArgumentNullException("Document path cannot be empty");
            }

            if (!File.Exists(documentPath))
            {
                throw new FileNotFoundException("Document file not found", documentPath);
            }

            if (copies < 1)
            {
                throw new ArgumentOutOfRangeException("Copies must be at least 1");
            }

            switch (method)
            {
                case PrintMethodEnum.ProcessStart:
                    success = PrintViaProcess(documentPath, printerName, copies, ref status);
                    break;

                case PrintMethodEnum.Direct:
                    success = PrintDirect(documentPath, printerName, copies, ref jobId, ref status);
                    break;

                default:
                    success = PrintDefault(documentPath, printerName, copies, ref status);
                    break;
            }

            Success.Set(context, success);
            JobId.Set(context, jobId);
            IsSuccess.Set(context, success);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Success.Set(context, default(bool));
            JobId.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error printing document: {ex.Message}");
        }
    }

    private bool PrintViaProcess(string documentPath, string printerName, int copies, ref string status)
    {
        try
        {
            using var process = new Process();
            var args = string.IsNullOrEmpty(printerName)
                ? $"printui.dll,PrintUIEntry /p /q /n \"{printerName}\" /c# \"{copies}\" \"{documentPath}\""
                : $"printui.dll,PrintUIEntry /p /q /y \"{documentPath}\"";

            process.StartInfo = new ProcessStartInfo
            {
                FileName = "rundll32",
                Arguments = args,
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardError = true
            };

            process.Start();
            process.WaitForExit();

            if (process.ExitCode != 0)
            {
                var error = process.StandardError.ReadToEnd();
                throw new InvalidOperationException($"Print process failed: {error}");
            }

            status = "Document printed successfully via process";
            return true;
        }
        catch (Exception ex)
        {
            status = $"Process print error: {ex.Message}";
            return false;
        }
    }

    private bool PrintDirect(string documentPath, string printerName, int copies, ref int? jobId, ref string status)
    {
        try
        {
            using var printDoc = new PrintDocument();
            if (!string.IsNullOrEmpty(printerName))
            {
                printDoc.PrinterSettings.PrinterName = printerName;
            }

            printDoc.PrinterSettings.Copies = (short)copies;
            printDoc.DocumentName = Path.GetFileName(documentPath);

            printDoc.PrintPage += (sender, e) =>
            {
                using var img = Image.FromFile(documentPath);
                e.Graphics.DrawImage(img, e.MarginBounds);
                e.HasMorePages = false;
            };

            printDoc.Print();
            status = $"Document sent to printer '{printDoc.PrinterSettings.PrinterName}'";
            return true;
        }
        catch (Exception ex)
        {
            status = $"Direct print error: {ex.Message}";
            return false;
        }
    }

    private bool PrintDefault(string documentPath, string printerName, int copies, ref string status)
    {
        try
        {
            var startInfo = new ProcessStartInfo(documentPath)
            {
                Verb = "Print",
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden,
                UseShellExecute = true
            };

            Process.Start(startInfo);
            status = "Document sent to default printer";
            return true;
        }
        catch (Exception ex)
        {
            status = $"Default print error: {ex.Message}";
            return false;
        }
    }

    [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

    [DllImport("winspool.drv", SetLastError = true)]
    private static extern bool ClosePrinter(IntPtr hPrinter);

    public enum PrintMethodEnum
    {
        [Display(Name = "Default", Description = "Uses default system printing method")]
        Default,

        [Display(Name = "Process Start", Description = "Uses external process for printing")]
        ProcessStart,

        [Display(Name = "Direct", Description = "Uses direct printing when supported")]
        Direct
    }
}
