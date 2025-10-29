using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Find and Replace in Excel Worksheet")]
    [Description("Finds text and replaces it with another in the specified Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class FindAndReplaceCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------
        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where find and replace will be performed.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Search Mode")]
        [Description("Specifies whether to perform a find operation or a find-and-replace operation.")]
        [DefaultValue(ExcelSearchModeEnum.Find)]
        public InArgument<ExcelSearchModeEnum> SearchMode { get; set; }

        [DisplayName("Text To Find")]
        [Description("The text or value to find in the worksheet.")]
        public InArgument<string> TextToFind { get; set; }

        [DisplayName("Text To Replace With")]
        [Description("The text or value to replace the found text with (required if 'Search Mode' is 'Find and Replace').")]
        [RenderIfCondition(nameof(SearchMode), ExcelSearchModeEnum.FindAndReplace)]
        public InArgument<string> TextToReplaceWith { get; set; }

        [DisplayName("All Matches")]
        [Description("If true, replaces all occurrences of the text. If false, replaces only the first occurrence.")]
        public InArgument<bool> AllMatches { get; set; }

        [DisplayName("Match Case")]
        [Description("If true, performs a case-sensitive search.")]
        public InArgument<bool> MatchCase { get; set; }

        [DisplayName("Match Entire Cell Contents")]
        [Description("If true, matches only cells that contain exactly the specified text.")]
        public InArgument<bool> MatchEntireCellContents { get; set; }

        [DisplayName("Search By")]
        [Description("Specifies whether to search by rows or columns.")]
        [DefaultValue(ExcelSearchByEnum.Rows)]
        public InArgument<ExcelSearchByEnum> SearchBy { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Found Cells")]
        [Description("Returns a list of all matched cells when 'All Matches' is true.")]
        [RenderIfCondition(nameof(AllMatches), true)]
        public OutArgument<List<Excel.Range>> FoundCells { get; set; }

        [DisplayName("Found Column Index")]
        [Description("Returns the column index of the found cell (if any).")]
        [RenderIfCondition(nameof(AllMatches), false)]
        public OutArgument<int> FoundColumnIndex { get; set; }

        [DisplayName("Found Row Index")]
        [Description("Returns the row index of the found cell (if any).")]
        [RenderIfCondition(nameof(AllMatches), false)]
        public OutArgument<int> FoundRowIndex { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {          
                var worksheet = WorksheetInstance.Get(context);
                var searchMode = SearchMode.Get(context);
                var textToFind = TextToFind.Get(context);
                var textToReplaceWith = TextToReplaceWith.Get(context);
                var allMatches = AllMatches.Get(context);
                var matchCase = MatchCase.Get(context);
                var matchEntireCellContents = MatchEntireCellContents.Get(context);
                var searchBy = SearchBy.Get(context);

              
                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is null.");

                switch (searchMode)
                {
                    case ExcelSearchModeEnum.Find:
                        {
                            var usedRange = worksheet.UsedRange;
                            var foundCells = new List<Excel.Range>();

                            if (allMatches)
                            {
                                // Find all matching cells
                                foundCells.AddRange(
                                    usedRange.Cast<Excel.Range>()
                                        .Where(cell => cell.Value2 != null &&
                                                       cell.Value2.ToString()
                                                       .Contains(textToFind,
                                                           matchCase ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase))
                                );
                            }
                            else
                            {
                                // Find the first matching cell
                                var found = usedRange.Find(
                                    What: textToFind,
                                    LookAt: matchEntireCellContents ? Excel.XlLookAt.xlWhole : Excel.XlLookAt.xlPart,
                                    MatchCase: matchCase,
                                    SearchOrder: searchBy == ExcelSearchByEnum.Rows
                                        ? Excel.XlSearchOrder.xlByRows
                                        : Excel.XlSearchOrder.xlByColumns
                                );

                                if (found != null)
                                    foundCells.Add(found);
                            }

                            if (foundCells.Count > 0)
                            {
                                status = $"Found {foundCells.Count} occurrence(s) of '{textToFind}'.";

                                if (allMatches)
                                {
                                    FoundCells.Set(context, foundCells);
                                }
                                else
                                {
                                    var firstFound = foundCells[0];
                                    FoundColumnIndex.Set(context, firstFound.Column);
                                    FoundRowIndex.Set(context, firstFound.Row);
                                }
                            }
                            else
                            {
                                status = $"No occurrences of '{textToFind}' were found.";
                            }

                            break;
                        }

                    case ExcelSearchModeEnum.FindAndReplace:
                        {
                            var usedRange = worksheet.UsedRange;

                            // Perform find-and-replace
                            var replaced = usedRange.Replace(
                                What: textToFind,
                                Replacement: textToReplaceWith,
                                LookAt: matchEntireCellContents ? Excel.XlLookAt.xlWhole : Excel.XlLookAt.xlPart,
                                SearchOrder: searchBy == ExcelSearchByEnum.Rows
                                    ? Excel.XlSearchOrder.xlByRows
                                    : Excel.XlSearchOrder.xlByColumns,
                                MatchCase: matchCase,
                                SearchFormat: false,
                                ReplaceFormat: false
                            );

                            status = replaced
                                ? $"Successfully replaced '{textToFind}' with '{textToReplaceWith}'."
                                : $"No occurrences of '{textToFind}' were found.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(searchMode));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error finding and replacing cells: {ex.Message}");
            }
        }
    }
}