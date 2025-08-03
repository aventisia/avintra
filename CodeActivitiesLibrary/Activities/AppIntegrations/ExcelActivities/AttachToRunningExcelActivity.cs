using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Attach to Running Excel Workbook")]
    [Description("Attaches to a running Excel instance and opens the specified workbook if not already open.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/Excel.svg")]
    public class AttachToRunningExcelActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The running Excel Application object to attach to.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path of the Excel file to open or attach to in the running Excel instance.")]
        public InArgument<string> FilePath { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var filePath = FilePath.Get(context);

                if (excelApp == null)
                    throw new InvalidOperationException("Excel Application is null.");

                var wb = excelApp.Workbooks.Open(filePath);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error attaching to running Excel: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

            StatusMessage.Set(context, status);
        }
    }
}