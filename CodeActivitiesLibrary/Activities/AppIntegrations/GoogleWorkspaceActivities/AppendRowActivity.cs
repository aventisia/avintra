using CodeActivitiesLibrary.Extensions;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.AppIntegrations.GoogleWorkspaceActivities
{
    [DisplayName("Append Row to Google Sheet")]
    [Description("Appends a single row of data to a Google Sheet at the next available row in the specified range.")]
   
    public class AppendRowActivity : BaseCodeActivity
    {
        // Input Arguments

        [RequiredArgument]
        [DisplayName("Sheets Service")]
        [Description("The authenticated SheetsService instance (from 'Create Google Sheets Service Instance' activity).")]
        public InArgument<SheetsService> SheetsService { get; set; }

        [RequiredArgument]
        [DisplayName("Spreadsheet ID")]
        [Description("The ID of the Google Spreadsheet (from the URL: https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit).")]
        public InArgument<string> SpreadsheetId { get; set; }

        [RequiredArgument]
        [DisplayName("Sheet Name")]
        [Description("The name of the sheet tab (e.g., 'Sheet1').")]
        public InArgument<string> SheetName { get; set; }

        [DisplayName("Range")]
        [Description("Optional: The column range to append to (e.g., 'A:E'). If not specified, uses full row.")]
        public InArgument<string> Range { get; set; }

        [RequiredArgument]
        [DisplayName("Row Values")]
        [Description("The list of values to append as a new row (e.g., { 'John', 'Doe', 'john@example.com' }).")]
        public InArgument<List<object>> RowValues { get; set; }

        [DisplayName("Run Delay (ms)")]
        [Description("Optional delay in milliseconds before executing. Helps avoid rate limits.")]
        public InArgument<int> RunDelay { get; set; } = 0;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                var sheetsService = SheetsService.Get(context);
                var spreadsheetId = SpreadsheetId.Get(context);
                var sheetName = SheetName.Get(context);
                var rangeInput = Range.Get(context);
                var rowValues = RowValues.Get(context);
                var runDelay = RunDelay.Get(context);

                // Apply delay
                if (runDelay > 0)
                    Thread.Sleep(runDelay);

                // Validate inputs
                if (sheetsService == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "SheetsService is null. Did you create the service instance?");
                    return;
                }

                if (string.IsNullOrWhiteSpace(spreadsheetId))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Spreadsheet ID is null or empty.");
                    return;
                }

                if (string.IsNullOrWhiteSpace(sheetName))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Sheet Name is null or empty.");
                    return;
                }

                if (rowValues == null || rowValues.Count == 0)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Row Values is null or empty.");
                    return;
                }

                // Build range: "Sheet1!A:E" or just "Sheet1"
                string range = string.IsNullOrWhiteSpace(rangeInput)
                    ? $"{sheetName}"
                    : $"{sheetName}!{rangeInput}";

                // Create ValueRange object
                var valueRange = new ValueRange
                {
                    Values = new List<IList<object>> { rowValues } // Wrap single row
                };

                // Create append request
                var appendRequest = sheetsService.Spreadsheets.Values.Append(valueRange, spreadsheetId, range);
                appendRequest.ValueInputOption = SpreadsheetsResource.ValuesResource.AppendRequest.ValueInputOptionEnum.USERENTERED;

                // Execute
                var appendResponse = appendRequest.Execute();

                // Success
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully appended row to '{sheetName}' in spreadsheet '{spreadsheetId}'. Updates range: {appendResponse.Updates.UpdatedRange}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error appending row to Google Sheet: {ex.Message}");
                Console.WriteLine(ex.StackTrace);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error appending row: {ex.Message}");
            }
        }
    }
}