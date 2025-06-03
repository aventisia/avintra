using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Add New Worksheet")]
    [Description("Adds a new worksheet to the document of an Excel instance.")]
    public class AddNewWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the workbook.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [Category("Input")]
        [DisplayName("New Worksheet Name")]
        [Description("The name of the new worksheet.")]
        public InArgument<string> NewWorksheetName { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Add Worksheet As")]
        [Description("Specifies whether to add the worksheet as the first or last sheet.")]
        [DefaultValue(ExcelWorksheetPositionEnum.First)]
        public InArgument<ExcelWorksheetPositionEnum> AddWorksheetAs { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var newWorksheetName = NewWorksheetName.Get(context);
                var addWorksheetAs = AddWorksheetAs.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                Excel.Workbook workbook = excelApp.ActiveWorkbook;

                // Create a new worksheet
                Excel.Worksheet newSheet = workbook.Sheets.Add();

                // Set the name of the new worksheet
                if (!string.IsNullOrWhiteSpace(newWorksheetName))
                {
                    newSheet.Name = newWorksheetName;
                }
                else
                {
                    newSheet.Name = $"Sheet{workbook.Sheets.Count + 1}";
                }

                // Position the new worksheet
                switch (addWorksheetAs)
                {
                    case ExcelWorksheetPositionEnum.First:
                        newSheet.Move(Before: workbook.Sheets[1]);
                        break;

                    case ExcelWorksheetPositionEnum.Last:
                        newSheet.Move(After: workbook.Sheets[workbook.Sheets.Count]);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(addWorksheetAs));
                }

                status += $" Added new worksheet named '{newSheet.Name}'.";
            }
            catch (Exception ex)
            {
                status = $"Error adding new worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    // Enum for specifying the position of the new worksheet
    public enum ExcelWorksheetPositionEnum
    {
        [Description("First worksheet")]
        First,

        [Description("Last worksheet")]
        Last
    }
}