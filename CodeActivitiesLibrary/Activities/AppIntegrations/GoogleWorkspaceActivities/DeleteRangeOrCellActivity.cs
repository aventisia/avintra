using CodeActivitiesLibrary.Extensions;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.AppIntegrations.GoogleWorkspaceActivities
{
    [DisplayName("Delete Range or Cell in Google Sheet")]
    [Description("Deletes (clears) the values from a specified cell or range in a Google Sheet. Formatting, formulas, and comments are preserved.")]
    public class DeleteRangeOrCellActivity : BaseCodeActivity
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

        [RequiredArgument]
        [DisplayName("Range")]
        [Description("The cell or range to delete values from (e.g., 'A1', 'A1:B10').")]
        public InArgument<string> Range { get; set; }

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
                var rangeInput = Range.Get(context)?.Trim();
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

                if (string.IsNullOrWhiteSpace(rangeInput))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Range is null or empty.");
                    return;
                }

                // Build full range: "Sheet1!A1:B10"
                string fullRange = $"{sheetName}!{rangeInput}";

                // Prepare clear request (Google API: "Clear" = delete values)
                var requestBody = new ClearValuesRequest();
                var clearRequest = sheetsService.Spreadsheets.Values.Clear(requestBody, spreadsheetId, fullRange);

                // Execute deletion (value clearing)
                ClearValuesResponse response = clearRequest.Execute();

                // Success
                IsSuccess.Set(context, true);
                StatusMessage.Set(context,
                    $"Successfully deleted values from range '{fullRange}' in spreadsheet '{spreadsheetId}'. " +
                    $"Cleared cell(s) in range: {response.ClearedRange}.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting range in Google Sheet: {ex.Message}");
                Console.WriteLine(ex.StackTrace);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting range: {ex.Message}");
            }
        }
    }
}