namespace NodeLibrary.ExcelNodes.Enums;

public enum ExcelFileSaveFormatEnum
{
    [Display(Name = "Workbook Normal", Description = "Saves as a standard Excel workbook without formatting or macros.")]
    xlWorkbookNormal = -4143,

    [Display(Name = "Current Platform Text", Description = "Saves as text format based on the current operating system.")]
    xlCurrentPlatformText = -4158,

    [Display(Name = "SYLK", Description = "Saves as SYLK (Symbolic Link) format, used for data exchange between spreadsheets.")]
    xlSYLK = 2,

    [Display(Name = "Lotus Worksheet", Description = "Saves as WKS (Worksheet) format compatible with Lotus 1-2-3.")]
    xlWKS = 4,

    [Display(Name = "Lotus WK1", Description = "Saves as WK1 (Lotus 1-2-3 version 1) format.")]
    xlWK1 = 5,

    [Display(Name = "CSV", Description = "Saves as CSV (Comma Delimited) format.")]
    xlCSV = 6,

    [Display(Name = "dBASE II", Description = "Saves as dBASE II database file (.dbf).")]
    xlDBF2 = 7,

    [Display(Name = "dBASE III", Description = "Saves as dBASE III database file (.dbf).")]
    xlDBF3 = 8,

    [Display(Name = "Data Interchange Format", Description = "Saves as DIF (Data Interchange Format), used for exchanging spreadsheet data.")]
    xlDIF = 9,

    [Display(Name = "dBASE IV", Description = "Saves as dBASE IV database file (.dbf).")]
    xlDBF4 = 11,

    [Display(Name = "WJ2 WD1", Description = "Saves in WJ2 WD1 format, used by Works Spreadsheet versions prior to 2002.")]
    xlWJ2WD1 = 14,

    [Display(Name = "Lotus WK3", Description = "Saves as WK3 (Lotus 1-2-3 version 3) format.")]
    xlWK3 = 15,

    [Display(Name = "Excel 2.0", Description = "Saves as Excel 2.0 binary format (.xls).")]
    xlExcel2 = 16,

    [Display(Name = "Excel Template", Description = "Saves as an Excel template (.xlt) for creating new workbooks.")]
    xlTemplate = 17,

    [Display(Name = "Excel Add-In", Description = "Saves as Excel add-in (.xla) containing macros or functions.")]
    xlAddIn = 18,

    [Display(Name = "Macintosh Text", Description = "Saves as plain text using Macintosh line breaks.")]
    xlTextMac = 19,

    [Display(Name = "Windows Text", Description = "Saves as plain text using Windows line breaks.")]
    xlTextWindows = 20,

    [Display(Name = "MS-DOS Text", Description = "Saves as plain text using MS-DOS line breaks.")]
    xlTextMSDOS = 21,

    [Display(Name = "CSV Macintosh", Description = "Saves as comma-separated values with Macintosh encoding (.csv).")]
    xlCSVMac = 22,

    [Display(Name = "CSV Windows", Description = "Saves as comma-separated values with Windows encoding (.csv).")]
    xlCSVWindows = 23,

    [Display(Name = "CSV MS-DOS", Description = "Saves as comma-separated values with MS-DOS encoding (.csv).")]
    xlCSVMSDOS = 24,

    [Display(Name = "International Macro", Description = "Saves as international macro format for cross-language compatibility.")]
    xlIntlMacro = 25,

    [Display(Name = "International Add-In", Description = "Saves as international add-in for cross-language macro use.")]
    xlIntlAddIn = 26,

    [Display(Name = "Excel 2 Far East", Description = "Saves as Excel 2.0 format supporting Far East languages.")]
    xlExcel2FarEast = 27,

    [Display(Name = "Works 2 Far East", Description = "Saves as Works Spreadsheet 2.0 format supporting Far East languages.")]
    xlWorks2FarEast = 28,

    [Display(Name = "Excel 3", Description = "Saves as Excel 3.0 binary format (.xls).")]
    xlExcel3 = 29,

