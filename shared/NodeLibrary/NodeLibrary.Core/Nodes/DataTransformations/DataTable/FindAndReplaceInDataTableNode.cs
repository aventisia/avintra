using System.Data;
using System.Text.RegularExpressions;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Find or Replace in Data Table"), Description("Finds and/or replaces data table values.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public sealed class FindAndReplaceInDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to process.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Search Mode"), Description("Specifies whether to find or find and replace values.")]
    public required InArgument<DataTableFindOrReplaceModeEnum> SearchMode { get; set; } = new InArgument<DataTableFindOrReplaceModeEnum>(DataTableFindOrReplaceModeEnum.Find);

    [DisplayName("Text to Find"), Description("The value to find in the data table.")]
    public InArgument<string> TextToFind { get; set; } = new InArgument<string>();

    [DisplayName("Text to Replace With"), Description("The value to replace with (required if 'Search Mode' is 'Find and Replace').")]
    [RenderIfCondition(nameof(SearchMode), DataTableFindOrReplaceModeEnum.FindAndReplace)]
    public InArgument<string> TextToReplaceWith { get; set; }

    [DisplayName("All Matches"), Description("If true, processes all occurrences. If false, processes only the first occurrence.")]
    public InArgument<bool> AllMatches { get; set; } = new InArgument<bool>(true);

    [DisplayName("Find Using a Regular Expression"), Description("If true, uses regular expressions for matching.")]
    public InArgument<bool> UseRegularExpression { get; set; } = new InArgument<bool>(false);

    [DisplayName("Match Case"), Description("If true, performs a case-sensitive search.")]
    public InArgument<bool> MatchCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Match Entire Cell Contents"), Description("If true, matches only cells that contain exactly the specified text.")]
    public InArgument<bool> MatchEntireCellContents { get; set; } = new InArgument<bool>(false);

    [DisplayName("Search By"), Description("Specifies how to search the data table.")]
    public InArgument<DataTableSearchByEnum> SearchBy { get; set; } = new InArgument<DataTableSearchByEnum>(DataTableSearchByEnum.Everywhere);

    [DisplayName("Column Index or Name"), Description("The column index or name to search within (required if 'Search By' is 'On Column').")]
    [RenderIfCondition(nameof(SearchBy), DataTableSearchByEnum.OnColumn)]
    public InArgument<string> ColumnIndexOrName { get; set; } = new InArgument<string>();

    [DisplayName("Matched Rows"), Description("Returns the rows that match the search criteria.")]
    public OutArgument<List<DataRow>> MatchedRows { get; set; } = new OutArgument<List<DataRow>>();

    protected override void Execute(INodeContext context)
    {
        var matchedRows = new List<DataRow>();
        var status = "Operation completed successfully.";

        try
        {
            var dataTable = DataTable.Get(context);
            var searchMode = SearchMode.Get(context);
            var textToFind = TextToFind.Get(context);
            var textToReplaceWith = TextToReplaceWith.Get(context);
            var allMatches = AllMatches.Get(context);
            var useRegularExpression = UseRegularExpression.Get(context);
            var matchCase = MatchCase.Get(context);
            var matchEntireCellContents = MatchEntireCellContents.Get(context);
            var searchBy = SearchBy.Get(context);
            var columnIndexOrName = ColumnIndexOrName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            if (string.IsNullOrWhiteSpace(textToFind))
                throw new ArgumentException("Text to find cannot be empty.");

            ProcessSearch(dataTable, searchBy, columnIndexOrName, textToFind, matchCase, useRegularExpression,
                matchEntireCellContents, allMatches, matchedRows);

            if (searchMode == DataTableFindOrReplaceModeEnum.FindAndReplace && matchedRows.Any())
            {
                ProcessReplace(matchedRows, dataTable, textToFind, textToReplaceWith, matchCase,
                    useRegularExpression, matchEntireCellContents);
            }

            MatchedRows.Set(context, matchedRows);
            status = $"Processed {matchedRows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            MatchedRows.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error processing data table: {ex.Message}");
        }
    }

    private void ProcessSearch(DataTable dataTable, DataTableSearchByEnum searchBy, string columnIndexOrName,
        string textToFind, bool matchCase, bool useRegularExpression, bool matchEntireCellContents,
        bool allMatches, List<DataRow> matchedRows)
    {
        switch (searchBy)
        {
            case DataTableSearchByEnum.Everywhere:
                SearchEverywhere(dataTable, textToFind, matchCase, useRegularExpression,
                    matchEntireCellContents, allMatches, matchedRows);
                break;

            case DataTableSearchByEnum.OnColumn:
                if (string.IsNullOrWhiteSpace(columnIndexOrName))
                    throw new ArgumentException("Column index or name cannot be empty when searching by column.");
                SearchOnColumn(dataTable, columnIndexOrName, textToFind, matchCase, useRegularExpression,
                    matchEntireCellContents, matchedRows);
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(searchBy));
        }
    }

    private void SearchEverywhere(DataTable dataTable, string textToFind, bool matchCase,
        bool useRegularExpression, bool matchEntireCellContents, bool allMatches, List<DataRow> matchedRows)
    {
        foreach (DataRow row in dataTable.Rows)
        {
            var rowMatched = false;
            foreach (DataColumn column in dataTable.Columns)
            {
                var cellValue = row[column];
                if (cellValue == null)
                    continue;

                var cellText = cellValue.ToString();
                if (CellMatches(cellText, textToFind, matchCase, useRegularExpression, matchEntireCellContents))
                {
                    matchedRows.Add(row);
                    rowMatched = true;
                    if (!allMatches)
                        break;
                }
            }
        }
    }

    private void SearchOnColumn(DataTable dataTable, string columnIndexOrName, string textToFind,
        bool matchCase, bool useRegularExpression, bool matchEntireCellContents, List<DataRow> matchedRows)
    {
        if (int.TryParse(columnIndexOrName, out int columnIndex))
        {
            foreach (DataRow row in dataTable.Rows)
            {
                var cellValue = row[columnIndex];
                if (cellValue == null)
                    continue;

                var cellText = cellValue.ToString();
                if (CellMatches(cellText, textToFind, matchCase, useRegularExpression, matchEntireCellContents))
                    matchedRows.Add(row);
            }
        }
        else
        {
            var column = dataTable.Columns[columnIndexOrName];
            if (column == null)
                throw new ArgumentException($"Column '{columnIndexOrName}' not found in the data table.");

            foreach (DataRow row in dataTable.Rows)
            {
                var cellValue = row[column];
                if (cellValue == null)
                    continue;

                var cellText = cellValue.ToString();
                if (CellMatches(cellText, textToFind, matchCase, useRegularExpression, matchEntireCellContents))
                    matchedRows.Add(row);
            }
        }
    }

    private bool CellMatches(string cellText, string textToFind, bool matchCase, bool useRegularExpression,
        bool matchEntireCellContents)
    {
        if (useRegularExpression)
        {
            var regexOptions = matchCase ? RegexOptions.None : RegexOptions.IgnoreCase;
            var regex = new Regex(textToFind, regexOptions);

            if (matchEntireCellContents)
                return regex.IsMatch(cellText) && regex.Match(cellText).Value == cellText;
            else
                return regex.IsMatch(cellText);
        }
        else
        {
            if (matchEntireCellContents)
            {
                return matchCase
                    ? cellText == textToFind
                    : cellText.Equals(textToFind, StringComparison.OrdinalIgnoreCase);
            }
            else
            {
                return matchCase
                    ? cellText.Contains(textToFind)
                    : cellText.IndexOf(textToFind, StringComparison.OrdinalIgnoreCase) >= 0;
            }
        }
    }

    private void ProcessReplace(List<DataRow> matchedRows, DataTable dataTable, string textToFind,
        string textToReplaceWith, bool matchCase, bool useRegularExpression, bool matchEntireCellContents)
    {
        foreach (var row in matchedRows)
        {
            foreach (DataColumn column in dataTable.Columns)
            {
                var cellValue = row[column];
                if (cellValue == null)
                    continue;

                var cellText = cellValue.ToString();

                if (useRegularExpression)
                {
                    var regexOptions = matchCase ? RegexOptions.None : RegexOptions.IgnoreCase;
                    var regex = new Regex(textToFind, regexOptions);

                    if (matchEntireCellContents)
                    {
                        if (regex.IsMatch(cellText) && regex.Match(cellText).Value == cellText)
                            row[column] = regex.Replace(cellText, textToReplaceWith);
                    }
                    else
                    {
                        if (regex.IsMatch(cellText))
                            row[column] = regex.Replace(cellText, textToReplaceWith);
                    }
                }
                else
                {
                    if (matchEntireCellContents)
                    {
                        if (matchCase)
                        {
                            if (cellText == textToFind)
                                row[column] = textToReplaceWith;
                        }
                        else
                        {
                            if (cellText.Equals(textToFind, StringComparison.OrdinalIgnoreCase))
                                row[column] = textToReplaceWith;
                        }
                    }
                    else
                    {
                        if (matchCase)
                        {
                            if (cellText.Contains(textToFind))
                                row[column] = cellText.Replace(textToFind, textToReplaceWith);
                        }
                        else
                        {
                            if (cellText.IndexOf(textToFind, StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                var index = cellText.IndexOf(textToFind, StringComparison.OrdinalIgnoreCase);
                                row[column] = cellText.Substring(0, index) + textToReplaceWith +
                                    cellText.Substring(index + textToFind.Length);
                            }
                        }
                    }
                }
            }
        }
    }
}
