using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Row from Excel Worksheet")]
    [Description("Deletes a specific row from the active worksheet of an Excel instance.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Excel.svg")]
    public class DeleteRowFromExcelWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The index (1-based) of the row to delete.")]
        public InArgument<int> RowIndex { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                if (rowIndex < 1 || rowIndex > worksheet.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(RowIndex),
                        $"Row index must be between 1 and {worksheet.Rows.Count}.");


                ((Excel.Range)worksheet.Rows[rowIndex]).Delete();

                status = $"Successfully deleted row at index {rowIndex}.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error deleting row: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}