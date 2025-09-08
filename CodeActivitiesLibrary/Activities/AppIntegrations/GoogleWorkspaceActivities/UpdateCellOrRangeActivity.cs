using CodeActivitiesLibrary.Extensions;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Collections.Generic;

namespace CodeActivitiesLibrary.AppIntegrations.GoogleWorkspaceActivities
{
    [DisplayName("Update Cell or Range in Google Sheet")]
    [Description("Updates a specific cell or range in a Google Sheet with the provided values.")]
    
    public class UpdateCellOrRangeActivity : BaseCodeActivity
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
        [Description("The cell or range to update (e.g., 'A1', 'A1:B2').")]
        public InArgument<string> Range { get; set; }

        [RequiredArgument]
        [DisplayName("Values")]
        [Description("The list of values to write. For single row: ['A1','B1']. For multiple rows, use a different activity.")]
        public InArgument<List<object>> Values { get; set; }

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
                var values = Values.Get(context);
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

                if (values == null || values.Count == 0)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Values list is null or empty.");
                    return;
                }

                // Build full range: "Sheet1!A1:B2"
                string range = $"{sheetName}!{rangeInput}";

                // Create ValueRange object
                var valueRange = new ValueRange
                {
                    Values = new List<IList<object>> { values } // Wrap as single row
                };

                // Create update request
                var updateRequest = sheetsService.Spreadsheets.Values.Update(valueRange, spreadsheetId, range);
                updateRequest.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.USERENTERED;

                // Optional: Use RAW if you don't want formula parsing
                // updateRequest.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.RAW;

                // Execute update
                var updateResponse = updateRequest.Execute();

                // Success
                IsSuccess.Set(context, true);
                StatusMessage.Set(context,
                    $"Successfully updated range '{range}' in spreadsheet '{spreadsheetId}'. " +
                    $"Updated {updateResponse.UpdatedCells} cell(s).");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating Google Sheet: {ex.Message}");
                Console.WriteLine(ex.StackTrace);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error updating cell or range: {ex.Message}");
            }
        }
    }
}
