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
    [DisplayName("Read Google Sheet Range")]
    [Description("Reads data from a specified range in a Google Sheet using the Sheets API.")]

    public class ReadGoogleSheetRangeActivity : BaseCodeActivity
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
        [Description("The name of the sheet tab (e.g., 'Sheet1', 'Data').")]
        public InArgument<string> SheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range")]
        [Description("The cell range to read (e.g., 'A1:B10'). Use empty string or 'A1' for full column detection.")]
        public InArgument<string> Range { get; set; }

        [DisplayName("Run Delay (ms)")]
        [Description("Optional delay in milliseconds before executing the request. Helps avoid rate limits.")]
        public InArgument<int> RunDelay { get; set; } = 0;

        // Output Arguments

        [DisplayName("Read Data")]
        [Description("The 2D list of values read from the sheet (IList<IList<object>>). Each inner list is a row.")]
        public OutArgument<IList<IList<object>>> ReadData { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs
                var sheetsService = SheetsService.Get(context);
                var spreadsheetId = SpreadsheetId.Get(context);
                var sheetName = SheetName.Get(context);
                var rangeInput = Range.Get(context);
                var runDelay = RunDelay.Get(context);

                // Apply delay
                if (runDelay > 0)
                    Thread.Sleep(runDelay);

                // Validate inputs
                if (sheetsService == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "SheetsService is null. Did you initialize it?");
                    ReadData.Set(context, null);
                    return;
                }

                if (string.IsNullOrWhiteSpace(spreadsheetId))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Spreadsheet ID is null or empty.");
                    ReadData.Set(context, null);
                    return;
                }

                if (string.IsNullOrWhiteSpace(sheetName))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Sheet Name is null or empty.");
                    ReadData.Set(context, null);
                    return;
                }

                // Build range: "Sheet1!A1:B10"
                string range = string.IsNullOrWhiteSpace(rangeInput)
                    ? $"{sheetName}!A1"  // Default to A1 if range not provided
                    : $"{sheetName}!{rangeInput}";

                // Make API request
                SpreadsheetsResource.ValuesResource.GetRequest request =
                    sheetsService.Spreadsheets.Values.Get(spreadsheetId, range);

                ValueRange response = request.Execute();

                IList<IList<object>> values = response?.Values;

                if (values != null && values.Count > 0)
                {
                    ReadData.Set(context, values);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully read {values.Count} row(s) from '{sheetName}' in spreadsheet '{spreadsheetId}'.");
                }
                else
                {
                    ReadData.Set(context, values ?? new List<IList<object>>());
                    IsSuccess.Set(context, true); // No data is not an error
                    StatusMessage.Set(context, $"No data found in range '{range}'.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading Google Sheet: {ex.Message}");
                Console.WriteLine(ex.StackTrace);

                ReadData.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading Google Sheet: {ex.Message}");
            }
        }
    }
}