    [Display(Name = "WK1 FMT", Description = "Saves as Lotus 1-2-3 format with formula support (.wks).")]
    xlWK1FMT = 30,

    [Display(Name = "WK1 ALL", Description = "Saves as Lotus 1-2-3 format including all objects and formulas (.wks).")]
    xlWK1ALL = 31,

    [Display(Name = "WK3 FM3", Description = "Saves as Lotus 1-2-3 WK3 FM3 format (.wk3).")]
    xlWK3FM3 = 32,

    [Display(Name = "Excel 4", Description = "Saves as Excel 4.0 binary format (.xls).")]
    xlExcel4 = 33,

    [Display(Name = "WQ1", Description = "Saves as Quattro Pro format (.wb1).")]
    xlWQ1 = 34,

    [Display(Name = "Excel 4 Workbook", Description = "Saves as Excel 4.0 workbook (.xls).")]
    xlExcel4Workbook = 35,

    [Display(Name = "Text Printer", Description = "Saves as text suitable for printing with fixed-width fonts.")]
    xlTextPrinter = 36,

    [Display(Name = "WK4", Description = "Saves as Lotus 1-2-3 WK4 format (.wk4).")]
    xlWK4 = 38,

    [Display(Name = "Excel 5", Description = "Saves as Excel 5.0/7.0 binary format (.xls).")]
    xlExcel5 = 39,

    [Display(Name = "WJ3", Description = "Saves as Works Spreadsheet WJ3 format (.wj3).")]
    xlWJ3 = 40,

    [Display(Name = "WJ3 FJ3", Description = "Saves as Works Spreadsheet WJ3 FJ3 format (.wj3/.fj3).")]
    xlWJ3FJ3 = 41,

    [Display(Name = "Unicode Text", Description = "Saves as Unicode text file (.txt) with full character set support.")]
    xlUnicodeText = 42,

    [Display(Name = "Excel 97-95", Description = "Saves as Excel 97-2003 format (.xls) for backward compatibility.")]
    xlExcel9795 = 43,

    [Display(Name = "HTML", Description = "Saves as HTML webpage (.html) with table-based layout.")]
    xlHtml = 44,

    [Display(Name = "Web Archive", Description = "Saves as single-file web archive (.mht) containing Excel content.")]
    xlWebArchive = 45,

    [Display(Name = "XML Spreadsheet", Description = "Saves as XML-based spreadsheet (.xml) for structured data transfer.")]
    xlXMLSpreadsheet = 46,

    [Display(Name = "Excel 12", Description = "Saves as Excel 12 binary format (.xlsb) optimized for performance.")]
    xlExcel12 = 50,

    [Display(Name = "Open XML Workbook", Description = "Saves as Open XML Workbook (.xlsx), the default modern Excel format.")]
    xlOpenXMLWorkbook = 51,

    [Display(Name = "Open XML Workbook Macro Enabled", Description = "Saves as Open XML Workbook with macro support (.xlsm).")]
    xlOpenXMLWorkbookMacroEnabled = 52,

    [Display(Name = "Open XML Template Macro Enabled", Description = "Saves as Excel template with macro support (.xltm).")]
    xlOpenXMLTemplateMacroEnabled = 53,

    [Display(Name = "Open XML Template", Description = "Saves as Excel template (.xltx) without macro support.")]
    xlOpenXMLTemplate = 54,

    [Display(Name = "Open XML Add-In", Description = "Saves as Excel Add-In (.xlam) with macro support.")]
    xlOpenXMLAddIn = 55,

    [Display(Name = "Excel 8.0", Description = "Saves as Excel 2003 binary format (.xls).")]
    xlExcel8 = 56,

    [Display(Name = "OpenDocument Spreadsheet", Description = "Saves as OpenDocument Spreadsheet (.ods) for LibreOffice/OpenOffice compatibility.")]
    xlOpenDocumentSpreadsheet = 60,

    [Display(Name = "Strict Open XML Workbook", Description = "Saves as Strict Open XML Workbook (.xlsx) compliant with IEC 61131-3 standard.")]
    xlOpenXMLStrictWorkbook = 61
}
