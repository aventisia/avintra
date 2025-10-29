using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Active Cell on Excel Worksheet")]
    [Description("Gets the address of the currently active cell in the specified Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetActiveCellOnExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet instance from which to get the active cell.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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
                var worksheet = WorksheetInstance.Get(context);

                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not available or invalid.");
                // Get the active cell on this worksheet
                Excel.Range activeCell = worksheet.Application.ActiveCell;

                if (activeCell == null)
                    throw new InvalidOperationException("No active cell found in the worksheet.");

                // Get the address of the active cell
                var activeCellAddress = activeCell.Address;
                
                // Get the column and row indices
                var activeCellColumnIndex = activeCell.Column;
                var activeCellRowIndex = activeCell.Row;

                ActiveCellAddress.Set(context, activeCellAddress);
                ActiveCellColumnIndex.Set(context, activeCellColumnIndex);
                ActiveCellRowIndex.Set(context, activeCellRowIndex);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Active cell on Excel worksheet retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error getting active cell: {ex.Message}");
            }
        }
    }
}