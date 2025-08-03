using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Active Cell on Excel Worksheet")]
    [Description("Gets the address of the currently active cell in the active worksheet of an Excel instance.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Excel.svg")]
    public class GetActiveCellOnExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Active Cell Address")]
        [Description("Returns the address of the active cell (e.g., 'A1').")]
        public OutArgument<string> ActiveCellAddress { get; set; }


        [DisplayName("Active Cell Column Index")]
        [Description("Returns the column index of the active cell.")]
        public OutArgument<int> ActiveCellColumnIndex { get; set; }


        [DisplayName("Active Cell Row Index")]
        [Description("Returns the row index of the active cell.")]
        public OutArgument<int> ActiveCellRowIndex { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {

            try
            {
                var excelApp = ExcelApplication.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                var activeCell = excelApp.ActiveCell;

                if (activeCell == null)
                    throw new InvalidOperationException("No active cell found.");

                // Get the address of the active cell
                var activeCellAddress = activeCell.Address;

                // Get the column and row indices
                var activeCellColumnIndex = activeCell.Column;
                var activeCellRowIndex = activeCell.Row;

                ActiveCellAddress.Set(context, activeCellAddress);
                ActiveCellColumnIndex.Set(context, activeCellColumnIndex);
                ActiveCellRowIndex.Set(context, activeCellRowIndex);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Active Cell on Excel Worksheet succesfully retrieved");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error getting active cell: {ex.Message}");
            }
        }
    }
}