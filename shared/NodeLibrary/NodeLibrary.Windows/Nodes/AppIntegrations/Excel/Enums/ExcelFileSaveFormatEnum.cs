namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelFileSaveFormatEnum
{
    // Modern Excel Formats
    [Display(Name = "Excel Workbook (*.xlsx)", Description = "Saves as Excel Workbook (*.xlsx), the default modern Excel format.")]
    xlOpenXMLWorkbook = 51,

    [Display(Name = "Excel Macro-Enabled Workbook (*.xlsm)", Description = "Saves as Excel Macro-Enabled Workbook (*.xlsm) with macro support.")]
    xlOpenXMLWorkbookMacroEnabled = 52,

    [Display(Name = "Excel Binary Workbook (*.xlsb)", Description = "Saves as Excel Binary Workbook (*.xlsb) optimized for performance.")]
    xlExcel12 = 50,

    [Display(Name = "Excel 97-2003 Workbook (*.xls)", Description = "Saves as Excel 97-2003 Workbook (*.xls) for backward compatibility.")]
    xlExcel9795 = 43,

    [Display(Name = "Strict Open XML Spreadsheet (*.xlsx)", Description = "Saves as Strict Open XML Spreadsheet (*.xlsx) compliant with standards.")]
    xlOpenXMLStrictWorkbook = 61,

    // Templates
    [Display(Name = "Excel Template (*.xltx)", Description = "Saves as Excel Template (*.xltx) without macro support.")]
    xlOpenXMLTemplate = 54,

    [Display(Name = "Excel Macro-Enabled Template (*.xltm)", Description = "Saves as Excel Macro-Enabled Template (*.xltm) with macro support.")]
    xlOpenXMLTemplateMacroEnabled = 53,

    [Display(Name = "Excel 97-2003 Template (*.xlt)", Description = "Saves as Excel 97-2003 Template (*.xlt) for backward compatibility.")]
    xlExcel8 = 56,

    // Add-ins
    [Display(Name = "Excel Add-in (*.xlam)", Description = "Saves as Excel Add-in (*.xlam) with macro support.")]
    xlOpenXMLAddIn = 55,

    [Display(Name = "Excel 97-2003 Add-in (*.xla)", Description = "Saves as Excel 97-2003 Add-in (*.xla) for backward compatibility.")]
    xlAddIn = 18,

    // CSV Formats
    [Display(Name = "CSV (Comma delimited) (*.csv)", Description = "Saves as CSV (Comma delimited) (*.csv) format.")]
    xlCSV = 6,

    [Display(Name = "CSV (Macintosh) (*.csv)", Description = "Saves as CSV (Macintosh) (*.csv) with Macintosh encoding.")]
    xlCSVMac = 22,

    [Display(Name = "CSV (MS-DOS) (*.csv)", Description = "Saves as CSV (MS-DOS) (*.csv) with MS-DOS encoding.")]
    xlCSVMSDOS = 24,

    // Text Formats
    [Display(Name = "Unicode Text (*.txt)", Description = "Saves as Unicode Text (*.txt) with full character set support.")]
    xlUnicodeText = 42,

    [Display(Name = "Text (Macintosh) (*.txt)", Description = "Saves as Text (Macintosh) (*.txt) with Macintosh line breaks.")]
    xlTextMac = 19,

    [Display(Name = "Text (MS-DOS) (*.txt)", Description = "Saves as Text (MS-DOS) (*.txt) with MS-DOS line breaks.")]
    xlTextMSDOS = 21,

    [Display(Name = "Formatted Text (Space delimited) (*.prn)", Description = "Saves as Formatted Text (Space delimited) (*.prn).")]
    xlTextPrinter = 36,

    // Markup/Web Formats
    [Display(Name = "Web Page (*.htm;*.html)", Description = "Saves as Web Page (*.htm;*.html) with table-based layout.")]
    xlHtml = 44,

    [Display(Name = "Single File Web Page (*.mht;*.mhtml)", Description = "Saves as Single File Web Page (*.mht;*.mhtml) containing all content.")]
    xlWebArchive = 45,

    [Display(Name = "XML Spreadsheet 2003 (*.xml)", Description = "Saves as XML Spreadsheet 2003 (*.xml) for structured data transfer.")]
    xlXMLSpreadsheet = 46,

    // Legacy/Alternative Formats
    [Display(Name = "Microsoft Excel 5.0/95 Workbook (*.xls)", Description = "Saves as Microsoft Excel 5.0/95 Workbook (*.xls).")]
    xlExcel5 = 39,

    [Display(Name = "DIF (Data Interchange Format) (*.dif)", Description = "Saves as DIF (Data Interchange Format) (*.dif).")]
    xlDIF = 9,

    [Display(Name = "SYLK (Symbolic Link) (*.slk)", Description = "Saves as SYLK (Symbolic Link) (*.slk) for data exchange.")]
    xlSYLK = 2,

    [Display(Name = "OpenDocument Spreadsheet (*.ods)", Description = "Saves as OpenDocument Spreadsheet (*.ods) for LibreOffice/OpenOffice compatibility.")]
    xlOpenDocumentSpreadsheet = 60
}
