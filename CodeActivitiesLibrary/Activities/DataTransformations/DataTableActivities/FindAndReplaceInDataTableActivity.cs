using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Find or Replace in Data Table")]
    [Description("Finds and/or replaces data table values.")]
    public sealed class FindAndReplaceInDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table to process.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Search Mode")]
        [Description("Specifies whether to find or find and replace values.")]
        [DefaultValue(DataTableFindOrReplaceModeEnum.Find)]
        public InArgument<DataTableFindOrReplaceModeEnum> SearchMode { get; set; }


        [DisplayName("Text to Find")]
        [Description("The value to find in the data table.")]
        public InArgument<string> TextToFind { get; set; }


        [DisplayName("Text to Replace With")]
        [Description("The value to replace with (required if 'Search Mode' is 'Find and Replace').")]
        [RenderIfCondition(nameof(SearchMode), DataTableFindOrReplaceModeEnum.FindAndReplace)]
        public InArgument<string> TextToReplaceWith { get; set; }


        [DisplayName("All Matches")]
        [Description("If true, processes all occurrences. If false, processes only the first occurrence.")]
        public InArgument<bool> AllMatches { get; set; }


        [DisplayName("Find Using a Regular Expression")]
        [Description("If true, uses regular expressions for matching.")]
        public InArgument<bool> UseRegularExpression { get; set; }


        [DisplayName("Match Case")]
        [Description("If true, performs a case-sensitive search.")]
        public InArgument<bool> MatchCase { get; set; }


        [DisplayName("Match Entire Cell Contents")]
        [Description("If true, matches only cells that contain exactly the specified text.")]
        public InArgument<bool> MatchEntireCellContents { get; set; }


        [DisplayName("Search By")]
        [Description("Specifies how to search the data table.")]
        [DefaultValue(DataTableSearchByEnum.Everywhere)]
        public InArgument<DataTableSearchByEnum> SearchBy { get; set; }


        [DisplayName("Column Index or Name")]
        [Description("The column index or name to search within (required if 'Search By' is 'On Column').")]
        [RenderIfCondition(nameof(SearchBy), DataTableSearchByEnum.OnColumn)]
        public InArgument<string> ColumnIndexOrName { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Matched Rows")]
        [Description("Returns the rows that match the search criteria.")]
        public OutArgument<List<DataRow>> MatchedRows { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var matchedRows = new List<DataRow>();

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

                switch (searchBy)
                {
                    case DataTableSearchByEnum.Everywhere:
                        foreach (DataRow row in dataTable.Rows)
                        {
                            var matchFound = false;

                            foreach (DataColumn column in dataTable.Columns)
                            {
                                var cellValue = row[column];

                                if (cellValue == null)
                                    continue;

                                var cellText = cellValue.ToString();

                                if (useRegularExpression)
                                {
                                    // Implement regex matching here
                                    // Example: Regex.IsMatch(cellText, textToFind)
                                    throw new NotImplementedException("Regular expression support not implemented.");
                                }
                                else
                                {
                                    if (matchEntireCellContents)
                                    {
                                        if (matchCase)
                                            matchFound = cellText == textToFind;
                                        else
                                            matchFound = cellText.Equals(textToFind,
                                                StringComparison.OrdinalIgnoreCase);
                                    }
                                    else
                                    {
                                        if (matchCase)
                                            matchFound = cellText.Contains(textToFind);
                                        else
                                            matchFound = cellText.IndexOf(textToFind,
                                                StringComparison.OrdinalIgnoreCase) >= 0;
                                    }
                                }

                                if (matchFound)
                                {
                                    matchedRows.Add(row);

                                    if (!allMatches)
                                        break;
                                }
                            }
                        }

                        break;

                    case DataTableSearchByEnum.OnColumn:
                        if (string.IsNullOrWhiteSpace(columnIndexOrName))
                            throw new ArgumentException(
                                "Column index or name cannot be empty when searching by column.");

                        int columnIndex;
                        if (int.TryParse(columnIndexOrName, out columnIndex))
                        {
                            foreach (DataRow row in dataTable.Rows)
                            {
                                var cellValue = row[columnIndex];
                                if (cellValue == null)
                                    continue;

                                var cellText = cellValue.ToString();

                                if (useRegularExpression)
                                {
                                    var regexOptions = matchCase
                                        ? System.Text.RegularExpressions.RegexOptions.None
                                        : System.Text.RegularExpressions.RegexOptions.IgnoreCase;
                                    var regex = new System.Text.RegularExpressions.Regex(textToFind, regexOptions);

                                    if (matchEntireCellContents)
                                    {
                                        if (regex.IsMatch(cellText) && regex.Match(cellText).Value == cellText)
                                            matchedRows.Add(row);
                                    }
                                    else
                                    {
                                        if (regex.IsMatch(cellText))
                                            matchedRows.Add(row);
                                    }
                                }
                                else
                                {
                                    if (matchEntireCellContents)
                                    {
                                        if (matchCase)
                                        {
                                            if (cellText == textToFind)
                                                matchedRows.Add(row);
                                        }
                                        else
                                        {
                                            if (cellText.Equals(textToFind, StringComparison.OrdinalIgnoreCase))
                                                matchedRows.Add(row);
                                        }
                                    }
                                    else
                                    {
                                        if (matchCase)
                                        {
                                            if (cellText.Contains(textToFind))
                                                matchedRows.Add(row);
                                        }
                                        else
                                        {
                                            if (cellText.IndexOf(textToFind, StringComparison.OrdinalIgnoreCase) >= 0)
                                                matchedRows.Add(row);
                                        }
                                    }
                                }
                            }
                        }
                        else
                        {
                            var column = dataTable.Columns[columnIndexOrName];
                            if (column == null)
                                throw new ArgumentException(
                                    $"Column '{columnIndexOrName}' not found in the data table.");

                            foreach (DataRow row in dataTable.Rows)
                            {
                                var cellValue = row[column];
                                if (cellValue == null)
                                    continue;

                                var cellText = cellValue.ToString();

                                if (useRegularExpression)
                                {
                                    var regexOptions = matchCase
                                        ? System.Text.RegularExpressions.RegexOptions.None
                                        : System.Text.RegularExpressions.RegexOptions.IgnoreCase;
                                    var regex = new System.Text.RegularExpressions.Regex(textToFind, regexOptions);

                                    if (matchEntireCellContents)
                                    {
                                        if (regex.IsMatch(cellText) && regex.Match(cellText).Value == cellText)
                                            matchedRows.Add(row);
                                    }
                                    else
                                    {
                                        if (regex.IsMatch(cellText))
                                            matchedRows.Add(row);
                                    }
                                }
                                else
                                {
                                    if (matchEntireCellContents)
                                    {
                                        if (matchCase)
                                        {
                                            if (cellText == textToFind)
                                                matchedRows.Add(row);
                                        }
                                        else
                                        {
                                            if (cellText.Equals(textToFind, StringComparison.OrdinalIgnoreCase))
                                                matchedRows.Add(row);
                                        }
                                    }
                                    else
                                    {
                                        if (matchCase)
                                        {
                                            if (cellText.Contains(textToFind))
                                                matchedRows.Add(row);
                                        }
                                        else
                                        {
                                            if (cellText.IndexOf(textToFind, StringComparison.OrdinalIgnoreCase) >= 0)
                                                matchedRows.Add(row);
                                        }
                                    }
                                }
                            }
                        }

                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(searchBy));
                }

                // Perform replacement if required
                if (searchMode == DataTableFindOrReplaceModeEnum.FindAndReplace && matchedRows.Any())
                    foreach (var row in matchedRows)
                        foreach (DataColumn column in dataTable.Columns)
                        {
                            var cellValue = row[column];
                            if (cellValue == null)
                                continue;

                            var cellText = cellValue.ToString();

                            if (useRegularExpression)
                            {
                                var regexOptions = matchCase
                                    ? System.Text.RegularExpressions.RegexOptions.None
                                    : System.Text.RegularExpressions.RegexOptions.IgnoreCase;
                                var regex = new System.Text.RegularExpressions.Regex(textToFind, regexOptions);

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
                                            row[column] = textToReplaceWith;
                                    }
                                    else
                                    {
                                        if (cellText.IndexOf(textToFind, StringComparison.OrdinalIgnoreCase) >= 0)
                                            row[column] = textToReplaceWith;
                                    }
                                }
                            }
                        }

                status = $"Processed {matchedRows.Count} rows.";
            }
            catch (Exception ex)
            {
                status = $"Error processing data table: {ex.Message}";
            }

            MatchedRows.Set(context, matchedRows);
            StatusMessage.Set(context, status);
        }
    }
}