namespace NodeLibrary.Office;

/// <summary>
/// Integer constants that replace the strongly-typed Office interop enum values used
/// across the Excel and Word activity nodes. Using integers lets the RunnerApp automate
/// whatever version of Office is installed on the user's Windows machine without needing
/// a specific version of the interop assemblies at build time.
/// </summary>
public static class OfficeConstants
{
    // Excel file formats (Microsoft.Office.Interop.Excel.XlFileFormat)
    public const int XlWorkbookDefault = 51;
    public const int XlOpenXMLWorkbook = 51;
    public const int XlOpenXMLWorkbookMacroEnabled = 52;
    public const int XlCSV = 6;
    public const int XlTextWindows = 20;

    // Excel save options (Microsoft.Office.Interop.Excel.XlSaveAsAccessMode)
    public const int XlNoChange = 1;
    public const int XlShared = 2;
    public const int XlExclusive = 3;

    // Excel worksheet range directions (Microsoft.Office.Interop.Excel.XlDirection)
    public const int XlUp = -4162;
    public const int XlDown = -4121;
    public const int XlToLeft = -4159;
    public const int XlToRight = -4161;

    // Excel delete shift directions (Microsoft.Office.Interop.Excel.XlDeleteShiftDirection)
    public const int XlShiftToLeft = -4159;
    public const int XlShiftUp = -4162;

    // Excel insert shift directions (Microsoft.Office.Interop.Excel.XlInsertShiftDirection)
    public const int XlShiftToRight = -4161;
    public const int XlShiftDown = -4121;

    // Excel find/replace constants (Microsoft.Office.Interop.Excel.XlLookAt)
    public const int XlWhole = 1;
    public const int XlPart = 2;

    // Excel find/replace constants (Microsoft.Office.Interop.Excel.XlSearchOrder)
    public const int XlByRows = 1;
    public const int XlByColumns = 2;

    // Excel find/replace constants (Microsoft.Office.Interop.Excel.XlFindLookIn)
    public const int XlValues = -4164;
    public const int XlFormulas = -4123;
    public const int XlComments = -4144;

    // Excel find/replace constants (Microsoft.Office.Interop.Excel.XlYesNoGuess)
    public const int XlGuess = 0;
    public const int XlYes = 1;
    public const int XlNo = 2;

    // Excel AutoFilter constants (Microsoft.Office.Interop.Excel.XlAutoFilterOperator)
    public const int XlAnd = 1;
    public const int XlOr = 2;
    public const int XlBottom10Items = 4;
    public const int XlTop10Items = 3;

    // Excel paste constants (Microsoft.Office.Interop.Excel.XlPasteType)
    public const int XlPasteAll = -4104;
    public const int XlPasteValues = -4163;
    public const int XlPasteFormulas = -4123;
    public const int XlPasteFormats = -4122;
    public const int XlPasteComments = -4144;

    // Excel paste special operation constants (Microsoft.Office.Interop.Excel.XlPasteSpecialOperation)
    public const int XlPasteSpecialOperationNone = -4142;
    public const int XlPasteSpecialOperationAdd = 2;
    public const int XlPasteSpecialOperationSubtract = 3;
    public const int XlPasteSpecialOperationMultiply = 4;
    public const int XlPasteSpecialOperationDivide = 5;

    // Excel AutoFill type constants (Microsoft.Office.Interop.Excel.XlAutoFillType)
    public const int XlFillCopy = 1;
    public const int XlFillDays = 5;
    public const int XlFillDefault = 0;
    public const int XlFillFormats = 3;
    public const int XlFillMonths = 7;
    public const int XlFillSeries = 2;
    public const int XlFillValues = 4;
    public const int XlFillWeekdays = 6;
    public const int XlFillYears = 8;
    public const int XlGrowthTrend = 10;
    public const int XlLinearTrend = 9;

    // Excel cell type constants used by SpecialCells (Microsoft.Office.Interop.Excel.XlCellType)
    public const int XlCellTypeLastCell = 11;
    public const int XlCellTypeConstants = 2;
    public const int XlCellTypeFormulas = -4123;
    public const int XlCellTypeVisible = 12;

    // Excel special-cells value constants (Microsoft.Office.Interop.Excel.XlSpecialCellsValue)
    public const int XlErrors = 16;
    public const int XlLogical = 4;
    public const int XlNumbers = 1;
    public const int XlTextValues = 2;

    // Word save format (Microsoft.Office.Interop.Word.WdSaveFormat)
    public const int WdFormatDocument = 0;
    public const int WdFormatPDF = 17;
    public const int WdFormatDocumentDefault = 16;

    // Word export format (Microsoft.Office.Interop.Word.WdExportFormat)
    public const int WdExportFormatPDF = 17;

    // Word export optimize for (Microsoft.Office.Interop.Word.WdExportOptimizeFor)
    public const int WdExportOptimizeForPrint = 0;
    public const int WdExportOptimizeForOnScreen = 1;

    // Word export range (Microsoft.Office.Interop.Word.WdExportRange)
    public const int WdExportAllDocument = 0;
    public const int WdExportSelection = 1;
    public const int WdExportFromTo = 3;

    // Word export item (Microsoft.Office.Interop.Word.WdExportItem)
    public const int WdExportDocumentContent = 0;
    public const int WdExportDocumentWithMarkup = 7;

    // Word export create bookmarks (Microsoft.Office.Interop.Word.WdExportCreateBookmarks)
    public const int WdExportCreateNoBookmarks = 0;
    public const int WdExportCreateHeadingBookmarks = 1;
    public const int WdExportCreateWordBookmarks = 2;

    // Word save options (Microsoft.Office.Interop.Word.WdSaveOptions)
    public const int WdDoNotSaveChanges = 0;
    public const int WdSaveChanges = -1;
    public const int WdPromptToSaveChanges = -2;

    // Word collapse direction (Microsoft.Office.Interop.Word.WdCollapseDirection)
    public const int WdCollapseStart = 1;
    public const int WdCollapseEnd = 0;

    // Word find/replace (Microsoft.Office.Interop.Word.WdFindWrap)
    public const int WdFindContinue = 1;
    public const int WdFindAsk = 2;
    public const int WdFindStop = 0;

    // Word find/replace (Microsoft.Office.Interop.Word.WdReplace)
    public const int WdReplaceNone = 0;
    public const int WdReplaceOne = 1;
    public const int WdReplaceAll = 2;

    // Word statistic (Microsoft.Office.Interop.Word.WdStatistic)
    public const int WdStatisticPages = 2;

    // Word go-to items (Microsoft.Office.Interop.Word.WdGoToItem)
    public const int WdGoToPage = 1;

    // Word go-to direction (Microsoft.Office.Interop.Word.WdGoToDirection)
    public const int WdGoToAbsolute = 1;

    // Word document view constants (Microsoft.Office.Interop.Word.WdViewType)
    public const int WdNormalView = 1;
    public const int WdPrintView = 3;
}
